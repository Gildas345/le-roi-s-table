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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Votre panier est vide'); return; }
    setSubmitting(true);

    let orderId = '';
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: form.name,
          phone: form.phone,
          address: form.mode === 'livraison' ? form.address : null,
          delivery_mode: form.mode,
          total_price: totalPrice,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;
      orderId = orderData.id;

      // Create order items
      const itemsToCreate = [];
      for (const ci of items) {
        const { data: menuItem } = await supabase
          .from('menu_items')
          .select('id')
          .eq('name', ci.item.name)
          .single();

        if (menuItem) {
          itemsToCreate.push({
            order_id: orderId,
            menu_item_id: menuItem.id,
            quantity: ci.quantity,
            price: ci.item.price,
          });
        }
      }

      if (itemsToCreate.length > 0) {
        await supabase.from('order_items').insert(itemsToCreate);
      }

      // Handle payment
      if (paymentMethod === 'cash') {
        toast.success('Commande enregistrée ! Paiement en espèces à la livraison.');
        clearCart();
        navigate(`/payment-success?order_id=${orderId}`);
        return;
      }

      if (paymentMethod === 'fedapay') {
        const { data: payData, error: payError } = await supabase.functions.invoke('fedapay-pay', {
          body: { amount: totalPrice, customer_name: form.name, customer_phone: form.phone, order_id: orderId },
        });
        if (payError) throw payError;
        if (payData?.payment_url) {
          clearCart();
          window.location.href = payData.payment_url;
        } else {
          toast.success('Commande enregistrée !');
          clearCart();
          navigate(`/payment-success?order_id=${orderId}`);
        }
      } else if (paymentMethod === 'mtn_money' || paymentMethod === 'moov_money') {
        const { data: payData, error: payError } = await supabase.functions.invoke('mobile-money-pay', {
          body: {
            amount: totalPrice, customer_name: form.name, customer_phone: form.phone, order_id: orderId,
            provider: paymentMethod === 'mtn_money' ? 'mtn' : 'moov',
          },
        });
        if (payError) throw payError;
        toast.success(payData?.message || 'Commande enregistrée !');
        clearCart();
        navigate(`/payment-success?order_id=${orderId}`);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Erreur lors de la commande. Veuillez réessayer.');
      if (orderId) navigate(`/payment-error?order_id=${orderId}&message=${encodeURIComponent(err.message || 'Erreur inconnue')}`);
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
                  <div className="flex items-center justify-between rounded-lg bg-primary p-4">
                    <span className="font-display text-lg font-semibold text-primary-foreground">Total</span>
                    <span className="font-display text-2xl font-bold text-accent">{totalPrice.toLocaleString('fr-FR')} FCFA</span>
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

                <div>
                  <Label>Méthode de paiement</Label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {([
                      { key: 'fedapay' as const, icon: CreditCard, label: 'Carte bancaire', sub: 'FedaPay' },
                      { key: 'mtn_money' as const, icon: Smartphone, label: 'MTN Money', sub: 'Mobile Money' },
                      { key: 'moov_money' as const, icon: Smartphone, label: 'Moov Money', sub: 'Mobile Money' },
                      { key: 'cash' as const, icon: Wallet, label: 'Espèces', sub: 'À la livraison' },
                    ]).map(({ key, icon: Icon, label, sub }) => (
                      <button key={key} type="button" onClick={() => setPaymentMethod(key)}
                        className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${paymentMethod === key ? 'border-primary bg-primary/10 ring-2 ring-primary' : 'border-border hover:bg-muted'}`}>
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{label}</span>
                        <span className="text-xs text-muted-foreground">{sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button type="submit" disabled={submitting || items.length === 0} className="w-full gold-gradient text-accent-foreground font-semibold hover:opacity-90" size="lg">
                  {submitting ? 'Traitement...' : paymentMethod === 'cash' ? `Commander ${totalPrice.toLocaleString('fr-FR')} FCFA` : `Payer ${totalPrice.toLocaleString('fr-FR')} FCFA`}
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
