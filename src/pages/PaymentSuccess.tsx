import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Package, Clock, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';

interface OrderDetails {
  id: string;
  customer_name: string;
  phone: string;
  address: string | null;
  delivery_mode: string;
  total_price: number;
  status: string;
  payment_status: string;
  created_at: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const orderId = searchParams.get('order_id');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <PageHeader title="Paiement Réussi" subtitle="Merci pour votre commande !" />
      <section className="section-padding">
        <div className="container-custom max-w-2xl">
          <AnimatedSection>
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Paiement confirmé !
              </h2>
              <p className="text-muted-foreground mb-6">
                Votre commande a été enregistrée avec succès
              </p>

              {order && (
                <div className="space-y-4 text-left bg-muted/50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-sm text-muted-foreground">Numéro de commande</span>
                    <span className="font-mono font-semibold">#{order.id.slice(0, 8)}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <span className="text-sm text-muted-foreground">Montant payé</span>
                    <span className="font-display text-xl font-bold text-accent">
                      {order.total_price.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  {transactionId && (
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <span className="text-sm text-muted-foreground">ID Transaction</span>
                      <span className="font-mono text-sm">{transactionId.slice(0, 12)}...</span>
                    </div>
                  )}

                  <div className="flex items-start gap-3 border-b border-border pb-3">
                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Statut</p>
                      <p className="font-semibold">
                        {order.status === 'en_attente' && '⏳ En attente'}
                        {order.status === 'en_preparation' && '🍳 En préparation'}
                        {order.status === 'livree' && '✅ Livrée'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 border-b border-border pb-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Livraison</p>
                      <p className="font-semibold">
                        {order.delivery_mode === 'livraison' ? '🚗 Livraison à domicile' : '🏠 À emporter'}
                      </p>
                      {order.address && <p className="text-sm text-muted-foreground mt-1">{order.address}</p>}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-semibold">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{order.phone}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <p className="text-blue-900">
                    Nous préparons votre commande. Vous serez contacté sous peu !
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Retour à l'accueil
                    </Button>
                  </Link>
                  <Link to="/specialites" className="flex-1">
                    <Button className="w-full gold-gradient">
                      Continuer mes achats
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

export default PaymentSuccess;
