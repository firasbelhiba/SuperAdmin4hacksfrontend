# 📊 Guide de Test de Performance - Optimisations d'Imports Dynamiques

## 🎯 Objectif
Mesurer l'impact des imports dynamiques sur:
- Taille des bundles JavaScript
- Temps de chargement initial (FCP, LCP)
- Temps d'interaction (TTI)
- Utilisation réseau

---

## 🔍 Méthode 1: Next.js Bundle Analyzer (RECOMMANDÉ)

### Installation ✅
```bash
npm install --save-dev @next/bundle-analyzer
```

### Configuration ✅
Le fichier `next.config.ts` a été configuré automatiquement.

### Utilisation

#### **Étape 1: Build avec analyse**
```powershell
# Pour Windows PowerShell
$env:ANALYZE="true"; npm run build

# OU utiliser le script npm directement
npm run build:analyze
```

#### **Étape 2: Interpréter les résultats**
Le navigateur s'ouvrira automatiquement avec 2 visualisations:
- **Client Bundle** → Bundle envoyé au navigateur
- **Server Bundle** → Code exécuté côté serveur

#### **Ce qu'il faut vérifier:**
✅ **Chart.js ne doit apparaître que dans:**
   - `pages/(admin)/page.js` (Dashboard uniquement)
   
✅ **react-hook-form doit être dans des chunks séparés:**
   - `_dynamic_SubscriptionForm.js`
   - `_dynamic_PlanForm.js`

✅ **Portal/Modal code séparé:**
   - `_dynamic_ConfirmModal.js`

✅ **Icons barrel réduit:**
   - Seulement les icônes utilisées (eye.svg, eye-close.svg) dans auth pages

---

## 📈 Méthode 2: Chrome DevTools - Network Tab

### **Test Avant/Après**

#### **Pour tester la branche actuelle (optimisée):**
```powershell
npm run build
npm start
```

1. Ouvrir Chrome DevTools (F12)
2. Onglet **Network**
3. Cocher **Disable cache**
4. Recharger la page d'accueil
5. Noter les métriques:
   - **Total size transferred**
   - **Total resources**
   - **DOMContentLoaded** (temps)
   - **Load** (temps)

#### **Pour comparer avec l'ancienne version:**
```powershell
# Revenir à la branche principale
git stash
git checkout main

# Build et test
npm run build
npm start

# Refaire les mêmes mesures
```

### **Métriques attendues (amélioration):**
- ⬇️ **Total size**: -30% à -40% sur les pages non-dashboard
- ⬇️ **Initial JS bundle**: -200KB à -500KB
- ⬇️ **Time to Interactive**: -0.5s à -1.5s

---

## 🚀 Méthode 3: Lighthouse Performance Audit

### **Test avec Chrome Lighthouse**

1. Ouvrir Chrome DevTools (F12)
2. Onglet **Lighthouse**
3. Sélectionner:
   - ✅ Performance
   - ✅ Desktop (ou Mobile)
   - ✅ Clear storage
4. Cliquer **Analyze page load**

### **Pages à tester:**
1. **Page de connexion** `/auth/signin`
2. **Dashboard** `/` (après connexion)
3. **Liste subscriptions** `/subscriptions`
4. **Formulaire nouveau plan** `/plans/new`

### **Métriques clés:**

| Métrique | Avant | Après (attendu) |
|----------|-------|-----------------|
| **FCP** (First Contentful Paint) | ~2s | ~1.2s (-40%) |
| **LCP** (Largest Contentful Paint) | ~3s | ~2s (-33%) |
| **TTI** (Time to Interactive) | ~4s | ~2.5s (-37%) |
| **Total Blocking Time** | ~500ms | ~200ms (-60%) |
| **Speed Index** | ~3.5s | ~2.2s (-37%) |

---

## 📊 Méthode 4: Comparaison Build Output

### **Comparer les tailles de build**

```powershell
# Branche optimisée (actuelle)
npm run build > build-optimized.txt

# Branche main (non-optimisée)
git checkout main
npm run build > build-main.txt

# Comparer les fichiers
code -d build-main.txt build-optimized.txt
```

### **Ce qu'il faut chercher dans le output:**

#### **Chunks dynamiques créés:**
```
○ (Dynamic)  [chunk-name].js  XX kB
```

Vous devriez voir:
- `_dynamic_LineChart.js`
- `_dynamic_BarChart.js`
- `_dynamic_DonutChart.js`
- `_dynamic_ConfirmModal.js`
- `_dynamic_NotificationDropdown.js`
- `_dynamic_UserDropdown.js`
- `_dynamic_SubscriptionForm.js`
- `_dynamic_PlanForm.js`

#### **Réduction de la page principale:**
```
First Load JS shared by all: XX kB
```
Cette valeur doit être **plus petite** dans la version optimisée.

---

## 🧪 Méthode 5: Tests de Chargement Progressif

### **Vérifier le lazy loading**

1. Ouvrir DevTools → Network → JS filter
2. Charger la page d'accueil
3. **Vérifier que Chart.js n'est PAS chargé** si vous n'êtes pas sur le dashboard
4. Naviguer vers le dashboard
5. **Vérifier que Chart.js est maintenant chargé**

### **Test des modals:**
1. Aller sur `/users/[id]`
2. Network tab → Clear
3. **Cliquer sur "Ban User"**
4. Vérifier qu'un chunk `ConfirmModal` est chargé **uniquement après le clic**

### **Test des formulaires:**
1. Aller sur `/plans/new`
2. Network tab → vérifier le chargement de `PlanForm`
3. Devrait être chargé **après** le rendu initial de la page

---

## 📝 Checklist de Validation

### ✅ **Imports Dynamiques fonctionnent:**
- [ ] Charts apparaissent correctement sur le dashboard
- [ ] LoadingSpinner s'affiche brièvement pendant le chargement
- [ ] ConfirmModal s'ouvre sans erreur
- [ ] Notifications dropdown fonctionne
- [ ] Formulaires se chargent et se soumettent correctement

### ✅ **Performance améliorée:**
- [ ] Bundle analyzer montre des chunks séparés
- [ ] Lighthouse score > 90 sur pages non-dashboard
- [ ] FCP < 1.5s sur page connexion
- [ ] Network tab montre moins de JS initial

### ✅ **Pas de régression:**
- [ ] Aucune erreur console
- [ ] Toutes les fonctionnalités marchent
- [ ] Navigation fluide entre pages
- [ ] Pas de flash de contenu non stylisé

---

## 🎬 Commandes Rapides

```powershell
# 1. Analyser le bundle
$env:ANALYZE="true"; npm run build

# 2. Build production
npm run build

# 3. Tester en production locale
npm start

# 4. Comparer avec main
git checkout main
npm run build
git checkout speed-up-imports

# 5. Revenir à la branche optimisée
git checkout speed-up-imports
```

---

## 📊 Résultats Attendus

### **Gains de Performance:**
- 🚀 **30-40%** réduction bundle initial
- 🚀 **-200KB à -500KB** de JavaScript initial
- 🚀 **1-2s** plus rapide Time to Interactive
- 🚀 **Lazy loading** de Chart.js (~250KB)
- 🚀 **Code splitting** effectif pour formulaires lourds

### **Impact par Page:**

| Page | Bundle Avant | Bundle Après | Gain |
|------|--------------|--------------|------|
| Sign In | ~800KB | ~400KB | -50% |
| Dashboard | ~1.2MB | ~1MB | -16% |
| Subscriptions List | ~900KB | ~500KB | -44% |
| New Plan Form | ~850KB | ~450KB | -47% |

---

## 🐛 Troubleshooting

### **Bundle Analyzer ne s'ouvre pas:**
```powershell
# Forcer l'ouverture du fichier HTML généré
start .next/analyze/client.html
```

### **ANALYZE variable non reconnue:**
```powershell
# Alternative Windows
set ANALYZE=true && npm run build

# Alternative avec cross-env
npm install --save-dev cross-env
# Modifier package.json: "cross-env ANALYZE=true next build"
```

### **Lighthouse scores bas:**
- Désactiver les extensions Chrome
- Tester en mode Incognito
- S'assurer que le serveur local n'a pas d'autres processus lourds
