# 📚 Documentation API - Le Roi's Table

## 🔌 Supabase Edge Functions

### 1. **fedapay-pay** - Initier un paiement FedaPay

**Endpoint** : `POST /functions/v1/fedapay-pay`

**Headers** :
```json
{
  "apikey": "your-supabase-anon-key",
  "Content-Type": "application/json"
}
```

**Body** :
```json
{
  "amount": 50000,
  "customer_name": "Jean Dupont",
  "customer_phone": "+22997123456",
  "order_id": "uuid-de-la-commande"
}
```

**Réponse succès** :
```json
{
  "success": true,
  "payment_url": "https://process.fedapay.com/XXXXX",
  "transaction_id": "trx_XXXXXX"
}
```

**Réponse erreur** :
```json
{
  "error": "Payment creation failed",
  "details": {...}
}
```

---

### 2. **mobile-money-pay** - Paiement Mobile Money

**Endpoint** : `POST /functions/v1/mobile-money-pay`

**Body** :
```json
{
  "amount": 50000,
  "customer_name": "Jean Dupont",
  "customer_phone": "+22997123456",
  "order_id": "uuid-de-la-commande",
  "provider": "mtn" // ou "moov"
}
```

**Réponse** :
```json
{
  "success": true,
  "requires_manual_confirmation": true,
  "message": "Veuillez envoyer le montant via MTN Mobile Money...",
  "phone_number": "+22997123456",
  "amount": 50000
}
```

---

### 3. **fedapay-webhook** - Webhook de notification FedaPay

**Endpoint** : `POST /functions/v1/fedapay-webhook`

**Note** : Cette fonction est appelée automatiquement par FedaPay

**Body (envoyé par FedaPay)** :
```json
{
  "entity": {
    "id": "trx_XXXXXX",
    "status": "approved", // ou "declined", "canceled"
    "description": "Commande La Cave du Roi #uuid",
    "amount": 50000,
    "reason": "Insufficient funds" // en cas d'erreur
  }
}
```

**Actions** :
- `approved` : Met à jour `payment_status` à `paye` et `status` à `en_preparation`
- `declined` : Ajoute une note dans `notes`
- `canceled` : Ajoute une note dans `notes`

---

## 🗃️ Base de Données - Tables

### **orders**
```sql
id UUID PRIMARY KEY
customer_name TEXT
phone TEXT
address TEXT
delivery_mode TEXT ('livraison' | 'sur_place')
total_price INTEGER
status TEXT ('en_attente' | 'en_preparation' | 'livree')
payment_status TEXT ('en_attente' | 'paye')
payment_method TEXT ('fedapay' | 'mtn_money' | 'moov_money' | 'cash' | 'card')
transaction_id TEXT
payment_date TIMESTAMPTZ
notes TEXT
created_at TIMESTAMPTZ
```

### **order_items**
```sql
id UUID PRIMARY KEY
order_id UUID (FK -> orders)
menu_item_id UUID (FK -> menu_items)
quantity INTEGER
price INTEGER
```

### **menu_items**
```sql
id UUID PRIMARY KEY
name TEXT
description TEXT
price INTEGER
image_url TEXT
category TEXT ('specialites' | 'plats-rapides' | 'accompagnements' | 'boissons' | 'vins')
available BOOLEAN
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### **events**
```sql
id UUID PRIMARY KEY
name TEXT
description TEXT
date TIMESTAMPTZ
image_url TEXT
active BOOLEAN
created_at TIMESTAMPTZ
```

### **user_roles**
```sql
id UUID PRIMARY KEY
user_id UUID (FK -> auth.users)
role app_role ('admin' | 'user')
```

---

## 🔧 Fonctions SQL Personnalisées

### **get_order_details(order_uuid)**
Retourne tous les détails d'une commande avec les items

**Usage** :
```sql
SELECT * FROM get_order_details('uuid-de-la-commande');
```

**Retour** :
- Infos commande (client, adresse, prix, statut)
- Items (nom, quantité, prix)

---

### **get_sales_stats(days_count)**
Statistiques de vente pour les N derniers jours

**Usage** :
```sql
SELECT * FROM get_sales_stats(30);
```

**Retour** :
```
date          | total_orders | total_revenue | paid_orders | pending_orders
--------------+--------------+---------------+-------------+----------------
2026-03-20    | 15           | 450000        | 12          | 3
2026-03-19    | 10           | 320000        | 8           | 2
...
```

---

### **get_top_products(limit_count)**
Produits les plus vendus

**Usage** :
```sql
SELECT * FROM get_top_products(10);
```

**Retour** :
```
product_name    | total_quantity | total_revenue | order_count
----------------+----------------+---------------+-------------
Poulet DG       | 150            | 1500000       | 75
Attiéké Poisson | 120            | 600000        | 60
...
```

---

## 🔐 Row Level Security (RLS)

### Politique de sécurité

**orders** :
- ✅ Tout le monde peut créer une commande (INSERT)
- ✅ Tout le monde peut voir les commandes (SELECT) - pour tracking
- 🔒 Seuls les admins peuvent mettre à jour (UPDATE)

**menu_items** :
- ✅ Tout le monde peut voir le menu (SELECT)
- 🔒 Seuls les admins peuvent gérer (INSERT/UPDATE/DELETE)

**events** :
- ✅ Tout le monde peut voir les événements actifs (SELECT)
- 🔒 Seuls les admins peuvent gérer (INSERT/UPDATE/DELETE)

**user_roles** :
- ✅ Les utilisateurs peuvent voir leurs propres rôles
- 🔒 Seuls les admins peuvent gérer les rôles

---

## 📊 Flux de Paiement

### Flux FedaPay (Carte Bancaire)
```
1. Client clique "Payer" → Appel à fedapay-pay
2. Création transaction FedaPay → Génération token
3. Redirection vers FedaPay → Client paie
4. FedaPay notifie webhook → Mise à jour statut
5. Redirection client → Page de succès
```

### Flux Mobile Money (MTN/Moov)
```
1. Client clique "Payer" → Appel à mobile-money-pay
2. Fonction enregistre la demande → Note ajoutée
3. Client effectue le transfert manuellement
4. Admin confirme le paiement → Statut mis à jour
```

### Flux Espèces
```
1. Client clique "Commander" → Commande créée
2. payment_method = 'cash'
3. Paiement à la livraison
4. Livreur confirme → Admin met à jour
```

---

## 🧪 Tests avec cURL

### Créer une commande test
```bash
curl -X POST 'https://your-project.supabase.co/rest/v1/orders' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "phone": "+22997123456",
    "delivery_mode": "livraison",
    "total_price": 50000,
    "address": "Cotonou, Bénin"
  }'
```

### Tester paiement FedaPay
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/fedapay-pay' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "customer_name": "Test User",
    "customer_phone": "+22997123456",
    "order_id": "ORDER_UUID"
  }'
```

---

## 📞 Contacts API

- **FedaPay** : https://docs.fedapay.com
- **Supabase** : https://supabase.com/docs
- **Support FedaPay** : support@fedapay.com

---

**Dernière mise à jour** : 20 Mars 2026
