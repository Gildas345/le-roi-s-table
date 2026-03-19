import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/data/menuData';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';

const MenuCard: React.FC<{ item: MenuItem; index?: number }> = ({ item, index = 0 }) => {
  const { addItem } = useCart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <span className="font-display text-2xl text-muted-foreground/40">🍽</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-lg font-semibold text-foreground">{item.name}</h3>
        <p className="mt-1 flex-1 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-xl font-bold text-accent">{item.price.toLocaleString('fr-FR')} FCFA</span>
          <Button
            size="sm"
            onClick={() => addItem(item)}
            className="gap-1 bg-primary text-primary-foreground hover:bg-wine-light"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
