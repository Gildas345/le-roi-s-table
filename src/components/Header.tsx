import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '@/assets/logo.jpg';

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/specialites', label: 'Nos Spécialités' },
  { to: '/plats-rapides', label: 'Plats Rapides' },
  { to: '/accompagnements', label: 'Accompagnements' },
  { to: '/boissons', label: 'Boissons' },
  { to: '/cave-a-vin', label: 'Cave à Vin' },
  { to: '/evenements', label: 'Événements' },
  { to: '/contact', label: 'Contact' },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container-custom flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="La Cave du Roi" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-display text-xl font-bold text-primary md:text-2xl">La Cave du Roi</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover-gold ${
                location.pathname === l.to ? 'text-accent' : 'text-foreground/70'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/commande" className="relative">
            <Button size="sm" variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Commander</span>
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-foreground">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-border bg-card lg:hidden"
          >
            <div className="container-custom flex flex-col gap-1 py-4">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                    location.pathname === l.to ? 'bg-primary text-primary-foreground' : 'text-foreground/70 hover:bg-muted'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
