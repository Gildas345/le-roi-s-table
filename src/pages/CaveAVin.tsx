import PageHeader from '@/components/PageHeader';
import MenuCard from '@/components/MenuCard';
import { getMenuByCategory } from '@/data/menuData';
import AnimatedSection from '@/components/AnimatedSection';
import terrasseImg from '@/assets/terrasse.jpg';

const CaveAVin = () => {
  const items = getMenuByCategory('vins');
  return (
    <>
      <PageHeader title="Cave à Vin" subtitle="Une collection de vins soigneusement sélectionnés pour les connaisseurs" />
      <section className="section-padding">
        <div className="container-custom">
          <AnimatedSection>
            <div className="mb-10 overflow-hidden rounded-lg">
              <img src={terrasseImg} alt="Notre terrasse" className="h-64 w-full object-cover md:h-80" />
            </div>
          </AnimatedSection>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => <MenuCard key={item.id} item={item} index={i} />)}
          </div>
        </div>
      </section>
    </>
  );
};

export default CaveAVin;
