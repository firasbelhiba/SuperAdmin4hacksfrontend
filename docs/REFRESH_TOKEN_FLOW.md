# Flux de Rafraîchissement du Token d'Accès

Ce document décrit le processus complet de rafraîchissement automatique du token d'accès dans l'application, incluant toutes les fonctions, hooks et composants impliqués.

---

## 1️⃣ Détection de l'Expiration Imminente

### Description
Le système surveille en permanence l'expiration du token d'accès. Lorsque le token arrive à 2 minutes de son expiration (sur une durée de vie totale de 15 minutes), le processus de rafraîchissement est automatiquement déclenché.

### Hook Concerné
- **`useTokenRefresh`** (`src/hooks/useTokenRefresh.ts`)

### Logique
```typescript
const REFRESH_BUFFER_MS = 2 * 60 * 1000; // 2 minutes avant expiration
```

Le hook utilise un `useEffect` qui calcule le temps restant avant expiration :
```typescript
const expiresAt = new Date(session.user.tokenExpiresAt).getTime();
const now = Date.now();
const timeUntilRefresh = expiresAt - now - REFRESH_BUFFER_MS;
```

Si le temps restant est positif, un `setTimeout` est programmé pour déclencher le rafraîchissement au moment approprié.

### Composants Utilisant ce Hook
- **`AuthContext`** (`src/context/AuthContext.tsx`) - Intègre le hook pour tous les utilisateurs authentifiés

---

## 2️⃣ Appel au Endpoint de Rafraîchissement

### Description
Lorsque le timer expire, le hook `useTokenRefresh` appelle la fonction `refreshToken()` qui envoie une requête POST au endpoint Next.js `/api/auth/refresh`.

### Fonction Concernée
- **`refreshToken()`** dans `useTokenRefresh` (`src/hooks/useTokenRefresh.ts`)

### Logique
```typescript
const refreshToken = useCallback(async () => {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // Important : envoie les cookies HttpOnly
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    
    // Mise à jour de la session NextAuth avec le nouveau token
    await update({
      ...session,
      user: {
        ...session.user,
        token: data.accessToken,
        tokenExpiresAt: data.accessTokenExpiresAt,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    signOut({ callbackUrl: '/signin' });
  }
}, [session, update]);
```

### Point Clé
L'option `credentials: 'include'` est cruciale car elle permet d'envoyer automatiquement le cookie HttpOnly contenant le refresh token au serveur.

---

## 3️⃣ Transfert de la Requête au Backend

### Description
Le endpoint Next.js `/api/auth/refresh` agit comme un proxy. Il reçoit la requête du client (avec les cookies), extrait le refresh token du cookie, et transmet la requête au backend.

### Route Concernée
- **`/api/auth/refresh/route.ts`** (`src/app/api/auth/refresh/route.ts`)

### Logique
```typescript
export async function POST(req: NextRequest) {
  try {
    // Extraction du cookie contenant le refresh token
    const cookieHeader = req.headers.get('cookie');

    // Appel au backend avec le cookie
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Création de la réponse avec les nouveaux cookies
    const nextResponse = NextResponse.json(data);

    // Transfert des Set-Cookie du backend vers le client
    const setCookieHeaders = response.headers.getSetCookie();
    setCookieHeaders.forEach((cookie) => {
      nextResponse.headers.append('Set-Cookie', cookie);
    });

    return nextResponse;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Rôle du Proxy
Ce proxy Next.js est nécessaire car :
- Il permet de transmettre les cookies HttpOnly au backend
- Il reçoit les nouveaux cookies du backend et les transmet au navigateur
- Il contourne les limitations CORS pour les cookies cross-domain

---

## 4️⃣ Traitement Backend

### Description
Le backend reçoit la requête avec le refresh token, valide ce token, génère un nouveau couple access token / refresh token, et renvoie la réponse.

### Endpoint Backend
- **`POST https://fourhacks.hedera-quests.com/api/v1/auth/refresh`**

### Processus Backend
1. **Extraction** : Le backend lit le cookie `refreshToken`
2. **Validation** : Vérifie que le refresh token est valide et non expiré
3. **Vérification** : Consulte sa base de données pour confirmer que le token n'a pas été révoqué
4. **Génération** : Crée un nouveau access token (15 min) et un nouveau refresh token (7 jours)
5. **Rotation** : Invalide l'ancien refresh token (sécurité token rotation)
6. **Réponse** : Renvoie le nouvel access token dans le JSON et le nouveau refresh token dans un cookie HttpOnly

### Réponse Type
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "accessTokenExpiresAt": "2026-01-14T15:30:00.000Z",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Cookie Set-Cookie
```
Set-Cookie: refreshToken=xyz789...; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800
```

---

## 5️⃣ Réception et Stockage du Nouveau Token

### Description
Le endpoint Next.js reçoit la réponse du backend, transfère le nouveau cookie HttpOnly au navigateur, et renvoie les données JSON au client.

### Traitement
- Les headers `Set-Cookie` du backend sont automatiquement appliqués par le navigateur
- Le nouveau refresh token est stocké dans le cookie HttpOnly (invisible au JavaScript)
- Les données JSON (access token, expiration, user info) sont renvoyées au hook `useTokenRefresh`

---

## 6️⃣ Mise à Jour de la Session NextAuth

### Description
Le hook `useTokenRefresh` reçoit les nouvelles données et met à jour la session NextAuth avec le nouveau token d'accès.

### Fonction Concernée
- **`update()`** de NextAuth (`useSession` hook)

### Logique
```typescript
await update({
  ...session,
  user: {
    ...session.user,
    token: data.accessToken,
    tokenExpiresAt: data.accessTokenExpiresAt,
  },
});
```

### Impact
- La session NextAuth est mise à jour en temps réel
- Le nouveau token est accessible via `useSession()` dans toute l'application
- L'intercepteur Axios récupère automatiquement le nouveau token pour les prochaines requêtes

---

## 7️⃣ Synchronisation avec l'Intercepteur Axios

### Description
Après la mise à jour de la session, l'`AuthContext` synchronise automatiquement le nouveau token avec l'intercepteur Axios, qui l'utilisera pour toutes les requêtes HTTP futures.

### Composant Concerné
- **`AuthContext`** (`src/context/AuthContext.tsx`)

### Logique
```typescript
useEffect(() => {
  if (session?.user?.token) {
    setApiAuthToken(session.user.token);
  }
}, [session?.user?.token]);
```

### Fonction d'Interception
- **`setApiAuthToken()`** (`src/lib/api.ts`)

```typescript
export const setApiAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
```

### Résultat
Toutes les requêtes HTTP futures utiliseront automatiquement le nouveau token d'accès dans le header `Authorization: Bearer <token>`.

---

## 8️⃣ Reprogrammation du Prochain Rafraîchissement

### Description
Après la mise à jour réussie de la session, le `useEffect` de `useTokenRefresh` se déclenche à nouveau, détecte la nouvelle date d'expiration, et programme le prochain rafraîchissement.

### Hook Concerné
- **`useTokenRefresh`** (`src/hooks/useTokenRefresh.ts`)

### Logique
Le `useEffect` a `session?.user?.tokenExpiresAt` comme dépendance. Lorsque cette valeur change, il recalcule le prochain moment de rafraîchissement :

```typescript
useEffect(() => {
  if (!session?.user?.tokenExpiresAt) return;

  const expiresAt = new Date(session.user.tokenExpiresAt).getTime();
  const now = Date.now();
  const timeUntilRefresh = expiresAt - now - REFRESH_BUFFER_MS;

  if (timeUntilRefresh > 0) {
    const timeoutId = setTimeout(() => {
      refreshToken();
    }, timeUntilRefresh);

    return () => clearTimeout(timeoutId);
  }
}, [session?.user?.tokenExpiresAt, refreshToken]);
```

### Cycle Continu
Ce mécanisme crée un cycle automatique :
- Token valide 15 minutes
- Rafraîchissement à 13 minutes
- Nouveau token valide 15 minutes
- Rafraîchissement à 13 minutes
- Et ainsi de suite...

---

## 🔒 Sécurité : Token Rotation

### Principe
Chaque fois qu'un refresh token est utilisé, le backend génère un nouveau refresh token et invalide l'ancien. Cette technique s'appelle **Token Rotation**.

### Avantages
1. **Limitation de la fenêtre d'attaque** : Un refresh token volé ne peut être utilisé qu'une seule fois
2. **Détection d'intrusion** : Si l'ancien token est réutilisé, le backend détecte une attaque potentielle
3. **Révocation automatique** : En cas de détection d'attaque, tous les tokens de l'utilisateur peuvent être révoqués

### Scénario d'Attaque Détectée
1. L'utilisateur légitime rafraîchit son token à `T0` → reçoit `refreshToken_v2`
2. Un attaquant utilise `refreshToken_v1` volé à `T1` → Backend détecte que ce token a déjà été utilisé
3. Le backend révoque **tous** les tokens de l'utilisateur
4. L'utilisateur légitime et l'attaquant sont déconnectés
5. L'utilisateur doit se reconnecter avec email/password

---

## 🔐 Sécurité : Cookie HttpOnly

### Configuration du Cookie
```
Set-Cookie: refreshToken=xyz789...;
  HttpOnly;          // Inaccessible au JavaScript (protection XSS)
  Secure;            // Transmis uniquement en HTTPS
  SameSite=None;     // Permet l'envoi cross-domain
  Path=/;            // Valide pour tous les endpoints
  Max-Age=604800     // 7 jours en secondes
```

### Protection XSS
Le flag `HttpOnly` empêche tout script JavaScript malveillant d'accéder au refresh token, même en cas d'injection XSS réussie sur le site.

### Flux Cross-Domain
Puisque le frontend est sur `localhost:3000` et le backend sur `fourhacks.hedera-quests.com`, la configuration suivante est requise :
- Cookie : `SameSite=None; Secure`
- CORS Backend : `credentials: true`
- Fetch Client : `credentials: 'include'`

---

## 📊 Récapitulatif des Composants

### Hooks
- **`useTokenRefresh`** : Surveille l'expiration et déclenche le rafraîchissement
- **`useSession`** : Fournit l'accès à la session NextAuth (from next-auth/react)

### Routes Next.js
- **`/api/auth/refresh/route.ts`** : Proxy pour transférer les cookies entre client et backend

### Contextes
- **`AuthContext`** : Intègre `useTokenRefresh` et synchronise avec Axios

### Services
- **`setApiAuthToken()`** (`src/lib/api.ts`) : Configure l'intercepteur Axios

### Backend
- **`POST /api/v1/auth/refresh`** : Endpoint backend qui valide et renouvelle les tokens

---

## 🚀 Flux Complet en Résumé

```
[Navigateur] 
    ↓ (13 min après login)
[useTokenRefresh détecte expiration imminente]
    ↓
[refreshToken() appelée]
    ↓
[POST /api/auth/refresh avec credentials: include]
    ↓
[Route Next.js extrait cookie et appelle backend]
    ↓
[POST backend /api/v1/auth/refresh]
    ↓
[Backend valide refresh token]
    ↓
[Backend génère nouveaux tokens]
    ↓
[Backend invalide ancien refresh token (rotation)]
    ↓
[Backend renvoie: JSON (access token) + Set-Cookie (refresh token)]
    ↓
[Route Next.js transfère Set-Cookie au navigateur]
    ↓
[Navigateur stocke nouveau cookie HttpOnly]
    ↓
[useTokenRefresh reçoit nouveau access token]
    ↓
[update() met à jour session NextAuth]
    ↓
[useEffect détecte changement de session]
    ↓
[setApiAuthToken() met à jour Axios]
    ↓
[useEffect reprogramme prochain rafraîchissement]
    ↓
[Cycle continue...]
```

---

## ⚠️ Points d'Attention

### 1. Configuration Backend Requise
Le backend doit configurer les cookies avec les bons paramètres :
```javascript
res.cookie('refreshToken', token, {
  httpOnly: true,
  secure: true,        // HTTPS uniquement
  sameSite: 'none',    // Cross-domain
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 jours
});
```

### 2. CORS Backend
Le backend doit accepter les requêtes avec credentials :
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### 3. Gestion des Erreurs
Si le rafraîchissement échoue (refresh token expiré, révoqué, ou invalide), l'utilisateur est automatiquement déconnecté :
```typescript
catch (error) {
  console.error('Token refresh error:', error);
  signOut({ callbackUrl: '/signin' });
}
```

### 4. Timing Critique
Le buffer de 2 minutes avant expiration assure qu'il y a suffisamment de temps pour :
- Détecter l'expiration
- Envoyer la requête de rafraîchissement
- Recevoir la réponse
- Mettre à jour la session

Sans ce buffer, des requêtes pourraient échouer avec un token expiré pendant le processus de rafraîchissement.

---

## 📝 Conclusion

Ce système de rafraîchissement automatique offre :
- ✅ **Transparence** : L'utilisateur reste connecté sans interruption
- ✅ **Sécurité** : Tokens courte durée + rotation + HttpOnly
- ✅ **Résilience** : Détection et réaction aux erreurs
- ✅ **Performance** : Rafraîchissement proactif évite les délais
- ✅ **Maintenabilité** : Architecture claire et séparation des responsabilités
