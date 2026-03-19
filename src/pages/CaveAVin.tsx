import PageHeader from '@/components/PageHeader';
import MenuCard from '@/components/MenuCard';
import { getMenuByCategory } from '@/data/menuData';

const CaveAVin = () => {
  const items = getMenuByCategory('vins');
  return (
    <>
      <PageHeader title="Cave à Vin" subtitle="Une collection de vins soigneusement sélectionnés pour les connaisseurs" />
      <section className="section-padding">
        <div className="container-custom grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => <MenuCard key={item.id} item={item} index={i} />)}
        </div>
      </section>
    </>
  );
};

export default CaveAVin;
