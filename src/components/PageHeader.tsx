import AnimatedSection from './AnimatedSection';

interface Props {
  title: string;
  subtitle?: string;
}

const PageHeader: React.FC<Props> = ({ title, subtitle }) => (
  <div className="wine-gradient py-20 text-center">
    <AnimatedSection>
      <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">{title}</h1>
      {subtitle && <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">{subtitle}</p>}
    </AnimatedSection>
  </div>
);

export default PageHeader;
