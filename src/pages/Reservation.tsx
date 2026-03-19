import { useState, useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  name: string;
  date: string;
}

const Reservation = () => {
  const [form, setForm] = useState({ name: '', phone: '', people: '', date: '', event_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    supabase.from('events').select('id, name, date').eq('active', true).then(({ data }) => {
      if (data) setEvents(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { error } = await supabase.from('reservations').insert({
        name: form.name,
        phone: form.phone,
        people_count: parseInt(form.people),
        date: form.date,
        event_id: form.event_id || null,
      });
      if (error) throw error;
      toast.success('Réservation enregistrée ! Nous vous contacterons pour confirmer.');
      setForm({ name: '', phone: '', people: '', date: '', event_id: '' });
    } catch {
      toast.error('Erreur lors de la réservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="Réservation" subtitle="Réservez votre table pour un événement spécial" />
      <section className="section-padding">
        <div className="container-custom">
          <AnimatedSection>
            <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 rounded-lg border border-border bg-card p-8">
              <div><Label htmlFor="rname">Nom complet</Label><Input id="rname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
              <div><Label htmlFor="rphone">Téléphone</Label><Input id="rphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required /></div>
              <div><Label htmlFor="rpeople">Nombre de personnes</Label><Input id="rpeople" type="number" min={1} value={form.people} onChange={(e) => setForm({ ...form, people: e.target.value })} required /></div>
              <div><Label htmlFor="rdate">Date souhaitée</Label><Input id="rdate" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required /></div>
              {events.length > 0 && (
                <div>
                  <Label htmlFor="revent">Événement (optionnel)</Label>
                  <select id="revent" value={form.event_id} onChange={(e) => setForm({ ...form, event_id: e.target.value })} className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option value="">Aucun événement</option>
                    {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                  </select>
                </div>
              )}
              <Button type="submit" disabled={submitting} className="w-full bg-primary text-primary-foreground" size="lg">
                {submitting ? 'Envoi...' : 'Réserver'}
              </Button>
            </form>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

export default Reservation;
