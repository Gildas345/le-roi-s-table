import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Package, Clock, MapPin, Phone, Printer, Download, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';

const RESTAURANT_WHATSAPP = '22953672706';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  menu_item_id: string;
  menu_items?: { name: string } | null;
}

interface OrderDetails {
  id: string;
  customer_name: string;
  phone: string;
  address: string | null;
  delivery_mode: string;
  total_price: number;
  status: string;
  payment_status: string;
  payment_method: string | null;
  created_at: string;
  transaction_id: string | null;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const orderId = searchParams.get('order_id');
  const transactionId = searchParams.get('transaction_id');

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from('orders').select('*').eq('id', orderId).single(),
        supabase.from('order_items').select('*, menu_items(name)').eq('order_id', orderId!),
      ]);

      if (orderRes.error) throw orderRes.error;
      setOrder(orderRes.data);
      setOrderItems((itemsRes.data as any) || []);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!order) return;
    const itemsText = orderItems
      .map((it) => `- ${(it as any).menu_items?.name || 'Article'} × ${it.quantity} = ${(it.price * it.quantity).toLocaleString('fr-FR')} F`)
      .join('\n');
    const msg =
      `🍷 *Nouvelle commande - La Cave du Roi*\n\n` +
      `📋 N° #${order.id.slice(0, 8).toUpperCase()}\n` +
      `👤 ${order.customer_name}\n` +
      `📞 ${order.phone}\n` +
      `${order.delivery_mode === 'livraison' ? `🚗 Livraison : ${order.address || ''}` : '🏠 Sur place'}\n` +
      `💳 ${order.payment_method || 'N/A'}\n\n` +
      `*Articles :*\n${itemsText}\n\n` +
      `💰 *Total : ${order.total_price.toLocaleString('fr-FR')} FCFA*\n\n` +
      `Statut paiement : ${order.payment_status === 'paye' ? '✅ Payé' : '⏳ En attente'}`;
    window.open(`https://wa.me/${RESTAURANT_WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
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
      <PageHeader title="Commande Confirmée" subtitle="Merci pour votre commande !" />
      <section className="section-padding">
        <div className="container-custom max-w-2xl">
          <AnimatedSection>
            {/* Success banner */}
            <div className={`rounded-lg border p-6 text-center mb-6 ${order?.payment_status === 'paye' ? 'border-green-500 bg-green-50' : 'border-border bg-card'}`}>
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${order?.payment_status === 'paye' ? 'bg-green-600' : 'bg-green-100'}`}>
                <CheckCircle className={`h-10 w-10 ${order?.payment_status === 'paye' ? 'text-white' : 'text-green-600'}`} />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {order?.payment_method === 'Espèces' ? 'Commande enregistrée !' : order?.payment_status === 'paye' ? '✅ Paiement confirmé !' : 'Commande enregistrée'}
              </h2>
              <p className="text-muted-foreground">
                {order?.payment_method === 'Espèces' 
                  ? 'Vous paierez en espèces à la réception.' 
                  : order?.payment_status === 'paye'
                  ? 'Votre paiement a bien été reçu et traité avec succès.'
                  : 'Votre paiement est en cours de vérification.'}
              </p>
              {order?.payment_status === 'paye' && order?.payment_method !== 'Espèces' && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-bold text-white">
                  <CheckCircle className="h-4 w-4" />
                  PAIEMENT CONFIRMÉ
                </div>
              )}
            </div>

            {/* Receipt */}
            {order && (
              <div ref={receiptRef} className="rounded-lg border border-border bg-card overflow-hidden print:shadow-none print:border-0">
                {/* Receipt Header */}
                <div className="bg-primary p-6 text-center text-primary-foreground print:bg-transparent print:text-foreground">
                  <h3 className="font-display text-2xl font-bold">🍷 La Cave du Roi</h3>
                  <p className="text-sm opacity-80 mt-1">Restaurant & Cave à Vin</p>
                  <p className="text-xs opacity-60 mt-1">Cotonou, Bénin • +229 53 67 27 06</p>
                </div>

                <div className="p-6 space-y-4">
                  {/* Receipt Title */}
                  <div className="text-center border-b border-dashed border-border pb-4">
                    <h4 className="font-display text-lg font-bold text-foreground">REÇU DE COMMANDE</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(order.created_at)}
                    </p>
                    <p className="font-mono text-sm text-muted-foreground mt-1">
                      N° #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>

                  {/* Client info */}
                  <div className="border-b border-dashed border-border pb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Client</span>
                      <span className="font-semibold text-foreground">{order.customer_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Téléphone</span>
                      <span className="text-foreground">{order.phone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mode</span>
                      <span className="text-foreground">{order.delivery_mode === 'livraison' ? '🚗 Livraison' : '🏠 Sur place'}</span>
                    </div>
                    {order.address && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Adresse</span>
                        <span className="text-foreground text-right max-w-[60%]">{order.address}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paiement</span>
                      <span className="text-foreground">{order.payment_method || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Order items */}
                  {orderItems.length > 0 && (
                    <div className="border-b border-dashed border-border pb-4">
                      <h5 className="font-semibold text-foreground mb-3">Articles commandés</h5>
                      <div className="space-y-2">
                        {orderItems.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-foreground">
                              {(item as any).menu_items?.name || 'Article'} × {item.quantity}
                            </span>
                            <span className="font-semibold text-foreground">
                              {(item.price * item.quantity).toLocaleString('fr-FR')} F
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center py-2">
                    <span className="font-display text-lg font-bold text-foreground">TOTAL</span>
                    <span className="font-display text-2xl font-bold text-accent">
                      {order.total_price.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  {/* Transaction info */}
                  {(order.transaction_id || transactionId) && (
                    <div className="text-center border-t border-dashed border-border pt-4">
                      <p className="text-xs text-muted-foreground">
                        Transaction : {(order.transaction_id || transactionId)?.toString().slice(0, 16)}
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  <div className="text-center border-t border-dashed border-border pt-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm">
                      <Package className="h-4 w-4" />
                      <span>
                        {order.status === 'en_attente' && '⏳ En attente de préparation'}
                        {order.status === 'en_preparation' && '🍳 En cours de préparation'}
                        {order.status === 'livree' && '✅ Livrée'}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      Merci de votre confiance ! 🙏
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      La Cave du Roi — L'excellence à chaque bouchée
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 space-y-3 print:hidden">
              <Button onClick={handleWhatsApp} className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#1ebe57]">
                <MessageCircle className="h-4 w-4" />
                Envoyer le reçu sur WhatsApp
              </Button>

              <Button onClick={handlePrint} variant="outline" className="w-full gap-2">
                <Printer className="h-4 w-4" />
                Imprimer le reçu
              </Button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Clock className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-blue-900">
                  Nous préparons votre commande. Vous serez contacté sous peu !
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full">Retour à l'accueil</Button>
                </Link>
                <Link to="/specialites" className="flex-1">
                  <Button className="w-full gold-gradient">Continuer mes achats</Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

export default PaymentSuccess;
