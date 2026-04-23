import { useEffect, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';
import { CalendarDays } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type EventDB = Tables<'events'>;

const Evenements = () => {
  const [events, setEvents] = useState<EventDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from('events')
        .select('*')
        .eq('active', true)
        .order('date', { ascending: true });
      if (data) setEvents(data);
      setLoading(false);
    };
    fetchEvents();

    const channel = supabase
      .channel('events-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, fetchEvents)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <>
      <PageHeader title="Événements" subtitle="Découvrez nos événements spéciaux et soirées thématiques" />
      <section className="section-padding">
        <div className="container-custom">
          {loading ? (
            <p className="text-center text-muted-foreground">Chargement...</p>
          ) : events.length === 0 ? (
            <AnimatedSection>
              <div className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-12 text-center shadow-sm">
                <CalendarDays className="mx-auto h-16 w-16 text-muted-foreground/40" />
                <h2 className="mt-6 font-display text-2xl font-semibold text-foreground">Aucun événement en ce moment</h2>
                <p className="mt-3 text-muted-foreground">
                  Revenez bientôt pour découvrir nos prochains événements et soirées spéciales !
                </p>
              </div>
            </AnimatedSection>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((ev) => (
                <AnimatedSection key={ev.id}>
                  <article className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
                    {ev.image_url && (
                      <img
                        src={ev.image_url}
                        alt={ev.name}
                        loading="lazy"
                        className="h-48 w-full object-cover"
                      />
                    )}
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-sm text-accent">
                        <CalendarDays className="h-4 w-4" />
                        <time dateTime={ev.date}>
                          {new Date(ev.date).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </time>
                      </div>
                      <h2 className="mt-2 font-display text-xl font-semibold text-foreground">{ev.name}</h2>
                      {ev.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{ev.description}</p>
                      )}
                    </div>
                  </article>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Evenements;
