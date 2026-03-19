import { Link } from 'react-router-dom';
import { Phone, MapPin } from 'lucide-react';

const Footer = () => (
  <footer className="wine-gradient mt-auto">
    <div className="container-custom py-12">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-primary-foreground">La Cave du Roi</h3>
          <p className="mt-3 text-sm text-primary-foreground/70 leading-relaxed">
            Une expérience culinaire unique au cœur du Bénin. Savourez nos plats authentiques dans un cadre royal.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-primary-foreground">Navigation</h4>
          <div className="mt-3 flex flex-col gap-2">
            {[
              { to: '/specialites', label: 'Nos Spécialités' },
              { to: '/plats-rapides', label: 'Plats Rapides' },
              { to: '/cave-a-vin', label: 'Cave à Vin' },
              { to: '/evenements', label: 'Événements' },
              { to: '/contact', label: 'Contact' },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-primary-foreground/70 transition-colors hover:text-accent">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg font-semibold text-primary-foreground">Contact</h4>
          <div className="mt-3 flex flex-col gap-3">
            <a href="tel:+22901663031999" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent">
              <Phone className="h-4 w-4" /> +229 01 6630 3199
            </a>
            <a href="tel:+22901968548399" className="flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-accent">
              <Phone className="h-4 w-4" /> +229 01 9685 4839
            </a>
            <div className="flex items-start gap-2 text-sm text-primary-foreground/70">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>Au bord du pavé, après le carrefour Doto Pierre, vers la mairie</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 border-t border-primary-foreground/20 pt-6 text-center text-sm text-primary-foreground/50">
        © {new Date().getFullYear()} La Cave du Roi. Tous droits réservés.
      </div>
    </div>
  </footer>
);

export default Footer;
