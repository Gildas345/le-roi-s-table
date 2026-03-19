import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, UtensilsCrossed, Wine, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AnimatedSection from '@/components/AnimatedSection';
import heroBg from '@/assets/hero-bg.jpg';

const features = [
  { icon: UtensilsCrossed, title: 'Cuisine Authentique', desc: 'Des plats préparés avec des ingrédients frais et locaux' },
  { icon: Wine, title: 'Cave à Vin', desc: 'Une sélection raffinée de vins du monde entier' },
  { icon: Star, title: 'Service Royal', desc: 'Un accueil chaleureux dans un cadre élégant' },
];

const Index = () => (
  <>
    {/* Hero */}
    <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
      <img src={heroBg} alt="La Cave du Roi restaurant" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 to-foreground/50" />
      <div className="relative z-10 container-custom text-center">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-display text-4xl font-bold text-cream md:text-6xl lg:text-7xl"
        >
          La Cave du Roi
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-6 max-w-xl text-lg text-cream/90 md:text-xl"
        >
          Commandez maintenant et savourez nos délicieux plats !
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Link to="/commande">
            <Button size="lg" className="gap-2 gold-gradient text-accent-foreground font-semibold text-base px-8 hover:opacity-90">
              Commander <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/specialites">
            <Button size="lg" variant="outline" className="border-cream/40 text-cream hover:bg-cream/10 text-base px-8">
              Voir le Menu
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="section-padding">
      <div className="container-custom grid gap-8 md:grid-cols-3">
        {features.map((f, i) => (
          <AnimatedSection key={f.title} delay={i * 0.15}>
            <div className="flex flex-col items-center rounded-lg border border-border bg-card p-8 text-center shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
                <f.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </AnimatedSection>
        ))}
      </div>
    </section>
  </>
);

export default Index;
