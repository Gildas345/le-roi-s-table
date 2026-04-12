import PageHeader from '@/components/PageHeader';
import MenuCard from '@/components/MenuCard';
import { getMenuByCategory } from '@/data/menuData';

const Accompagnements = () => {
  const items = getMenuByCategory('accompagnements');
  return (
    <>
      <PageHeader title="Accompagnements" subtitle="Complétez votre repas avec nos délicieux accompagnements" />
      <section className="section-padding">
        <div className="container-custom grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => <MenuCard key={item.id} item={item} index={i} hidePrice />)}
        </div>
      </section>
    </>
  );
};

export default Accompagnements;
