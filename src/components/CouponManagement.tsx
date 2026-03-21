import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Edit, Eye, EyeOff, Percent, DollarSign } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}

const CouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<string | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_order_amount: '0',
    max_discount_amount: '',
    usage_limit: '',
    valid_until: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des coupons');
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  };

  const saveCoupon = async () => {
    const payload = {
      code: couponForm.code.toUpperCase(),
      description: couponForm.description || null,
      discount_type: couponForm.discount_type,
      discount_value: parseInt(couponForm.discount_value),
      min_order_amount: parseInt(couponForm.min_order_amount) || 0,
      max_discount_amount: couponForm.max_discount_amount ? parseInt(couponForm.max_discount_amount) : null,
      usage_limit: couponForm.usage_limit ? parseInt(couponForm.usage_limit) : null,
      valid_until: couponForm.valid_until || null,
      active: true,
    };

    if (editingCoupon) {
      const { error } = await supabase
        .from('coupons')
        .update(payload)
        .eq('id', editingCoupon);

      if (error) {
        toast.error('Erreur lors de la modification');
        return;
      }
      toast.success('Coupon modifié');
    } else {
      const { error } = await supabase
        .from('coupons')
        .insert(payload);

      if (error) {
        toast.error('Erreur lors de la création');
        return;
      }
      toast.success('Coupon créé');
    }

    resetForm();
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Erreur lors de la suppression');
    } else {
      toast.success('Coupon supprimé');
      fetchCoupons();
    }
  };

  const toggleCouponActive = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('coupons')
      .update({ active: !active })
      .eq('id', id);

    if (error) {
      toast.error('Erreur');
    } else {
      fetchCoupons();
    }
  };

  const editCoupon = (coupon: Coupon) => {
    setCouponForm({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: String(coupon.discount_value),
      min_order_amount: String(coupon.min_order_amount),
      max_discount_amount: coupon.max_discount_amount ? String(coupon.max_discount_amount) : '',
      usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
      valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 16) : '',
    });
    setEditingCoupon(coupon.id);
  };

  const resetForm = () => {
    setCouponForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_order_amount: '0',
      max_discount_amount: '',
      usage_limit: '',
      valid_until: '',
    });
    setEditingCoupon(null);
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <h3 className="font-semibold">
          {editingCoupon ? 'Modifier le coupon' : 'Créer un coupon'}
        </h3>
        
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Code (ex: BIENVENUE10)</Label>
            <Input
              value={couponForm.code}
              onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
              placeholder="CODE"
            />
          </div>

          <div>
            <Label>Description</Label>
            <Input
              value={couponForm.description}
              onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
              placeholder="Réduction pour nouveaux clients"
            />
          </div>

          <div>
            <Label>Type de réduction</Label>
            <select
              value={couponForm.discount_type}
              onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value as 'percentage' | 'fixed' })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="percentage">Pourcentage (%)</option>
              <option value="fixed">Montant fixe (FCFA)</option>
            </select>
          </div>

          <div>
            <Label>
              Valeur {couponForm.discount_type === 'percentage' ? '(%)' : '(FCFA)'}
            </Label>
            <Input
              type="number"
              value={couponForm.discount_value}
              onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })}
              placeholder={couponForm.discount_type === 'percentage' ? '10' : '500'}
            />
          </div>

          <div>
            <Label>Commande minimum (FCFA)</Label>
            <Input
              type="number"
              value={couponForm.min_order_amount}
              onChange={(e) => setCouponForm({ ...couponForm, min_order_amount: e.target.value })}
              placeholder="0"
            />
          </div>

          {couponForm.discount_type === 'percentage' && (
            <div>
              <Label>Réduction max (FCFA, optionnel)</Label>
              <Input
                type="number"
                value={couponForm.max_discount_amount}
                onChange={(e) => setCouponForm({ ...couponForm, max_discount_amount: e.target.value })}
                placeholder="2000"
              />
            </div>
          )}

          <div>
            <Label>Limite d'utilisation (optionnel)</Label>
            <Input
              type="number"
              value={couponForm.usage_limit}
              onChange={(e) => setCouponForm({ ...couponForm, usage_limit: e.target.value })}
              placeholder="Illimité"
            />
          </div>

          <div>
            <Label>Date d'expiration (optionnel)</Label>
            <Input
              type="datetime-local"
              value={couponForm.valid_until}
              onChange={(e) => setCouponForm({ ...couponForm, valid_until: e.target.value })}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={saveCoupon} className="bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" />
            {editingCoupon ? 'Modifier' : 'Créer'}
          </Button>
          {editingCoupon && (
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
          )}
        </div>
      </div>

      {/* Coupons List */}
      <div className="space-y-2">
        <h3 className="font-semibold">Coupons ({coupons.length})</h3>
        {coupons.map((coupon) => (
          <div key={coupon.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-lg text-primary">{coupon.code}</span>
                  {coupon.discount_type === 'percentage' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                      <Percent className="h-3 w-3" />
                      {coupon.discount_value}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      <DollarSign className="h-3 w-3" />
                      {coupon.discount_value} FCFA
                    </span>
                  )}
                  <span className={`text-xs ${coupon.active ? 'text-green-600' : 'text-gray-400'}`}>
                    {coupon.active ? '🟢 Actif' : '🔴 Inactif'}
                  </span>
                </div>
                
                {coupon.description && (
                  <p className="text-sm text-muted-foreground mb-2">{coupon.description}</p>
                )}
                
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {coupon.min_order_amount > 0 && (
                    <span>Min: {coupon.min_order_amount.toLocaleString('fr-FR')} FCFA</span>
                  )}
                  {coupon.max_discount_amount && (
                    <span>Max réduction: {coupon.max_discount_amount.toLocaleString('fr-FR')} FCFA</span>
                  )}
                  {coupon.usage_limit && (
                    <span>Utilisé: {coupon.usage_count}/{coupon.usage_limit}</span>
                  )}
                  {!coupon.usage_limit && coupon.usage_count > 0 && (
                    <span>Utilisé: {coupon.usage_count} fois</span>
                  )}
                  {coupon.valid_until && (
                    <span>Expire: {new Date(coupon.valid_until).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 ml-4">
                <button
                  onClick={() => toggleCouponActive(coupon.id, coupon.active)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  title={coupon.active ? 'Désactiver' : 'Activer'}
                >
                  {coupon.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => editCoupon(coupon)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  title="Modifier"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteCoupon(coupon.id)}
                  className="p-2 text-destructive hover:text-destructive/80"
                  title="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucun coupon créé</p>
        )}
      </div>
    </div>
  );
};

export default CouponManagement;
