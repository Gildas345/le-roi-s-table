import { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const Commande = () => {
  const { items, updateQuantity, removeItem, totalPrice, clearCart, totalItems } = useCart();
  const [form, setForm] = useState({ name: '', phone: '', address: '', mode: 'livraison' as 'livraison' | 'sur_place' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    setSubmitting(true);
    // TODO: Save to Supabase & redirect to FedaPay
    setTimeout(() => {
      toast.success('Commande enregistrée ! Redirection vers le paiement...');
      clearCart();
      setSubmitting(false);
    }, 1500);
  };

  return (
    <>
      <PageHeader title="Votre Commande" subtitle="Finalisez votre commande et régalez-vous" />
      <section className="section-padding">
        <div className="container-custom grid gap-8 lg:grid-cols-5">
          {/* Cart */}
          <div className="lg:col-span-3">
            <AnimatedSection>
              <h2 className="font-display text-2xl font-semibold text-foreground">Panier ({totalItems})</h2>
              {items.length === 0 ? (
                <div className="mt-6 rounded-lg border border-border bg-card p-12 text-center">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
                  <p className="mt-4 text-muted-foreground">Votre panier est vide</p>
                  <Link to="/specialites">
                    <Button className="mt-4 bg-primary text-primary-foreground">Voir le menu</Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {items.map((ci) => (
                    <div key={ci.item.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                      <div className="h-16 w-16 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
                        <span className="text-2xl">🍽</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-semibold text-foreground truncate">{ci.item.name}</h4>
                        <p className="text-sm text-accent font-semibold">{ci.item.price.toLocaleString('fr-FR')} FCFA</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQuantity(ci.item.id, ci.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-semibold">{ci.quantity}</span>
                        <button onClick={() => updateQuantity(ci.item.id, ci.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-md border border-border hover:bg-muted">
                          <Plus className="h-4 w-4" />
                        </button>
                        <button onClick={() => removeItem(ci.item.id)} className="ml-2 text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </button>
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

          {/* Order form */}
          <div className="lg:col-span-2">
            <AnimatedSection delay={0.2}>
              <h2 className="font-display text-2xl font-semibold text-foreground">Informations</h2>
              <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-lg border border-border bg-card p-6">
                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Votre nom" />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="+229 XX XX XX XX" />
                </div>
                <div>
                  <Label>Mode de livraison</Label>
                  <div className="mt-2 flex gap-3">
                    {(['livraison', 'sur_place'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setForm({ ...form, mode: m })}
                        className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                          form.mode === m ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'
                        }`}
                      >
                        {m === 'livraison' ? '🚗 Livraison' : '🏠 Sur place'}
                      </button>
                    ))}
                  </div>
                </div>
                {form.mode === 'livraison' && (
                  <div>
                    <Label htmlFor="address">Adresse de livraison</Label>
                    <Input id="address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required placeholder="Votre adresse" />
                  </div>
                )}
                <Button type="submit" disabled={submitting || items.length === 0} className="w-full gold-gradient text-accent-foreground font-semibold hover:opacity-90" size="lg">
                  {submitting ? 'Traitement...' : `Payer ${totalPrice.toLocaleString('fr-FR')} FCFA`}
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
