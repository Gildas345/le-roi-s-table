import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Smartphone, Loader2, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';

type Status = 'waiting' | 'paid' | 'declined' | 'expired';

const PaymentPending = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');
  const provider = searchParams.get('provider') || 'mobile_money';
  const phone = searchParams.get('phone') || '';

  const [status, setStatus] = useState<Status>('waiting');
  const [elapsed, setElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const providerLabel = provider === 'mtn_money' ? 'MTN Mobile Money'
    : provider === 'moov_money' ? 'Moov Mobile Money'
    : 'Mobile Money';

  // Timer (5 min timeout)
  useEffect(() => {
    if (status !== 'waiting') return;
    const interval = setInterval(() => {
      setElapsed((s) => {
        if (s >= 300) {
          setStatus('expired');
          clearInterval(interval);
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Realtime subscription + initial fetch + active polling via FedaPay
  useEffect(() => {
    if (!orderId) return;

    const handleResult = (payment_status?: string, notes?: string | null) => {
      if (payment_status === 'paye') {
        setStatus('paid');
        setTimeout(() => navigate(`/payment-success?order_id=${orderId}`), 1200);
        return true;
      }
      if (notes && (notes.toLowerCase().includes('refus') || notes.toLowerCase().includes('annul'))) {
        setStatus('declined');
        setErrorMsg(notes);
        return true;
      }
      return false;
    };

    // Active poll: ask edge function to check FedaPay directly
    const checkOrder = async () => {
      try {
        const { data } = await supabase.functions.invoke('check-payment-status', {
          body: { order_id: orderId },
        });
        if (data) handleResult(data.payment_status, data.notes);
      } catch (e) {
        // Fallback: read DB directly
        const { data } = await supabase
          .from('orders')
          .select('payment_status, notes')
          .eq('id', orderId)
          .single();
        if (data) handleResult(data.payment_status, data.notes);
      }
    };

    checkOrder();

    // Realtime subscription (instant update if webhook fires)
    const channel = supabase
      .channel(`order-${orderId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}`,
      }, (payload) => {
        const newRow = payload.new as any;
        handleResult(newRow.payment_status, newRow.notes);
      })
      .subscribe();

    // Active polling every 4s (faster, calls FedaPay)
    const poll = setInterval(checkOrder, 4000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(poll);
    };
  }, [orderId, navigate]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <PageHeader title="Paiement en cours" subtitle={`Confirmez sur votre téléphone via ${providerLabel}`} />
      <section className="section-padding">
        <div className="container-custom max-w-xl">
          <AnimatedSection>
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              {status === 'waiting' && (
                <>
                  <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                    <div className="relative w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                      <Smartphone className="h-12 w-12 text-primary" />
                    </div>
                  </div>

                  <h2 className="font-display text-2xl font-bold text-foreground mb-3">
                    📱 Demande envoyée !
                  </h2>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-green-900 font-medium">
                      ✅ Une demande de paiement a été envoyée à votre téléphone.
                    </p>
                    <p className="text-green-800 text-sm mt-2">
                      Veuillez entrer votre <strong>code PIN {providerLabel}</strong> sur votre téléphone pour confirmer.
                    </p>
                  </div>

                  {phone && (
                    <p className="text-sm text-muted-foreground mb-2">
                      📞 Numéro : <span className="font-semibold text-foreground">{phone}</span>
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>En attente de confirmation... {formatTime(elapsed)}</span>
                  </div>

                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3 text-left">
                    <p className="text-xs text-amber-900 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>Sécurité :</strong> Ne saisissez jamais votre code PIN sur ce site. Saisissez-le uniquement sur votre téléphone via la notification {providerLabel}.
                      </span>
                    </p>
                  </div>
                </>
              )}

              {status === 'paid' && (
                <>
                  <div className="mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Paiement confirmé !
                  </h2>
                  <p className="text-muted-foreground">Redirection en cours vers votre reçu...</p>
                </>
              )}

              {status === 'declined' && (
                <>
                  <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                    <XCircle className="h-12 w-12 text-red-600" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Paiement refusé
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {errorMsg || 'Le paiement a été refusé ou annulé. Veuillez réessayer.'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/commande" className="flex-1">
                      <Button className="w-full gold-gradient">Réessayer</Button>
                    </Link>
                    <Link to="/" className="flex-1">
                      <Button variant="outline" className="w-full">Accueil</Button>
                    </Link>
                  </div>
                </>
              )}

              {status === 'expired' && (
                <>
                  <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                    <AlertCircle className="h-12 w-12 text-amber-600" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Délai expiré
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    La demande de paiement a expiré. Veuillez relancer la commande.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/commande" className="flex-1">
                      <Button className="w-full gold-gradient">Réessayer</Button>
                    </Link>
                    <Link to="/" className="flex-1">
                      <Button variant="outline" className="w-full">Accueil</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

export default PaymentPending;
