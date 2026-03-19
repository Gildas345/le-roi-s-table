import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';
import { CalendarDays } from 'lucide-react';

const Evenements = () => (
  <>
    <PageHeader title="Événements" subtitle="Découvrez nos événements spéciaux et soirées thématiques" />
    <section className="section-padding">
      <div className="container-custom">
        <AnimatedSection>
          <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-12 text-center shadow-sm">
            <CalendarDays className="mx-auto h-16 w-16 text-muted-foreground/40" />
            <h2 className="mt-6 font-display text-2xl font-semibold text-foreground">Aucun événement en ce moment</h2>
            <p className="mt-3 text-muted-foreground">
              Revenez bientôt pour découvrir nos prochains événements et soirées spéciales !
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  </>
);

export default Evenements;
