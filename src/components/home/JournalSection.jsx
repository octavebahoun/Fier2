import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import JournalCarousel from './JournalCarousel.jsx';

export default function JournalSection({ journal, navigate }) {
  return (
    <section id="journal" className="py-24 px-6 md:px-12 lg:px-12 border-b border-border-subtle bg-bg-secondary/20 relative overflow-hidden">
      {/* Background Glow Spots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] max-w-[600px] rounded-full bg-radial from-fieri-blue/22 to-transparent blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-[10%] w-[40vw] h-[40vw] max-w-[500px] rounded-full bg-radial from-accent-primary/20 to-transparent blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[92rem] mx-auto w-full relative z-10">
        <div className="mb-10">
          <FadeInWhenVisible direction="left">
            <span className="text-xs font-bold tracking-[0.2em] text-accent-primary uppercase">
              {journal?.tag || 'EXCELLENCE & GOUVERNANCE'}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-3">
              {journal?.title || 'Le Journal FIERI'}
            </h2>
            <p className="text-text-secondary text-sm font-light mt-3 max-w-xl">
              Bootcamps, ateliers, opportunités, appels et actualités — retrouvez tout le dynamisme de la communauté académique.
            </p>
          </FadeInWhenVisible>
        </div>

        {/* Carousel avec filtres et badges colorés */}
        <JournalCarousel navigate={navigate} />
      </div>
    </section>
  );
}
