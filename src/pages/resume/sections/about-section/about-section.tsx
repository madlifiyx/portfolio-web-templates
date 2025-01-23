import { BlurFade } from '@/components/ui/blur-fade';

export const AboutSection = () => {
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
        <p className='text-sm md:text-base  font-semibold text-gray-500 text-balance text-justify'>
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged.
        </p>
      </BlurFade>
    </section>
  );
};
