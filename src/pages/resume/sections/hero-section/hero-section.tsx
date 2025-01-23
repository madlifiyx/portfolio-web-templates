import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BlurFade } from '@/components/ui/blur-fade';

export const HeroSection = () => {
  return (
    <section
      id='hero'
      className='mb-8'
    >
      <div className='gap-2 flex justify-between items-center'>
        <div>
          <BlurFade
            delay={0.2}
            inView
          >
            <div className='flex items-end gap-2'>
              <h1 className='text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none'>
                Madlifi
              </h1>
              <h5 className='italic text-sm md:text-lg'>(he/him)</h5>
            </div>
          </BlurFade>
          <BlurFade
            delay={0.3}
            inView
          >
            <h2 className='md:text-2xl'>Full Stack Software Engineer</h2>
          </BlurFade>
        </div>
        <BlurFade
          delay={0.3}
          inView
        >
          <Avatar className='md:size-28 size-20 border'>
            <AvatarImage
              alt={'Madlifi'}
              src={'https://github.com/madlifiyx.png'}
            />
            <AvatarFallback>
              {'https://placehold.co/600x400?text=No Picture'}
            </AvatarFallback>
          </Avatar>
        </BlurFade>
      </div>
    </section>
  );
};
