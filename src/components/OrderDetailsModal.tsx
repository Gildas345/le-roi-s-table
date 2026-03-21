import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { Package, MapPin, Phone, CreditCard, Clock, Check } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  item_name: string;
  item_quantity: number;
  item_price: number;
}

interface OrderDetailsModalProps {
  orderId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const OrderDetailsModal = ({ orderId, isOpen, onClose, onUpdate }: OrderDetailsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    if (orderId && isOpen) {
      fetchOrderDetails();
    }
  }, [orderId, isOpen]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      // Fetch order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      setOrderDetails(order);

      // Fetch order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          menu_items (name, price)
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      const formattedItems = orderItems.map(item => ({
        item_name: item.menu_items?.name || 'Item inconnu',
        item_quantity: item.quantity,
        item_price: item.price,
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Erreur lors du chargement des détails');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async () => {
    if (!orderId) return;
    
    const { error } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paye',
        payment_date: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
    } else {
      toast.success('Paiement confirmé');
      onUpdate();
      fetchOrderDetails();
    }
  };

  if (!orderDetails) return null;

  const statusLabels: Record<string, string> = {
    en_attente: '⏳ En attente',
    en_preparation: '🍳 En préparation',
    livree: '✅ Livrée',
  };

  const paymentMethodLabels: Record<string, string> = {
    fedapay: '💳 FedaPay',
    mtn_money: '📱 MTN Money',
    moov_money: '📱 Moov Money',
    cash: '💵 Espèces',
    card: '💳 Carte',
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Commande #{orderDetails.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">{orderDetails.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{orderDetails.phone}</p>
                </div>
              </div>

              {orderDetails.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Adresse de livraison</p>
                    <p className="text-sm text-muted-foreground">{orderDetails.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {orderDetails.delivery_mode === 'livraison' ? '🚗 Livraison' : '🏠 Sur place'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Date de commande</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(orderDetails.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold">Paiement</span>
                </div>
                <span className={`text-sm font-medium ${orderDetails.payment_status === 'paye' ? 'text-green-600' : 'text-amber-600'}`}>
                  {orderDetails.payment_status === 'paye' ? '✅ Payé' : '⏳ En attente'}
                </span>
              </div>

              {orderDetails.payment_method && (
                <p className="text-sm text-muted-foreground">
                  Méthode: {paymentMethodLabels[orderDetails.payment_method] || orderDetails.payment_method}
                </p>
              )}

              {orderDetails.transaction_id && (
                <p className="text-sm text-muted-foreground font-mono">
                  Transaction: {orderDetails.transaction_id.slice(0, 16)}...
                </p>
              )}

              {orderDetails.payment_status === 'en_attente' && (
                <Button onClick={markAsPaid} size="sm" className="w-full mt-2">
                  <Check className="mr-2 h-4 w-4" />
                  Marquer comme payé
                </Button>
              )}
            </div>

            {/* Items */}
            <div>
              <h3 className="font-semibold mb-3">Articles commandés</h3>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                    <div className="flex-1">
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Quantité: {item.item_quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-accent">
                      {(item.item_price * item.item_quantity).toLocaleString('fr-FR')} FCFA
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between rounded-lg bg-primary p-4">
              <span className="font-display text-lg font-semibold text-primary-foreground">Total</span>
              <span className="font-display text-2xl font-bold text-accent">
                {orderDetails.total_price.toLocaleString('fr-FR')} FCFA
              </span>
            </div>

            {/* Status */}
            <div>
              <p className="font-semibold mb-2">Statut de la commande</p>
              <p className="text-lg">{statusLabels[orderDetails.status]}</p>
            </div>

            {/* Notes */}
            {orderDetails.notes && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm font-medium text-amber-900">Notes</p>
                <p className="text-sm text-amber-800 mt-1">{orderDetails.notes}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
