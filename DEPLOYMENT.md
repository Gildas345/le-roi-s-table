# 🚀 Guide de Déploiement - Le Roi's Table

## 📋 Ce qui a été développé

### ✅ Système de Paiement Complet
- **FedaPay** : Paiement par carte bancaire avec webhook
- **MTN Mobile Money** : Paiement mobile MTN
- **Moov Money** : Paiement mobile Moov
- **Espèces** : Paiement à la livraison

### ✅ Dashboard Admin Amélioré
- Gestion complète des commandes avec détails
- Statistiques avancées avec graphiques (Recharts)
- Gestion du menu et des événements
- Suivi des paiements en temps réel

### ✅ Pages Clients
- Page de confirmation de paiement
- Page d'erreur de paiement
- Sélection de méthode de paiement

---

## 🔧 Instructions de Déploiement

### 1️⃣ **Appliquer la Migration Supabase**

1. Connecte-toi à ton projet Supabase (https://app.supabase.com)
2. Va dans **SQL Editor**
3. Copie et exécute le contenu de : `supabase/migrations/20260320000000_improve_payment_system.sql`
4. Vérifie que tout s'est bien exécuté (pas d'erreurs)

### 2️⃣ **Déployer les Edge Functions Supabase**

#### Installation du CLI Supabase (si pas déjà fait)
```bash
npm install -g supabase
```

#### Login et déploiement
```bash
# Login
supabase login

# Link ton projet (remplace [PROJECT_ID] par ton ID de projet)
supabase link --project-ref [PROJECT_ID]

# Déployer les fonctions
supabase functions deploy fedapay-pay
supabase functions deploy fedapay-webhook
supabase functions deploy mobile-money-pay
```

### 3️⃣ **Configurer les Variables d'Environnement**

#### Dans Supabase Dashboard
1. Va dans **Settings** > **Edge Functions** > **Secrets**
2. Ajoute les secrets suivants :

```
FEDAPAY_SECRET_KEY=sk_live_XXXXXXXXXXXXXX
SUPABASE_URL=https://[ton-projet].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyXXXXXXXXXXXXXXXXXX
```

#### Optionnel (pour MTN/Moov API quand disponibles)
```
MTN_API_KEY=ton_api_key_mtn
MTN_API_SECRET=ton_api_secret_mtn
MOOV_API_KEY=ton_api_key_moov
MOOV_API_SECRET=ton_api_secret_moov
```

### 4️⃣ **Obtenir ta Clé API FedaPay**

1. Va sur https://fedapay.com et crée un compte
2. Va dans **Paramètres** > **API**
3. Copie ta **Secret Key** (commence par `sk_live_` ou `sk_sandbox_`)
4. Ajoute-la dans Supabase comme montré ci-dessus

### 5️⃣ **Build et Déploiement Frontend**

#### Option A : Netlify (Recommandé)
```bash
npm run build
# Puis upload le dossier 'dist' sur Netlify
```

Ou connecte ton repo GitHub à Netlify :
- Build command : `npm run build`
- Publish directory : `dist`

#### Option B : Vercel
```bash
npm run build
vercel deploy --prod
```

### 6️⃣ **Configuration Post-Déploiement**

#### Créer un utilisateur Admin
1. Va dans Supabase Dashboard > **Authentication** > **Users**
2. Crée un nouvel utilisateur ou note l'ID d'un utilisateur existant
3. Va dans **Table Editor** > **user_roles**
4. Insère une nouvelle ligne :
   - `user_id` : L'UUID de l'utilisateur
   - `role` : `admin`

#### Configurer le Webhook FedaPay
1. Va dans FedaPay Dashboard > **Webhooks**
2. Ajoute l'URL : `https://[ton-projet].supabase.co/functions/v1/fedapay-webhook`
3. Active les événements : `transaction.approved`, `transaction.declined`, `transaction.canceled`

---

## 🧪 Tests à Effectuer

### ✅ Checklist de Tests

#### Frontend
- [ ] Page d'accueil charge correctement
- [ ] Menu s'affiche avec les catégories
- [ ] Ajout au panier fonctionne
- [ ] Page de commande affiche les 4 méthodes de paiement

#### Paiements
- [ ] Test paiement FedaPay (mode sandbox)
- [ ] Test paiement MTN Money
- [ ] Test paiement Moov Money
- [ ] Test paiement en espèces
- [ ] Redirection vers page de succès
- [ ] Redirection vers page d'erreur en cas d'échec

#### Admin
- [ ] Login admin fonctionne
- [ ] Liste des commandes s'affiche
- [ ] Bouton "Détails" ouvre le modal
- [ ] Changement de statut de commande
- [ ] Onglet Statistiques affiche les graphiques
- [ ] Gestion du menu (ajout/modification/suppression)
- [ ] Gestion des événements

#### Webhook FedaPay
- [ ] Faire un paiement test
- [ ] Vérifier que le statut se met à jour automatiquement
- [ ] Vérifier les logs dans Supabase Functions Logs

---

## 📱 URLs Importantes

- **Frontend (production)** : [À remplir après déploiement]
- **Supabase Project** : https://app.supabase.com/project/[PROJECT_ID]
- **FedaPay Dashboard** : https://dashboard.fedapay.com
- **Admin Login** : [URL_FRONTEND]/admin/login

---

## 🐛 Troubleshooting

### Erreur : "FedaPay not configured"
➡️ Vérifie que `FEDAPAY_SECRET_KEY` est bien ajouté dans les Secrets Supabase

### Erreur : "Payment creation failed"
➡️ Vérifie que ta clé API FedaPay est valide et n'est pas expirée

### Les commandes ne se mettent pas à jour après paiement
➡️ Vérifie que le webhook FedaPay est bien configuré avec la bonne URL

### Les graphiques ne s'affichent pas dans les stats
➡️ Vérifie que la migration SQL a bien été exécutée et que les fonctions `get_sales_stats` et `get_top_products` existent

### Modal de détails ne s'ouvre pas
➡️ Vérifie la console browser pour les erreurs. Assure-toi que le composant Dialog de shadcn/ui est bien installé

---

## 📞 Support

Pour toute question sur le déploiement, vérifie :
1. Les logs Supabase Functions : **Logs** dans le dashboard
2. Les erreurs browser : Console développeur (F12)
3. Les logs serveur : Network tab dans les DevTools

---

## 🎉 Prochaines Étapes (Fonctionnalités Bonus)

- [ ] Intégration SMS Twilio pour notifications
- [ ] Export Excel des commandes
- [ ] Page de tracking client avec numéro de commande
- [ ] Dashboard analytics avancé
- [ ] Programme de fidélité
- [ ] Système de réduction/coupons

---

**Bon déploiement ! 🚀**
