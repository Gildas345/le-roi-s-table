import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Smartphone, Wallet } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type PaymentMethod = 'fedapay' | 'mtn_money' | 'moov_money' | 'cash';

const Commande = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, totalPrice, clearCart, totalItems } = useCart();
  const [form, setForm] = useState({ name: '', phone: '', address: '', mode: 'livraison' as 'livraison' | 'sur_place' });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fedapay');
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const finalPrice = totalPrice - couponDiscount;

  const finalPrice = totalPrice - couponDiscount;

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Entrez un code promo');
      return;
    }

    setValidatingCoupon(true);
    try {
      const { data, error } = await supabase
        .rpc('validate_coupon', {
          coupon_code_input: couponCode.toUpperCase(),
          order_amount: totalPrice,
        });

      if (error) throw error;

      const result = data[0];
      
      if (result.valid) {
        setCouponDiscount(result.discount_amount);
        setCouponMessage(result.message);
        setCouponApplied(true);
        toast.success(result.message);
      } else {
        setCouponDiscount(0);
        setCouponMessage(result.message);
        setCouponApplied(false);
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Coupon validation error:', error);
      toast.error('Erreur lors de la validation du code promo');
      setCouponDiscount(0);
      setCouponApplied(false);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponMessage('');
    setCouponApplied(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Votre panier est vide'); return; }
    setSubmitting(true);

    try {
      // Create order in Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name,
          phone: form.phone,
          address: form.mode === 'livraison' ? form.address : null,
          delivery_mode: form.mode,
          total_price: finalPrice,
          coupon_code: couponApplied ? couponCode.toUpperCase() : null,
          discount_amount: couponDiscount,
          payment_method: paymentMethod === 'cash' ? 'cash' : undefined,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Apply coupon if used
      if (couponApplied && couponCode) {
        await supabase.rpc('apply_coupon', {
          coupon_code_input: couponCode.toUpperCase(),
          order_id_input: order.id,
          discount_amount_input: couponDiscount,
        });
      }

      // Create order items - get real menu items from DB to get UUIDs
      const itemsToCreate = [];
      for (const ci of items) {
        // Try to find the menu item in Supabase by name
        const { data: menuItem, error: menuError } = await supabase
          .from('menu_items')
          .select('id')
          .eq('name', ci.item.name)
          .single();

        if (menuError || !menuItem) {
          console.error('Menu item not found:', ci.item.name);
          continue; // Skip items not found in DB
        }

        itemsToCreate.push({
          order_id: order.id,
          menu_item_id: menuItem.id,
          quantity: ci.quantity,
          price: ci.item.price,
        });
      }

      // Insert order items if any
      if (itemsToCreate.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToCreate);

        if (itemsError) {
          console.error('Error creating order items:', itemsError);
        }
      }

      // Handle different payment methods
      if (paymentMethod === 'cash') {
        // Send email notification to admin
        try {
          await supabase.functions.invoke('send-email', {
            body: { order_id: order.id, type: 'new_order' },
          });
        } catch (emailError) {
          console.error('Email error:', emailError);
          // Don't block the flow if email fails
        }

        // Cash payment - no online payment needed
        toast.success('Commande enregistrée ! Paiement en espèces à la livraison.');
        clearCart();
        navigate(`/payment-success?order_id=${order.id}`);
        return;
      }

      if (paymentMethod === 'fedapay') {
        // Send email notification to admin
        try {
          await supabase.functions.invoke('send-email', {
            body: { order_id: order.id, type: 'new_order' },
          });
        } catch (emailError) {
          console.error('Email error:', emailError);
        }

        // FedaPay payment
        const { data: payData, error: payError } = await supabase.functions.invoke('fedapay-pay', {
          body: {
            amount: finalPrice,
            customer_name: form.name,
            customer_phone: form.phone,
            order_id: order.id,
          },
        });

        if (payError) throw payError;

        if (payData?.payment_url) {
          clearCart();
          window.location.href = payData.payment_url;
        } else {
          toast.success('Commande enregistrée ! Nous vous contacterons pour le paiement.');
          clearCart();
          navigate(`/payment-success?order_id=${order.id}`);
        }
      } else if (paymentMethod === 'mtn_money' || paymentMethod === 'moov_money') {
        // Send email notification to admin
        try {
          await supabase.functions.invoke('send-email', {
            body: { order_id: order.id, type: 'new_order' },
          });
        } catch (emailError) {
          console.error('Email error:', emailError);
        }

        // Mobile Money payment
        const { data: payData, error: payError } = await supabase.functions.invoke('mobile-money-pay', {
          body: {
            amount: finalPrice,
            customer_name: form.name,
            customer_phone: form.phone,
            order_id: order.id,
            provider: paymentMethod === 'mtn_money' ? 'mtn' : 'moov',
          },
        });

        if (payError) throw payError;

        if (payData?.requires_manual_confirmation) {
          toast.success(payData.message || 'Commande enregistrée ! Veuillez effectuer le paiement Mobile Money.');
          clearCart();
          navigate(`/payment-success?order_id=${order.id}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur lors de la commande. Veuillez réessayer.');
      navigate(`/payment-error?order_id=${order?.id || ''}&message=${encodeURIComponent(err.message || 'Erreur inconnue')}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Votre Commande" subtitle="Finalisez votre commande et régalez-vous" />
      <section className="section-padding">
        <div className="container-custom grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <AnimatedSection>
              <h2 className="font-display text-2xl font-semibold text-foreground">Panier ({totalItems})</h2>
              {items.length === 0 ? (
                <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-4 text-muted-foreground">Votre panier est vide</p>
                  <Link to="/specialites"><Button className="mt-4 bg-primary text-primary-foreground">Voir le menu</Button></Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {items.map((ci) => (
                    <div key={ci.item.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                      <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                        {ci.item.image ? (
                          <img src={ci.item.image} alt={ci.item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center"><span className="text-2xl">🍽</span></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-semibold text-foreground truncate">{ci.item.name}</h4>
                        <p className="text-sm text-accent font-semibold">{ci.item.price.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(ci.item.id, ci.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted"><Minus className="h-4 w-4" /></button>
                        <span className="w-8 text-center font-semibold">{ci.quantity}</span>
                        <button onClick={() => updateQuantity(ci.item.id, ci.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted"><Plus className="h-4 w-4" /></button>
                        <button onClick={() => removeItem(ci.item.id)} className="ml-2 text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Subtotal and Discount */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-4">
                      <span className="font-display text-sm text-foreground">Sous-total</span>
                      <span className="font-display text-lg font-semibold text-foreground">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                    
                    {couponDiscount > 0 && (
                      <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-200 p-4">
                        <span className="font-display text-sm text-green-800">Réduction ({couponCode})</span>
                        <span className="font-display text-lg font-semibold text-green-600">-{couponDiscount.toLocaleString('fr-FR')} FCFA</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between rounded-lg bg-primary p-4">
                      <span className="font-display text-lg font-semibold text-primary-foreground">Total</span>
                      <span className="font-display text-2xl font-bold text-accent">{finalPrice.toLocaleString('fr-FR')} FCFA</span>
                    </div>
                  </div>
                </div>
              )}
            </AnimatedSection>
          </div>

          <div className="lg:col-span-2">
            <AnimatedSection delay={0.2}>
              <h2 className="font-display text-2xl font-semibold text-foreground">Informations</h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-lg border border-border bg-card p-6">
                <div><Label htmlFor="name">Nom complet</Label><Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Votre nom" /></div>
                <div><Label htmlFor="phone">Téléphone</Label><Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+229 XX XX XX XX" /></div>
                <div>
                  <Label>Mode de livraison</Label>
                  <div className="mt-2 flex gap-3">
                    {(['livraison', 'sur_place'] as const).map((m) => (
                      <button key={m} type="button" onClick={() => setForm({ ...form, mode: m })} className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${form.mode === m ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>
                        {m === 'livraison' ? '🚗 Livraison' : '🏠 Sur place'}
                      </button>
                    ))}
                  </div>
                </div>
                {form.mode === 'livraison' && (
                  <div><Label htmlFor="address">Adresse de livraison</Label><Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required placeholder="Votre adresse" /></div>
                )}
                
                {/* Coupon Code */}
                <div>
                  <Label htmlFor="coupon">Code promo (optionnel)</Label>
                  <div className="mt-2 flex gap-2">
                    <Input 
                      id="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTRER CODE"
                      disabled={couponApplied}
                      className="flex-1"
                    />
                    {!couponApplied ? (
                      <Button
                        type="button"
                        onClick={validateCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        variant="outline"
                      >
                        {validatingCoupon ? 'Vérif...' : 'Appliquer'}
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        onClick={removeCoupon}
                        variant="outline"
                      >
                        Retirer
                      </Button>
                    )}
                  </div>
                  {couponMessage && (
                    <p className={`mt-2 text-sm ${couponApplied ? 'text-green-600' : 'text-red-600'}`}>
                      {couponMessage}
                    </p>
                  )}
                  {couponApplied && couponDiscount > 0 && (
                    <div className="mt-2 rounded-lg bg-green-50 border border-green-200 p-3">
                      <p className="text-sm font-medium text-green-800">
                        🎉 Réduction appliquée: -{couponDiscount.toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label>Méthode de paiement</Label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('fedapay')}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                        paymentMethod === 'fedapay'
                          ? 'border-primary bg-primary/10 ring-2 ring-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <CreditCard className="h-6 w-6" />
                      <span className="text-sm font-medium">Carte bancaire</span>
                      <span className="text-xs text-muted-foreground">FedaPay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mtn_money')}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                        paymentMethod === 'mtn_money'
                          ? 'border-primary bg-primary/10 ring-2 ring-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Smartphone className="h-6 w-6" />
                      <span className="text-sm font-medium">MTN Money</span>
                      <span className="text-xs text-muted-foreground">Mobile Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('moov_money')}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                        paymentMethod === 'moov_money'
                          ? 'border-primary bg-primary/10 ring-2 ring-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Smartphone className="h-6 w-6" />
                      <span className="text-sm font-medium">Moov Money</span>
                      <span className="text-xs text-muted-foreground">Mobile Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                        paymentMethod === 'cash'
                          ? 'border-primary bg-primary/10 ring-2 ring-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Wallet className="h-6 w-6" />
                      <span className="text-sm font-medium">Espèces</span>
                      <span className="text-xs text-muted-foreground">À la livraison</span>
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={submitting || items.length === 0} className="w-full gold-gradient text-accent-foreground font-semibold hover:opacity-90" size="lg">
                  {submitting ? 'Traitement...' : paymentMethod === 'cash' ? `Commander ${finalPrice.toLocaleString('fr-FR')} FCFA` : `Payer ${finalPrice.toLocaleString('fr-FR')} FCFA`}
                  {couponDiscount > 0 && !submitting && (
                    <span className="ml-2 text-xs opacity-80">
                      (Économie: {couponDiscount.toLocaleString('fr-FR')} FCFA)
                    </span>
                  )}
                </Button>
              </form>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
};

export default Commande;
