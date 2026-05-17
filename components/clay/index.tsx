import { AnimatedSection } from '../ui/animated-section';
import { ClayCard } from './card';

export function Clay() {
  return (
    <AnimatedSection className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <ClayCard />
      </div>
    </AnimatedSection>
  );
}
