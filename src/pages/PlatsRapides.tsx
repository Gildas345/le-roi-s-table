import PageHeader from '@/components/PageHeader';
import MenuCard from '@/components/MenuCard';
import { getMenuByCategory } from '@/data/menuData';

const PlatsRapides = () => {
  const items = getMenuByCategory('plats-rapides');
  return (
    <>
      <PageHeader title="Plats Rapides" subtitle="Savoureux et rapides, parfaits pour vos envies pressées" />
      <section className="section-padding">
        <div className="container-custom grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => <MenuCard key={item.id} item={item} index={i} />)}
        </div>
      </section>
    </>
  );
};

export default PlatsRapides;
