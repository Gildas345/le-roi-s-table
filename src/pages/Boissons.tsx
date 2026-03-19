import PageHeader from '@/components/PageHeader';
import MenuCard from '@/components/MenuCard';
import { getMenuByCategory } from '@/data/menuData';

const Boissons = () => {
  const items = getMenuByCategory('boissons');
  return (
    <>
      <PageHeader title="Boissons" subtitle="Des boissons fraîches et naturelles pour accompagner vos repas" />
      <section className="section-padding">
        <div className="container-custom grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => <MenuCard key={item.id} item={item} index={i} />)}
        </div>
      </section>
    </>
  );
};

export default Boissons;
