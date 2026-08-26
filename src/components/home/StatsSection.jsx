import FadeInWhenVisible from './FadeInWhenVisible.jsx';
import AnimatedCounter from './AnimatedCounter.jsx';

export default function StatsSection({ stats }) {
  return (
    <section id="stats" className="py-16 px-6 md:px-12 lg:px-12 border-b border-border-subtle relative bg-bg-primary">
      <div className="max-w-[92rem] mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="eyebrow flex items-center gap-3">
              <span className="w-8 h-px bg-ember inline-block" aria-hidden="true" />
              {stats.tag}
            </span>
            <h2 className="mt-3 text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary font-display">
              {stats.title}
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.items.map((stat, index) => (
            <FadeInWhenVisible key={index} delay={index * 0.08} direction="up">
              <div className="glass-panel rounded-2xl p-6 border border-border-subtle transition-all duration-300 hover:border-border-strong">
                <div className="text-3xl sm:text-4xl font-bold text-ember font-mono tracking-tight">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="mt-2 text-sm text-text-secondary">
                  {stat.label}
                </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
      </div>
    </section>
  );
}