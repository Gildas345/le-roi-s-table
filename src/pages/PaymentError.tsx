import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, Home, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';

const PaymentError = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const errorMessage = searchParams.get('message') || 'Une erreur est survenue lors du paiement';

  return (
    <>
      <PageHeader title="Erreur de Paiement" subtitle="Un problème est survenu" />
      <section className="section-padding">
        <div className="container-custom max-w-2xl">
          <AnimatedSection>
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Paiement échoué
              </h2>
              <p className="text-muted-foreground mb-6">
                {errorMessage}
              </p>

              {orderId && (
                <div className="bg-muted/50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground">
                    Numéro de commande : <span className="font-mono font-semibold">#{orderId.slice(0, 8)}</span>
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-900">
                    💡 <strong>Que faire ?</strong>
                  </p>
                  <ul className="mt-2 space-y-1 text-left text-amber-800">
                    <li>• Vérifiez votre solde</li>
                    <li>• Assurez-vous que vos informations sont correctes</li>
                    <li>• Réessayez le paiement</li>
                    <li>• Contactez-nous si le problème persiste</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/commande" className="flex-1">
                    <Button className="w-full gold-gradient">
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Réessayer le paiement
                    </Button>
                  </Link>
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Home className="mr-2 h-4 w-4" />
                      Retour à l'accueil
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Besoin d'aide ?</p>
                  <Link to="/contact">
                    <Button variant="link" className="text-primary">
                      Contactez-nous
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

export default PaymentError;
