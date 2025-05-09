import SectionTitle from '../Common/SectionTitle';
import SingleFeature from './SingleFeature';
import featuresData from './featuresData';

const Features = () => {
  return (
    <>
      <section id="services" className="py-16 md:py-20 lg:py-28">
        <div className="container">
          <SectionTitle
            title="Qué ofrecemos"
            paragraph="Combinamos control de procesos, desarrollo de software y consultoría organizacional para ofrecerte soluciones integrales que generan resultados reales."
            center
          />

          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map((feature) => (
              <SingleFeature key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Features;
