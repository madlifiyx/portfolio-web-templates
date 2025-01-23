import { BlurFade } from '@/components/ui/blur-fade';
import { Badge } from '@/components/ui/badge';
import { ProjectCard } from '@/components/project-card';

export const ProjectSection = () => {
  return (
    <section
      id='project'
      className='mt-20 mb-8'
    >
      <BlurFade
        delay={0.3}
        inView
      >
        <div className='flex items-center justify-center'>
          <Badge className='lg:text-base text-sm'>My Projects</Badge>
        </div>
        <h4 className='lg:text-5xl text-3xl font-extrabold text-center my-2.5'>
          Check out my latest work
        </h4>
        <p className='text-center lg:text-lg font-medium text-slate-600 dark:text-slate-300'>
          I've worked on a variety of projects, from simple websites to complex
          web applications. Here are a few of my works.
        </p>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto mt-6'>
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
          <ProjectCard />
        </div>
      </BlurFade>
    </section>
  );
};
