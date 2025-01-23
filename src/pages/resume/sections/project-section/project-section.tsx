import { BlurFade } from '@/components/ui/blur-fade';

export const ProjectSection = () => {
  return (
    <section
      id='about'
      className='mb-8'
    >
      <BlurFade
        delay={0.4}
        inView
      >
        <h2 className='text-xl font-bold'>Project</h2>
        {/* <p className='text-sm md:text-base  font-semibold text-gray-500 text-balance'>
          Experienced Front-End Developer with 3+ years in creating exceptional
          user experiences using React, Vite, Next.js, JavaScript, HTML5, CSS3,
          and TailwindCSS. Proficient in TypeScript, state management (Redux,
          Zustand, Context API), and performance optimization with Webpack and
          Vite. Skilled in Docker, NGINX, and CI/CD pipelines. Experienced with
          real-time communication (WebSocket, Socket.IO, SSE) and Progressive
          Web Apps (PWA)
        </p> */}
      </BlurFade>
    </section>
  );
};
