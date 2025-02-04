import { useEffect, useState } from 'react';
import { BlurFade } from '@/components/ui/blur-fade';
import { getSummary, SummaryData } from '@/data/data-summary';

export const AboutSection = () => {
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    getSummary().then(setData);
  }, []);

  return (
    <section
      id='about'
      className='mb-8'
    >
      <BlurFade
        delay={0.4}
        inView
      >
        <h2 className='text-xl font-bold'>About</h2>
        <p className='text-sm md:text-base  font-semibold text-gray-500 text-justify'>
          {data?.about}
        </p>
      </BlurFade>
    </section>
  );
};
