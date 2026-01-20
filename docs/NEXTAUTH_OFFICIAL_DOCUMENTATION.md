# NextAuth — Détail des Fichiers et Options

## Table des Matières
1. [Concepts Fondamentaux](#concepts-fondamentaux)
   - [Extensions de Types (declare module)](#extensions-de-types-declare-module)
   - [Providers - Fournisseurs d'authentification](#providers---fournisseurs-dauthentification)
   - [Callbacks - Interception du flux](#callbacks---interception-du-flux)
   - [JWT vs Session](#jwt-vs-session)
   - [Options Additionnelles](#options-additionnelles)
2. [Provider](#provider)
3. [authOptions](#authoptions)
4. [route.ts ([...nextauth])](#routets-nextauth)
5. [src/app/layout.tsx](#srcapplayouttsx)

---

## Concepts Fondamentaux

Cette section explique en profondeur les concepts clés de NextAuth que vous devez maîtriser pour configurer correctement votre authentification.

### Extensions de Types (declare module)

#### Pourquoi étendre les types NextAuth ?

NextAuth utilise TypeScript et fournit des interfaces de base pour `User`, `Session` et `JWT`. Cependant, ces interfaces par défaut ne contiennent que quelques propriétés standard :

- **User** : `name`, `email`, `image`
- **Session** : `user`, `expires`
- **JWT** : `name`, `email`, `picture`, `sub`

Dans une application réelle, vous avez besoin de propriétés supplémentaires comme `id`, `role`, `username`, `accessToken`, etc. C'est là qu'intervient l'extension de types.

#### Comment étendre les types ?

Utilisez `declare module` pour augmenter les interfaces NextAuth :

```typescript
// Dans votre fichier auth-options.ts ou types/next-auth.d.ts

declare module "next-auth" {
  interface User {
    id: string
    email: string
    username: string
    name: string
    role: "user" | "admin" | "moderator"
    image?: string
    isEmailVerified?: boolean
    accessToken: string
    accessTokenExpires: number
  }

  interface Session {
    user: User
    accessToken: string
    error?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    email: string
    username: string
    name: string
    role: string
    image?: string
    isEmailVerified?: boolean
    accessToken: string
    accessTokenExpires: number
    error?: string
  }
}
```

#### Les trois interfaces principales

**1. User (next-auth)**
- **Quand** : Retourné par la fonction `authorize()` du provider
- **Où** : C'est l'objet que vous créez après validation des credentials
- **Contenu** : Toutes les données utilisateur + accessToken
- **Cycle de vie** : Existe uniquement lors de la connexion initiale

**2. Session (next-auth)**
- **Quand** : Accessible via `useSession()` côté client
- **Où** : Disponible dans tous les composants qui utilisent `useSession()`
- **Contenu** : Données user + accessToken pour les requêtes API
- **Cycle de vie** : Persiste pendant toute la durée de la session

**3. JWT (next-auth/jwt)**
- **Quand** : Géré par NextAuth en interne
- **Où** : Circule entre `jwt()` callback et `session()` callback
- **Contenu** : Toutes les données à persister (cryptées avec NEXTAUTH_SECRET)
- **Cycle de vie** : Stocké dans un cookie crypté côté client

#### Flow des données

```
┌─────────────────────────────────────────────────────────────┐
│  1. CONNEXION                                                │
│  signIn() → authorize() → Return User object                │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. JWT CALLBACK                                             │
│  User data → jwt() callback → Merge into JWT token          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. JWT STOCKÉ                                               │
│  JWT token → Encrypted → Stored in cookie                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  4. SESSION CALLBACK                                         │
│  JWT token → session() callback → Build Session object      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  5. CLIENT ACCESS                                            │
│  Session object → useSession() → Available in components    │
└─────────────────────────────────────────────────────────────┘
```

#### Bonnes pratiques

1. **Ne pas exposer de secrets** : Ne mettez jamais de données sensibles (mots de passe, refresh tokens, secrets) dans `Session` car elle est accessible côté client
2. **Type safety** : Étendez toujours les types pour éviter les erreurs TypeScript
3. **Cohérence** : Assurez-vous que les propriétés de `User`, `JWT` et `Session` sont cohérentes
4. **Documentation** : Documentez chaque propriété personnalisée pour faciliter la maintenance

---

### Providers - Fournisseurs d'authentification

#### Qu'est-ce qu'un Provider ?

Un **Provider** dans NextAuth définit une méthode d'authentification. C'est le mécanisme qui valide l'identité de l'utilisateur et retourne ses informations.

#### Types de Providers

**1. OAuth Providers (Recommandé pour la production)**

Les providers OAuth permettent l'authentification via des services tiers :

```typescript
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import FacebookProvider from "next-auth/providers/facebook"

providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_ID!,
    clientSecret: process.env.GITHUB_SECRET!,
  }),
]
```

**Avantages** :
- Sécurité renforcée (pas de gestion de mots de passe)
- UX améliorée (connexion en un clic)
- Pas de stockage de credentials sensibles
- Authentification multi-facteurs gérée par le provider

**Providers OAuth disponibles** :
- Google, GitHub, Facebook, Twitter, Discord
- Apple, Microsoft, LinkedIn, Spotify
- Auth0, Okta, Keycloak
- Et 80+ autres providers

**2. Credentials Provider (Authentification personnalisée)**

Pour l'authentification classique email/password :

```typescript
import CredentialsProvider from "next-auth/providers/credentials"

providers: [
  CredentialsProvider({
    id: "credentials",
    name: "Email and Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      // Valider les credentials (appel backend, vérification DB, etc.)
      const user = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(credentials),
        headers: { "Content-Type": "application/json" }
      })

      if (!user) {
        throw new Error("Invalid credentials")
      }

      // Retourner un objet User (doit correspondre à votre type étendu)
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accessToken: user.token,
        accessTokenExpires: Date.now() + 15 * 60 * 1000 // 15 minutes
      }
    }
  })
]
```

**Caractéristiques** :
- `credentials` : Définit les champs du formulaire de connexion
- `authorize()` : Fonction async qui valide et retourne `User | null`
- **Throw Error** : Pour afficher un message d'erreur personnalisé
- **Return null** : Pour annuler silencieusement la connexion

**3. Email Provider (Magic Links)**

Authentification par lien magique envoyé par email :

```typescript
import EmailProvider from "next-auth/providers/email"

providers: [
  EmailProvider({
    server: process.env.EMAIL_SERVER,
    from: "noreply@example.com",
  }),
]
```

**Fonctionnement** :
1. User entre son email
2. NextAuth génère un token unique
3. Email envoyé avec un lien contenant le token
4. User clique sur le lien
5. Token validé → Session créée

#### Structure d'un Provider

Chaque provider a une structure commune :

```typescript
{
  id: string,              // Identifiant unique (pour signIn('provider-id'))
  name: string,            // Nom affiché dans l'UI
  type: string,            // "oauth" | "email" | "credentials"
  options: {               // Configuration spécifique au provider
    clientId?: string,
    clientSecret?: string,
    // ...
  },
  authorize?: (credentials) => Promise<User | null>  // Pour Credentials
}
```

#### Utilisation Multiple Providers

Vous pouvez combiner plusieurs providers :

```typescript
providers: [
  // OAuth providers
  GoogleProvider({ /* ... */ }),
  GitHubProvider({ /* ... */ }),
  
  // Credentials provider
  CredentialsProvider({
    id: "credentials",
    // ...
  }),
  
  // Provider pour OAuth géré par le backend
  CredentialsProvider({
    id: "oauth-token",
    name: "OAuth Token",
    credentials: {
      token: { label: "Token", type: "text" }
    },
    async authorize(credentials) {
      // Valider le token auprès du backend
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${credentials.token}` }
      })
      
      if (!response.ok) throw new Error("Invalid token")
      
      const user = await response.json()
      return {
        ...user,
        accessToken: credentials.token,
        accessTokenExpires: Date.now() + 15 * 60 * 1000
      }
    }
  })
]
```

#### Appeler un Provider spécifique

Côté client, utilisez `signIn()` avec l'ID du provider :

```typescript
import { signIn } from "next-auth/react"

// OAuth provider
<button onClick={() => signIn("google")}>
  Sign in with Google
</button>

// Credentials provider
<button onClick={() => signIn("credentials", {
  email: "user@example.com",
  password: "password123",
  callbackUrl: "/dashboard"
})}>
  Sign in with Email
</button>

// Custom OAuth token provider
<button onClick={() => signIn("oauth-token", {
  token: backendGeneratedToken,
  callbackUrl: "/dashboard"
})}>
  Complete Sign in
</button>
```

#### Bonnes Pratiques Providers

1. **OAuth en priorité** : Utilisez OAuth quand c'est possible pour la sécurité
2. **Credentials sécurisés** : Si vous utilisez CredentialsProvider, validez côté serveur
3. **Messages d'erreur** : Utilisez `throw new Error()` pour des messages clairs
4. **Multiple providers** : Offrez plusieurs options de connexion pour l'UX
5. **callbackUrl** : Spécifiez toujours une URL de redirection après connexion

---

### Callbacks - Interception du flux

#### Qu'est-ce qu'un Callback ?

Les **callbacks** sont des fonctions qui vous permettent d'intercepter et de contrôler le flux d'authentification à différentes étapes du processus.

#### Les 4 Callbacks Principaux

**1. `signIn` Callback - Contrôle d'accès**

Détermine si un utilisateur peut se connecter :

```typescript
callbacks: {
  async signIn({ user, account, profile, email, credentials }) {
    // Bloquer les utilisateurs avec email non vérifié
    if (!user.isEmailVerified) {
      return '/email-verification-required'
    }
    
    // Bloquer certains domaines email
    if (user.email?.endsWith('@blocked-domain.com')) {
      return false
    }
    
    // Limiter l'accès à certains providers
    if (account.provider === 'github' && !allowedGitHubUsers.includes(user.email)) {
      return false
    }
    
    // Autoriser la connexion
    return true
  }
}
```

**Valeurs de retour** :
- `true` : Autoriser la connexion
- `false` : Bloquer la connexion (affiche une erreur générique)
- `string` (URL) : Rediriger vers une page d'erreur personnalisée

**Paramètres** :
- `user` : Objet User retourné par authorize() ou le provider OAuth
- `account` : Informations sur le compte (provider, type, etc.)
- `profile` : Profil OAuth (uniquement pour les providers OAuth)
- `email` : Email de vérification (pour Email provider)
- `credentials` : Credentials soumis (pour CredentialsProvider)

**2. `redirect` Callback - Contrôle des redirections**

Détermine où rediriger l'utilisateur après connexion/déconnexion :

```typescript
callbacks: {
  async redirect({ url, baseUrl }) {
    // Permettre les redirections relatives
    if (url.startsWith("/")) return `${baseUrl}${url}`
    
    // Permettre les redirections vers le même domaine
    else if (new URL(url).origin === baseUrl) return url
    
    // Toujours rediriger les admins vers /admin
    if (url.includes('role=admin')) return `${baseUrl}/admin`
    
    // Par défaut, retourner à la page d'accueil
    return baseUrl
  }
}
```

**Paramètres** :
- `url` : URL vers laquelle rediriger (peut venir de callbackUrl)
- `baseUrl` : URL de base de l'application

**Use cases** :
- Rediriger selon le rôle utilisateur
- Forcer des redirections vers des pages spécifiques
- Sécuriser contre les redirections malveillantes

**3. `jwt` Callback - Gestion du JWT token**

C'est le callback **le plus important**. Il gère le contenu du JWT token :

```typescript
callbacks: {
  async jwt({ token, user, account, profile, trigger, session }) {
    // ====== 1. CONNEXION INITIALE ======
    // `user` est présent uniquement lors du premier signIn
    if (user) {
      return {
        ...token,
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        image: user.image,
        accessToken: user.accessToken,
        accessTokenExpires: user.accessTokenExpires,
      }
    }

    // ====== 2. MISE À JOUR DE SESSION ======
    // Appelé quand session.update() est utilisé
    if (trigger === "update" && session) {
      // Mise à jour après refresh du token
      if (session.accessToken) {
        return {
          ...token,
          accessToken: session.accessToken,
          accessTokenExpires: session.accessTokenExpires,
          error: undefined,
        }
      }
      
      // Mise à jour du profil utilisateur
      return {
        ...token,
        ...session.user,
      }
    }

    // ====== 3. VÉRIFICATION D'EXPIRATION ======
    // Vérifier si le token est expiré
    const isExpired = Date.now() >= token.accessTokenExpires
    
    if (isExpired) {
      // Option A: Marquer comme expiré (client-side refresh)
      return { ...token, error: "TokenExpired" }
      
      // Option B: Refresh server-side (pas recommandé avec token rotation)
      // const refreshedToken = await refreshAccessToken(token)
      // return refreshedToken
    }

    // ====== 4. TOKEN VALIDE ======
    // Retourner le token sans modification
    return token
  }
}
```

**Quand est-il appelé** :
- À chaque requête vers `/api/auth/*`
- Lors du `signIn()`
- Lors de `session.update()`
- Lors de `getServerSession()` côté serveur

**Paramètres** :
- `token` : JWT actuel (contient les données de la session précédente)
- `user` : Présent **uniquement** lors du premier signIn
- `account` : Informations du compte (présent lors du signIn)
- `profile` : Profil OAuth (présent lors du signIn OAuth)
- `trigger` : `"signIn"` | `"signUp"` | `"update"` (raison de l'appel)
- `session` : Données passées à `session.update()` (si trigger === "update")

**Flow typique** :

```
┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 1: CONNEXION                                          │
│  signIn() → authorize() → User object → jwt() callback      │
│  ✓ user est présent → On merge tout dans token              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 2: REQUÊTES NORMALES                                  │
│  useSession() → jwt() callback                               │
│  ✓ user est null → On vérifie expiration → Return token     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ÉTAPE 3: MISE À JOUR                                        │
│  session.update({...}) → jwt() callback                      │
│  ✓ trigger="update" → On merge session → Return token       │
└─────────────────────────────────────────────────────────────┘
```

**4. `session` Callback - Construction de la session client**

Construit l'objet Session accessible via `useSession()` :

```typescript
callbacks: {
  async session({ session, token, user }) {
    // Copier les données du JWT vers la session
    session.user = {
      id: token.id,
      email: token.email,
      username: token.username,
      name: token.name,
      role: token.role,
      image: token.image,
      isEmailVerified: token.isEmailVerified,
      accessToken: token.accessToken,
      accessTokenExpires: token.accessTokenExpires,
    }
    
    // Ajouter l'accessToken à la racine pour faciliter l'accès
    session.accessToken = token.accessToken
    
    // Transférer les erreurs (token expiré, etc.)
    session.error = token.error
    
    return session
  }
}
```

**Quand est-il appelé** :
- Après `jwt()` callback
- Quand `useSession()` est appelé
- Quand `getServerSession()` est appelé

**Paramètres** :
- `session` : Objet session par défaut (minimal)
- `token` : JWT retourné par `jwt()` callback
- `user` : Présent si strategy = "database" (pas avec JWT)

**⚠️ ATTENTION - Sécurité** :
- Tout ce qui est dans `session` est **visible côté client**
- **Ne JAMAIS** mettre de refresh tokens, mots de passe, ou secrets
- Seulement les données nécessaires au frontend

#### Autres Callbacks Utiles

**`updateUser` (Database strategy uniquement)**

```typescript
callbacks: {
  async updateUser({ user }) {
    // Appelé quand un utilisateur est mis à jour en DB
    console.log(`User ${user.id} updated`)
    return user
  }
}
```

**`linkAccount` (OAuth)**

```typescript
callbacks: {
  async linkAccount({ user, account, profile }) {
    // Appelé quand un compte OAuth est lié à un utilisateur
    console.log(`Linked ${account.provider} account to user ${user.id}`)
  }
}
```

#### Bonnes Pratiques Callbacks

1. **jwt() pour la logique** : Toute la logique métier va dans `jwt()`
2. **session() pour le formatage** : Juste copier les données du token vers session
3. **Ne pas bloquer** : Les callbacks doivent être rapides (pas de requêtes lourdes)
4. **Type safety** : Utilisez les types étendus pour éviter les erreurs
5. **Gestion d'erreurs** : Marquez les erreurs dans le token/session, gérez côté client

---

### JWT vs Session

#### Deux stratégies disponibles

NextAuth supporte deux stratégies de session :

**1. JWT Strategy (Par défaut - Recommandé)**

```typescript
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 jours
}
```

**Fonctionnement** :
- Session stockée dans un **cookie crypté** (JWT)
- Pas de base de données nécessaire
- Vérifié et déchiffré à chaque requête côté serveur

**Avantages** :
- ✅ Pas de base de données nécessaire
- ✅ Scalable (stateless)
- ✅ Rapide (pas de requête DB)
- ✅ Facile à déployer

**Inconvénients** :
- ❌ Taille limitée du cookie (4KB)
- ❌ Pas de révocation instantanée
- ❌ Données moins "fraîches"

**Use cases** :
- Applications avec beaucoup d'utilisateurs
- APIs stateless
- Déploiements serverless
- Pas besoin de révocation immédiate

**2. Database Strategy**

```typescript
session: {
  strategy: "database",
  maxAge: 30 * 24 * 60 * 60,
  updateAge: 24 * 60 * 60, // Mise à jour toutes les 24h
}
```

**Fonctionnement** :
- Session stockée en **base de données**
- Cookie contient uniquement l'ID de session
- Requête DB à chaque vérification de session

**Avantages** :
- ✅ Révocation instantanée
- ✅ Données toujours fraîches
- ✅ Pas de limite de taille
- ✅ Audit et traçabilité

**Inconvénients** :
- ❌ Requiert un adaptateur DB
- ❌ Requête DB à chaque vérification
- ❌ Moins scalable
- ❌ Plus complexe à configurer

**Use cases** :
- Applications critiques (banking, healthcare)
- Besoin de révocation immédiate
- Audit des sessions
- Données utilisateur changeant fréquemment

#### Comparaison détaillée

| Critère | JWT Strategy | Database Strategy |
|---------|-------------|-------------------|
| **Base de données** | ❌ Non requise | ✅ Requise |
| **Performance** | ⚡ Très rapide | 🐢 Requête DB à chaque fois |
| **Scalabilité** | ⭐⭐⭐⭐⭐ Excellente | ⭐⭐⭐ Moyenne |
| **Révocation** | ⏱️ Retardée (jusqu'à expiration) | ⚡ Instantanée |
| **Données fraîches** | 🔄 Au refresh | ✅ Toujours à jour |
| **Taille de données** | 📦 4KB max | 📦 Illimitée |
| **Complexité** | ⚙️ Simple | ⚙️ Complexe |
| **Serverless** | ✅ Parfait | ⚠️ Limitations |

#### JWT Strategy en pratique

**Configuration complète** :

```typescript
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    // Encodage/Décodage personnalisé (optionnel)
    encode: async ({ secret, token }) => {
      return jwt.sign(token, secret)
    },
    decode: async ({ secret, token }) => {
      return jwt.verify(token, secret)
    },
  },
  
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        // ... autres données
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.id
      session.user.role = token.role
      return session
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET, // OBLIGATOIRE
}
```

**Sécurité JWT** :
- Cookie **httpOnly** : Pas accessible en JavaScript
- Cookie **secure** : HTTPS uniquement en production
- Cookie **sameSite** : Protection CSRF
- Crypté avec `NEXTAUTH_SECRET`

#### Database Strategy en pratique

**Configuration complète** :

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // Mise à jour toutes les 24h
  },
  
  callbacks: {
    async session({ session, user }) {
      // `user` vient de la DB, pas du JWT
      session.user.id = user.id
      session.user.role = user.role
      return session
    },
  },
}
```

**Schéma Prisma requis** :

```prisma
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?
  user               User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
}
```

#### Quand utiliser quelle stratégie ?

**Utilisez JWT si** :
- ✅ Vous débutez avec NextAuth
- ✅ Vous n'avez pas de DB ou ne voulez pas en gérer une
- ✅ Vous déployez en serverless
- ✅ Vous avez beaucoup d'utilisateurs (scalabilité)
- ✅ La révocation instantanée n'est pas critique

**Utilisez Database si** :
- ✅ Vous avez déjà une DB et un adaptateur
- ✅ Vous avez besoin de révocation instantanée
- ✅ Vos données utilisateur changent fréquemment
- ✅ Vous avez besoin d'audit des sessions
- ✅ Sécurité maximale requise (banking, healthcare)

---

### Options Additionnelles

Cette section couvre les options NextAuth moins utilisées mais utiles selon les besoins.

#### 1. Debug et Logging

**Activer le mode debug** :

```typescript
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  // Active les logs détaillés dans la console
}
```

**Logger personnalisé** :

```typescript
logger: {
  error(code, metadata) {
    console.error('[NextAuth Error]', code, metadata)
    // Envoyer à un service de monitoring (Sentry, etc.)
  },
  warn(code) {
    console.warn('[NextAuth Warn]', code)
  },
  debug(code, metadata) {
    console.log('[NextAuth Debug]', code, metadata)
  }
}
```

#### 2. Configuration des Cookies

**Personnaliser les cookies** :

```typescript
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  },
  callbackUrl: {
    name: `__Secure-next-auth.callback-url`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  },
  csrfToken: {
    name: `__Host-next-auth.csrf-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    }
  },
}
```

**Options disponibles** :
- `httpOnly` : Cookie non accessible en JavaScript (sécurité)
- `sameSite` : `'lax'` | `'strict'` | `'none'` (protection CSRF)
- `secure` : HTTPS uniquement
- `domain` : Domaine du cookie
- `path` : Chemin du cookie

#### 3. useSecureCookies

```typescript
useSecureCookies: process.env.NODE_ENV === 'production',
// Force l'utilisation de cookies sécurisés (HTTPS) en production
```

#### 4. Pages personnalisées

**Remplacer les pages par défaut** :

```typescript
pages: {
  signIn: '/auth/signin',           // Page de connexion
  signOut: '/auth/signout',         // Page de déconnexion
  error: '/auth/error',             // Page d'erreur (?error=...)
  verifyRequest: '/auth/verify-request', // "Vérifiez votre email"
  newUser: '/auth/welcome'          // Redirection nouveaux utilisateurs
}
```

**Paramètres d'erreur disponibles** :
- `?error=Configuration` : Problème de configuration serveur
- `?error=AccessDenied` : Accès refusé (signIn callback returned false)
- `?error=Verification` : Token de vérification invalide
- `?error=Default` : Erreur générique

#### 5. Events (Webhooks)

**Écouter les événements d'authentification** :

```typescript
events: {
  async signIn({ user, account, profile, isNewUser }) {
    // Appelé après une connexion réussie
    console.log(`User ${user.email} signed in`)
    
    // Exemples d'actions :
    // - Envoyer un email de bienvenue
    // - Logger la connexion
    // - Mettre à jour last_login en DB
    // - Notifier via webhook
  },
  
  async signOut({ token, session }) {
    // Appelé lors de la déconnexion
    console.log(`User signed out`)
    
    // Exemples :
    // - Appeler un endpoint de logout backend
    // - Invalider des tokens
    // - Logger la déconnexion
  },
  
  async createUser({ user }) {
    // Appelé quand un nouveau compte est créé
    // (Database strategy uniquement)
    console.log(`New user created: ${user.email}`)
    
    // Exemples :
    // - Envoyer un email de bienvenue
    // - Créer un profil par défaut
    // - Notifier les admins
  },
  
  async updateUser({ user }) {
    // Appelé quand un utilisateur est mis à jour
    console.log(`User ${user.id} updated`)
  },
  
  async linkAccount({ user, account, profile }) {
    // Appelé quand un compte OAuth est lié
    console.log(`Linked ${account.provider} to user ${user.id}`)
  },
  
  async session({ session, token }) {
    // Appelé à chaque vérification de session
    // ⚠️ ATTENTION : Peut être appelé très souvent
    // Ne pas faire d'opérations lourdes ici
  }
}
```

**⚠️ Note importante sur les events** :
- Ce sont des fonctions **asynchrones** mais NextAuth **n'attend pas** leur résolution
- Utilisez-les pour des actions **non-bloquantes** (logging, webhooks)
- **Ne pas** utiliser pour valider ou bloquer des actions (utilisez les callbacks)

#### 6. Theme (Pages par défaut)

**Personnaliser le thème des pages NextAuth** :

```typescript
theme: {
  colorScheme: "auto",        // "auto" | "dark" | "light"
  brandColor: "#346df1",      // Couleur principale (boutons, liens)
  logo: "/logo.png",          // URL du logo
  buttonText: "#fff"          // Couleur du texte des boutons
}
```

**Résultat** :
- Appliqué uniquement aux pages par défaut de NextAuth
- Si vous avez des pages personnalisées (`pages: { signIn: ... }`), le theme n'est pas appliqué

#### 7. Adapter (Pour Database Strategy)

**Connecter une base de données** :

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "database",
  },
}
```

**Adaptateurs disponibles** :
- **Prisma** : ORM TypeScript moderne
- **Drizzle** : ORM TypeScript léger
- **TypeORM** : ORM mature multi-DB
- **Sequelize** : ORM classique
- **MongoDB** : Base NoSQL
- **Supabase** : Backend-as-a-Service
- **Firebase** : Google Backend
- **DynamoDB** : AWS NoSQL
- **Et plus...**

**Installation** :

```bash
npm install @auth/prisma-adapter @prisma/client
```

#### 8. Autres options avancées

**basePath** : Changer le chemin des routes API

```typescript
basePath: "/custom/auth/path"
// Routes seront : /custom/auth/path/signin, etc.
```

**trustHost** : Faire confiance au header X-Forwarded-Host

```typescript
trustHost: true
// Utile derrière un reverse proxy
```

#### Résumé des options par priorité

**Essentielles** :
- ✅ `providers` : Définir les méthodes de connexion
- ✅ `secret` : Clé de chiffrement (OBLIGATOIRE)
- ✅ `session.strategy` : "jwt" ou "database"

**Recommandées** :
- 📌 `callbacks.jwt` : Gérer le contenu du token
- 📌 `callbacks.session` : Construire la session client
- 📌 `pages.signIn` : Page de connexion personnalisée

**Optionnelles selon besoins** :
- 🔧 `debug` : Mode développement
- 🔧 `events` : Logging et webhooks
- 🔧 `cookies` : Personnalisation avancée
- 🔧 `theme` : Si vous utilisez les pages par défaut

**Avancées** :
- ⚙️ `adapter` : Si vous utilisez database strategy
- ⚙️ `jwt.encode/decode` : Cryptage personnalisé
- ⚙️ `basePath` : URLs personnalisées

---

## Provider

### Qu'est-ce que le Provider ?

Le **Provider** dans NextAuth.js fait référence au `SessionProvider`, un composant React Context Provider qui permet de partager l'état de session d'authentification à travers l'arborescence de composants de votre application.

### Rôle et Fonctionnalité

Le `SessionProvider` remplit plusieurs fonctions essentielles :

1. **Gestion de l'état de session** : Fournit l'accès à la session utilisateur dans tous les composants enfants
2. **Synchronisation automatique** : Met à jour la session sur tous les onglets/fenêtres du navigateur
3. **Rafraîchissement automatique** : Maintient la session à jour en arrière-plan
4. **Hook `useSession()`** : Expose les données de session via le hook React

### Implémentation

```typescript
// app/layout.tsx ou pages/_app.tsx
import { SessionProvider } from "next-auth/react"

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
```

### Options de Configuration

Le `SessionProvider` accepte plusieurs props optionnelles :

#### 1. `session` (optionnel)
- **Type** : `Session | null | undefined`
- **Description** : Session initiale passée depuis le serveur pour éviter un appel réseau supplémentaire
- **Utilisation** : Permet l'hydratation côté client avec les données serveur

```typescript
<SessionProvider session={pageProps.session}>
  {children}
</SessionProvider>
```

#### 2. `refetchInterval` (optionnel)
- **Type** : `number` (en secondes)
- **Défaut** : `0` (désactivé)
- **Description** : Intervalle de temps pour rafraîchir automatiquement la session
- **Utilisation** : Utile pour s'assurer que la session reste à jour

```typescript
<SessionProvider refetchInterval={5 * 60}>
  {/* Re-fetch session every 5 minutes */}
  {children}
</SessionProvider>
```

#### 3. `refetchOnWindowFocus` (optionnel)
- **Type** : `boolean`
- **Défaut** : `true`
- **Description** : Rafraîchit automatiquement la session quand la fenêtre reprend le focus
- **Utilisation** : Assure que la session est à jour quand l'utilisateur revient sur l'onglet

```typescript
<SessionProvider refetchOnWindowFocus={true}>
  {children}
</SessionProvider>
```

#### 4. `baseUrl` (optionnel)
- **Type** : `string`
- **Description** : URL de base pour les appels API NextAuth
- **Utilisation** : Utile dans les environnements avec des configurations d'URL complexes

```typescript
<SessionProvider baseUrl="https://example.com">
  {children}
</SessionProvider>
```

#### 5. `basePath` (optionnel)
- **Type** : `string`
- **Défaut** : `/api/auth`
- **Description** : Chemin de base pour les routes API NextAuth
- **Utilisation** : Si vous avez personnalisé le chemin des routes API

```typescript
<SessionProvider basePath="/custom/auth/path">
  {children}
</SessionProvider>
```

### Utilisation avec `useSession()`

Une fois le `SessionProvider` configuré, utilisez le hook `useSession()` dans vos composants :

```typescript
import { useSession } from "next-auth/react"

export default function Component() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <p>Loading...</p>
  }

  if (status === "unauthenticated") {
    return <p>Access Denied</p>
  }

  return (
    <>
      <h1>Protected Content</h1>
      <p>Welcome {session.user.email}</p>
    </>
  )
}
```

### Bonnes Pratiques

1. **Placement** : Placez le `SessionProvider` aussi haut que possible dans l'arborescence de composants
2. **Session SSR** : Passez la session depuis `getServerSideProps` pour l'hydratation
3. **RefetchInterval** : Configurez selon vos besoins de sécurité (plus court = plus sécurisé, mais plus de requêtes)
4. **Client Components Only** : Le `SessionProvider` doit être utilisé uniquement dans les Client Components (avec `"use client"`)

### App Router (Next.js 13+)

Dans l'App Router, le `SessionProvider` doit être importé et utilisé dans un Client Component :

```typescript
// app/providers.tsx
"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

Puis importé dans le layout :

```typescript
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

## authOptions

### Qu'est-ce que authOptions ?

`authOptions` est l'objet de configuration principal de NextAuth.js. Il définit comment l'authentification fonctionne dans votre application, incluant les providers, les callbacks, les stratégies de session, et plus encore.

### Structure de Base

```typescript
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [],
  // ... autres options
}
```

### Options Principales

#### 1. `providers`
- **Type** : `Provider[]`
- **Requis** : ✅ Oui
- **Description** : Liste des providers d'authentification (OAuth, Email, Credentials, etc.)

```typescript
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
}
```

**Types de Providers Disponibles :**
- **OAuth Providers** : Google, GitHub, Facebook, Twitter, etc.
- **Email Provider** : Authentification par lien magique email
- **Credentials Provider** : Authentification par username/password personnalisée

#### 2. `secret`
- **Type** : `string`
- **Requis** : ✅ Oui (en production)
- **Description** : Clé secrète utilisée pour chiffrer les tokens et les cookies
- **Génération recommandée** : `openssl rand -base64 32`

```typescript
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // ...
}
```

#### 3. `session`
- **Type** : `SessionOptions`
- **Description** : Configuration de la stratégie de session

```typescript
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt", // ou "database"
    maxAge: 30 * 24 * 60 * 60, // 30 jours
    updateAge: 24 * 60 * 60, // 24 heures
  },
}
```

**Options de session :**
- `strategy` : `"jwt"` (défaut) ou `"database"`
- `maxAge` : Durée de vie maximale de la session (en secondes)
- `updateAge` : Fréquence de mise à jour de la session (en secondes)
- `generateSessionToken` : Fonction personnalisée pour générer les tokens

#### 4. `callbacks`
- **Type** : `CallbacksOptions`
- **Description** : Fonctions personnalisées pour contrôler le flux d'authentification

##### `callbacks.signIn`
Contrôle si un utilisateur peut se connecter :

```typescript
callbacks: {
  async signIn({ user, account, profile, email, credentials }) {
    // Retourner true pour autoriser, false pour refuser
    const isAllowedToSignIn = true
    if (isAllowedToSignIn) {
      return true
    } else {
      return false
      // Ou retourner une URL pour rediriger vers une page d'erreur
      // return '/unauthorized'
    }
  }
}
```

##### `callbacks.redirect`
Détermine où rediriger après connexion/déconnexion :

```typescript
callbacks: {
  async redirect({ url, baseUrl }) {
    // Permet des redirections relatives
    if (url.startsWith("/")) return `${baseUrl}${url}`
    // Permet des redirections vers le même domaine
    else if (new URL(url).origin === baseUrl) return url
    return baseUrl
  }
}
```

##### `callbacks.jwt`
Modifie le JWT avant qu'il soit persisté :

```typescript
callbacks: {
  async jwt({ token, user, account, profile, isNewUser }) {
    // Persister les données utilisateur dans le token
    if (user) {
      token.id = user.id
    }
    return token
  }
}
```

##### `callbacks.session`
Modifie l'objet session exposé au client :

```typescript
callbacks: {
  async session({ session, token, user }) {
    // Envoyer des propriétés au client
    session.user.id = token.id
    return session
  }
}
```

#### 5. `pages`
- **Type** : `PagesOptions`
- **Description** : URLs personnalisées pour les pages d'authentification

```typescript
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  }
}
```

**Pages disponibles :**
- `signIn` : Page de connexion personnalisée
- `signOut` : Page de déconnexion
- `error` : Page d'erreur d'authentification
- `verifyRequest` : Page de vérification email
- `newUser` : Page pour les nouveaux utilisateurs

#### 6. `events`
- **Type** : `EventCallbacks`
- **Description** : Fonctions asynchrones appelées lors d'événements d'authentification

```typescript
events: {
  async signIn({ user, account, profile, isNewUser }) {
    // Exemple : Envoyer un email de bienvenue
  },
  async signOut({ token, session }) {
    // Exemple : Logger la déconnexion
  },
  async createUser({ user }) {
    // Exemple : Envoyer un email de confirmation
  },
  async updateUser({ user }) {
    // Exemple : Notifier l'utilisateur de modifications
  },
  async linkAccount({ user, account, profile }) {
    // Exemple : Logger le lien d'un compte OAuth
  },
  async session({ session, token }) {
    // Appelé à chaque vérification de session
  }
}
```

#### 7. `adapter`
- **Type** : `Adapter`
- **Description** : Adaptateur de base de données pour la stratégie "database"

```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  // ...
}
```

**Adaptateurs disponibles :**
- Prisma
- Drizzle
- Supabase
- MongoDB
- PostgreSQL
- MySQL
- Et plus...

#### 8. `jwt`
- **Type** : `JWTOptions`
- **Description** : Configuration des JSON Web Tokens

```typescript
jwt: {
  secret: process.env.NEXTAUTH_SECRET,
  maxAge: 30 * 24 * 60 * 60, // 30 jours
  encode: async ({ secret, token, maxAge }) => {
    // Encodage personnalisé
  },
  decode: async ({ secret, token, maxAge }) => {
    // Décodage personnalisé
  }
}
```

#### 9. `theme`
- **Type** : `Theme`
- **Description** : Personnalisation du thème des pages par défaut

```typescript
theme: {
  colorScheme: "auto", // "auto" | "dark" | "light"
  brandColor: "#346df1", // Couleur principale
  logo: "/logo.png", // URL du logo
  buttonText: "#fff" // Couleur du texte des boutons
}
```

#### 10. `debug`
- **Type** : `boolean`
- **Défaut** : `false`
- **Description** : Active les logs de débogage détaillés

```typescript
debug: process.env.NODE_ENV === "development"
```

#### 11. `logger`
- **Type** : `LoggerInstance`
- **Description** : Logger personnalisé pour les événements NextAuth

```typescript
logger: {
  error(code, metadata) {
    console.error(code, metadata)
  },
  warn(code) {
    console.warn(code)
  },
  debug(code, metadata) {
    console.debug(code, metadata)
  }
}
```

#### 12. `cookies`
- **Type** : `CookiesOptions`
- **Description** : Configuration des cookies de session

```typescript
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true
    }
  },
  callbackUrl: {
    name: `__Secure-next-auth.callback-url`,
    options: {
      sameSite: 'lax',
      path: '/',
      secure: true
    }
  },
  csrfToken: {
    name: `__Host-next-auth.csrf-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true
    }
  }
}
```

### Exemple de Configuration Complète

```typescript
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Logique d'authentification personnalisée
        const user = { id: "1", name: "User", email: "user@example.com" }
        return user
      }
    })
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
      }
      return session
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in`)
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
```

### Bonnes Pratiques

1. **Secret sécurisé** : Utilisez toujours une clé secrète forte générée aléatoirement
2. **Variables d'environnement** : Stockez les secrets dans `.env.local`, jamais dans le code
3. **Type safety** : Utilisez TypeScript et les types NextAuth pour la sécurité de type
4. **Callbacks minimaux** : N'ajoutez que les callbacks dont vous avez besoin
5. **Session strategy** : Utilisez JWT pour la simplicité, database pour les sessions persistantes
6. **MaxAge raisonnable** : 30 jours est un bon équilibre entre UX et sécurité

---

## route.ts ([...nextauth])

### Qu'est-ce que route.ts ?

Dans le **Next.js App Router** (Next.js 13+), le fichier `route.ts` (ou `route.js`) dans le répertoire `app/api/auth/[...nextauth]/` est le **Route Handler** qui gère toutes les routes API d'authentification NextAuth.

Ce fichier remplace l'ancien `pages/api/auth/[...nextauth].ts` utilisé dans le Pages Router.

### Rôle et Fonctionnalité

Le fichier `route.ts` :

1. **Expose les routes API NextAuth** : `/api/auth/signin`, `/api/auth/signout`, `/api/auth/callback/*`, etc.
2. **Gère les requêtes HTTP** : GET et POST pour toutes les opérations d'authentification
3. **Intègre authOptions** : Utilise la configuration définie dans `authOptions`
4. **Route dynamique** : Le segment `[...nextauth]` capture toutes les sous-routes

### Structure du Fichier

```
app/
├── api/
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts
```

### Implémentation de Base

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth" // ou où vous stockez authOptions

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### Explication Ligne par Ligne

```typescript
import NextAuth from "next-auth"
```
- Importe la fonction principale NextAuth qui génère le handler

```typescript
import { authOptions } from "@/lib/auth"
```
- Importe la configuration `authOptions` depuis un fichier centralisé
- **Bonne pratique** : Séparer `authOptions` dans un fichier dédié pour la réutilisabilité

```typescript
const handler = NextAuth(authOptions)
```
- Crée le handler en passant la configuration
- `NextAuth()` retourne une fonction qui gère les requêtes HTTP

```typescript
export { handler as GET, handler as POST }
```
- **Export nommé obligatoire** : Le système App Router requiert des exports nommés
- `GET` : Gère les requêtes GET (pages de connexion, callbacks OAuth)
- `POST` : Gère les requêtes POST (soumission de formulaires, API)

### Routes API Générées

Le fichier `route.ts` génère automatiquement les routes suivantes :

#### Routes d'Authentification

| Route | Méthode | Description |
|-------|---------|-------------|
| `/api/auth/signin` | GET | Affiche la page de connexion par défaut |
| `/api/auth/signin/:provider` | POST | Initie la connexion avec un provider spécifique |
| `/api/auth/signout` | GET, POST | Déconnexion de l'utilisateur |
| `/api/auth/callback/:provider` | GET, POST | Callback après authentification OAuth |
| `/api/auth/session` | GET | Récupère la session actuelle |
| `/api/auth/csrf` | GET | Récupère le token CSRF |
| `/api/auth/providers` | GET | Liste les providers disponibles |

#### Exemples d'Utilisation des Routes

```typescript
// Récupérer la session actuelle
const response = await fetch('/api/auth/session')
const session = await response.json()

// Récupérer les providers
const response = await fetch('/api/auth/providers')
const providers = await response.json()

// Récupérer le token CSRF
const response = await fetch('/api/auth/csrf')
const { csrfToken } = await response.json()
```

### Configuration Avancée

#### Route Personnalisée

Si vous souhaitez utiliser un chemin différent de `/api/auth` :

```typescript
// app/api/custom-auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

Puis dans votre `SessionProvider` :

```typescript
<SessionProvider basePath="/api/custom-auth">
  {children}
</SessionProvider>
```

#### Middleware Personnalisé

Vous pouvez ajouter de la logique avant NextAuth :

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

async function handler(req: NextRequest) {
  // Logique personnalisée avant NextAuth
  console.log("Auth request received:", req.url)
  
  // Appeler NextAuth
  return NextAuth(authOptions)(req)
}

export { handler as GET, handler as POST }
```

**Note** : *Information sur la personnalisation avancée du middleware limitée dans la documentation officielle.*

#### Gestion des Erreurs

NextAuth gère automatiquement les erreurs, mais vous pouvez les personnaliser :

```typescript
// Dans authOptions
export const authOptions: NextAuthOptions = {
  pages: {
    error: '/auth/error', // Page d'erreur personnalisée
  },
  // ...
}
```

Les codes d'erreur disponibles :
- `Configuration` : Erreur de configuration
- `AccessDenied` : Accès refusé
- `Verification` : Échec de vérification email
- `Default` : Erreur générique

### Intégration avec authOptions

Le fichier `route.ts` et `authOptions` sont intimement liés :

```typescript
// lib/auth.ts (ou lib/auth-options.ts)
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
```

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

### Réutilisation de authOptions

Séparer `authOptions` permet de le réutiliser côté serveur :

```typescript
// app/dashboard/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  return <div>Welcome {session.user.name}</div>
}
```

### Bonnes Pratiques

1. **Centraliser authOptions** : Stockez `authOptions` dans un fichier séparé (`lib/auth.ts`)
2. **Export nommés** : Toujours utiliser `export { handler as GET, handler as POST }`
3. **Type safety** : Utiliser TypeScript avec `NextAuthOptions`
4. **Chemin par défaut** : Gardez `/api/auth` sauf nécessité absolue
5. **Variables d'environnement** : Utilisez `.env.local` pour les secrets
6. **Validation** : Vérifiez que les variables d'environnement sont définies

### Débogage

Pour déboguer les routes NextAuth :

```typescript
export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === 'development',
  // ...
}
```

Puis consultez la console pour les logs détaillés :
- Callbacks appelés
- Erreurs de configuration
- Requêtes et réponses

### Limitations et Considérations

1. **App Router uniquement** : Cette approche est spécifique au Next.js 13+ App Router
2. **Edge Runtime** : NextAuth supporte partiellement l'Edge Runtime (vérifier la compatibilité)
3. **Middleware** : La personnalisation avancée du middleware est limitée
4. **Hot Reload** : Les changements de configuration peuvent nécessiter un redémarrage du serveur

---

## src/app/layout.tsx

### Qu'est-ce que layout.tsx ?

Le fichier `layout.tsx` est le **composant de layout racine** dans le Next.js App Router. Il définit l'interface utilisateur partagée par toutes les pages de votre application.

Pour NextAuth, c'est l'endroit idéal pour intégrer le `SessionProvider` et rendre la session accessible dans toute l'application.

### Rôle dans NextAuth

Le `layout.tsx` :

1. **Enveloppe l'application** : Fournit le contexte de session à tous les composants enfants
2. **Intègre SessionProvider** : Rend `useSession()` disponible partout
3. **Configuration globale** : Définit les options de refresh et de synchronisation
4. **Structure HTML** : Définit `<html>` et `<body>` pour toute l'application

### Contrainte Importante : "use client"

Le `SessionProvider` est un Client Component et nécessite la directive `"use client"`. Cependant, `layout.tsx` est par défaut un Server Component.

**Solution** : Créer un composant wrapper séparé pour le `SessionProvider`.

### Implémentation Recommandée

#### Étape 1 : Créer un Composant Provider

```typescript
// app/providers.tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

interface ProvidersProps {
  children: ReactNode
  session?: any // Type optionnel pour l'hydratation SSR
}

export function Providers({ children, session }: ProvidersProps) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}
```

**Points clés :**
- `"use client"` : Directive obligatoire en haut du fichier
- `session` prop : Permet l'hydratation depuis le serveur (optionnel)
- Export nommé : `export function Providers`

#### Étape 2 : Intégrer dans layout.tsx

```typescript
// app/layout.tsx
import { Providers } from './providers'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'My app with NextAuth',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**Structure :**
- `layout.tsx` reste un Server Component
- `Providers` est un Client Component contenant `SessionProvider`
- Tous les `children` ont accès à `useSession()`

### Configuration Avancée du SessionProvider

#### Avec Options de Refresh

```typescript
// app/providers.tsx
"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Rafraîchir la session toutes les 5 minutes
      refetchInterval={5 * 60}
      // Rafraîchir quand la fenêtre reprend le focus
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}
```

**Options disponibles :**
- `refetchInterval` : Intervalle de refresh automatique (en secondes)
- `refetchOnWindowFocus` : Refresh au focus de la fenêtre (défaut: `true`)
- `basePath` : Chemin custom pour les routes API (défaut: `/api/auth`)

#### Avec Hydratation de Session (SSR)

Pour passer la session depuis le serveur :

```typescript
// app/providers.tsx
"use client"

import { SessionProvider } from "next-auth/react"

export function Providers({ 
  children, 
  session 
}: { 
  children: React.ReactNode
  session: any
}) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  )
}
```

```typescript
// app/layout.tsx
import { Providers } from './providers'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body>
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

**Avantages de l'hydratation :**
- Évite un appel réseau supplémentaire côté client
- Session disponible immédiatement au premier rendu
- Meilleure performance et UX

### Intégration avec Autres Providers

Si vous avez d'autres Context Providers :

```typescript
// app/providers.tsx
"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system">
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
```

**Ordre recommandé :**
1. `SessionProvider` (le plus externe)
2. Autres providers globaux
3. `children`

### Exemple Complet avec Metadata et Styling

```typescript
// app/layout.tsx
import { Providers } from './providers'
import { Inter } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'My App',
    template: '%s | My App'
  },
  description: 'Application with NextAuth authentication',
  keywords: ['Next.js', 'NextAuth', 'Authentication'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
```

### Patterns de Layout Imbriqués

Pour des layouts imbriqués avec différents niveaux d'authentification :

```typescript
// app/layout.tsx (Layout racine)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// app/(auth)/layout.tsx (Layout pour pages d'auth)
export default function AuthLayout({ children }) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}

// app/(protected)/layout.tsx (Layout pour pages protégées)
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function ProtectedLayout({ children }) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <div className="protected-layout">
      <nav>Protected Navigation</nav>
      {children}
    </div>
  )
}
```

### Bonnes Pratiques

1. **Séparation des responsabilités** : Garder `layout.tsx` comme Server Component, isoler les Client Components
2. **Providers wrapper** : Créer un fichier `providers.tsx` dédié pour tous les providers
3. **Type safety** : Utiliser TypeScript avec les types appropriés
4. **Performance** : Hydratation SSR de la session pour éviter les appels réseau supplémentaires
5. **Metadata** : Définir les metadata SEO dans le layout racine
6. **Styling** : Appliquer les styles globaux et les classes CSS dans `layout.tsx`
7. **RefetchInterval** : Configurer selon vos besoins (plus court = plus sécurisé)

### Débogage

Si `useSession()` retourne `undefined` ou `null` :

1. **Vérifier le Provider** : Assurez-vous que `SessionProvider` enveloppe vos composants
2. **Directive "use client"** : Vérifiez que `providers.tsx` a la directive
3. **Routes API** : Confirmez que `/api/auth/[...nextauth]/route.ts` existe
4. **Configuration** : Vérifiez `authOptions` et `NEXTAUTH_SECRET`

### Migration depuis Pages Router

Si vous migrez depuis le Pages Router :

**Avant (Pages Router) :**
```typescript
// pages/_app.tsx
import { SessionProvider } from "next-auth/react"

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
```

**Après (App Router) :**
```typescript
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

// app/providers.tsx
"use client"
import { SessionProvider } from "next-auth/react"

export function Providers({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
```

### Limitations et Considérations

1. **Client Components** : `SessionProvider` nécessite un Client Component
2. **Server Components par défaut** : Layouts sont Server Components par défaut
3. **Hydratation** : La session peut ne pas être disponible immédiatement sans hydratation SSR
4. **Nested Layouts** : Chaque niveau de layout peut avoir sa propre logique d'authentification
5. **Performance** : Trop de refreshes peuvent impacter les performances

---

## Conclusion

Ce document couvre les principaux éléments de configuration et d'intégration de NextAuth.js selon la documentation officielle :

- **Provider** : `SessionProvider` pour partager l'état de session
- **authOptions** : Configuration centrale avec providers, callbacks, session, pages
- **route.ts** : Route handler API dans App Router
- **layout.tsx** : Intégration du provider dans la structure de l'application

Pour toute information complémentaire, consultez la documentation officielle :
- **NextAuth.js** : https://next-auth.js.org/
- **Getting Started** : https://next-auth.js.org/getting-started/introduction
- **Configuration** : https://next-auth.js.org/configuration/options
- **API Reference** : https://next-auth.js.org/getting-started/rest-api

**Version** : NextAuth.js v4.x  
**Next.js** : Version 13+ (App Router)  
**Date** : Janvier 2026
