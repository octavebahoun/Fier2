import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import JournalCarousel from './JournalCarousel.jsx';

export default function JournalSection({ journal, navigate }) {
  return (
    <section id="journal" className="py-24 px-6 md:px-12 lg:px-12 border-b border-border-subtle bg-bg-primary relative">
      <div className="max-w-[92rem] mx-auto w-full">
        <div className="mb-10">
          <FadeInWhenVisible direction="left">
            <span className="eyebrow flex items-center gap-3">
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
              {journal?.tag || 'EXCELLENCE & GOUVERNANCE'}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-4 font-display">
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
