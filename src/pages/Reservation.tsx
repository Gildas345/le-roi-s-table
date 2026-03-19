import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Reservation = () => {
  const [form, setForm] = useState({ name: '', phone: '', people: '', date: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: Save to Supabase
    setTimeout(() => {
      toast.success('Réservation enregistrée ! Nous vous contacterons pour confirmer.');
      setForm({ name: '', phone: '', people: '', date: '' });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <PageHeader title="Réservation" subtitle="Réservez votre table pour un événement spécial" />
      <section className="section-padding">
        <div className="container-custom">
          <AnimatedSection>
            <form onSubmit={handleSubmit} className="mx-auto max-w-lg space-y-4 rounded-lg border border-border bg-card p-8">
              <div>
                <Label htmlFor="rname">Nom complet</Label>
                <Input id="rname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="rphone">Téléphone</Label>
                <Input id="rphone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="rpeople">Nombre de personnes</Label>
                <Input id="rpeople" type="number" min={1} value={form.people} onChange={(e) => setForm({ ...form, people: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="rdate">Date souhaitée</Label>
                <Input id="rdate" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
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
