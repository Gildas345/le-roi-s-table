import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';
import { Phone, MapPin, Clock } from 'lucide-react';

const Contact = () => (
  <>
    <PageHeader title="Contact" subtitle="Nous sommes à votre écoute" />
    <section className="section-padding">
      <div className="container-custom grid gap-8 md:grid-cols-2">
        <AnimatedSection>
          <div className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-foreground">Nos Coordonnées</h2>
            <div className="space-y-4">
              <a href="tel:+22901663031999" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                <Phone className="h-5 w-5 text-primary" /> +229 01 6630 3199
              </a>
              <a href="tel:+22901968548399" className="flex items-center gap-3 text-foreground hover:text-accent transition-colors">
                <Phone className="h-5 w-5 text-primary" /> +229 01 9685 4839
              </a>
              <div className="flex items-start gap-3 text-foreground">
                <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                <span>Au bord du pavé, juste après le carrefour Doto Pierre en allant vers la mairie</span>
              </div>
              <div className="flex items-center gap-3 text-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <span>Ouvert tous les jours de 10h à 23h</span>
              </div>
            </div>
          </div>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="flex h-64 items-center justify-center bg-muted md:h-80">
              <div className="text-center p-6">
                <MapPin className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-4 font-display text-lg font-semibold text-foreground">Notre Emplacement</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Carrefour Doto Pierre, en direction de la mairie
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </>
);

export default Contact;
