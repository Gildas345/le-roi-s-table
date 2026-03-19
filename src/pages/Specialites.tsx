import PageHeader from '@/components/PageHeader';
import MenuCard from '@/components/MenuCard';
import { getMenuByCategory } from '@/data/menuData';

const Specialites = () => {
  const items = getMenuByCategory('specialites');
  return (
    <>
      <PageHeader title="Nos Spécialités" subtitle="Des plats d'exception préparés avec passion et savoir-faire" />
      <section className="section-padding">
        <div className="container-custom grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => <MenuCard key={item.id} item={item} index={i} />)}
        </div>
      </section>
    </>
  );
};

export default Specialites;
