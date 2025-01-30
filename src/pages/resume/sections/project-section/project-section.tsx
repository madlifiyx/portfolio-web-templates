import { BlurFade } from '@/components/ui/blur-fade';
import { ProjectCard } from '@/components/project-card';
import { SectionTitle, SectionTitleProps } from '@/components/section-title';
import { IconChevronRight } from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router';

const defaultSectionTitleProps: SectionTitleProps = {
  title: 'Project',
  shortDescription: 'Check out my latest work',
  description:
    "I've worked on a variety of projects, from simple websites to complex web applications. Here are a few of my works.",
};

const projectCardData = [
  {
    title: 'E-Commerce Website',
    // projectVideo: 'https://example.com/video.mp4',
    date: '2023-08-15',
    description: 'A fully responsive e-commerce website for a clothing brand.',
    stack: ['React', 'Node.js', 'Express', 'MongoDB'],
    isBrowser: true,
    isGithub: true,
    browserLink: 'https://ecommerce-example.com',
    githubLink: 'https://github.com/example/ecommerce',
    companyName: 'Tech Solutions Inc.',
    projectType: 'Company',
    projectRole: 'Fullstack',
  },
  {
    title: 'Portfolio Website',
    projectImage: 'https://via.placeholder.com/600x400',
    date: '2024-01-10',
    description:
      'A personal portfolio website to showcase projects and skills.',
    stack: ['Next.js', 'TailwindCSS', 'Vercel'],
    isBrowser: true,
    isGithub: true,
    browserLink: 'https://myportfolio.com',
    githubLink: 'https://github.com/example/portfolio',
    projectType: 'Personal',
    projectRole: 'Frontend',
  },
  {
    title: 'Mobile Banking App',
    projectVideo: 'https://www.w3schools.com/html/mov_bbb.mp4',
    date: '2023-05-22',
    description:
      'A secure mobile banking application for a financial institution.',
    stack: ['Flutter', 'Firebase', 'Dart'],
    isMobile: true,
    mobileLink: 'https://playstore.com/banking-app',
    companyName: 'FinanceCorp',
    projectType: 'Company',
    projectRole: 'UI/UX',
  },
  {
    title: 'DevOps Automation Script',
    projectImage: 'https://via.placeholder.com/600x400',
    date: '2023-11-30',
    description:
      'A script to automate server deployment and monitoring. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    stack: ['Python', 'Docker', 'Kubernetes', 'Terraform'],
    isGithub: true,
    githubLink: 'https://github.com/example/devops-script',
    companyName: 'CloudOps Ltd.',
    projectType: 'Freelance',
    projectRole: 'DevOps',
  },
  {
    title: 'Task Management System',
    projectImage: 'https://via.placeholder.com/600x400',
    date: '2022-09-05',
    description:
      'A project management tool for teams to track tasks and progress.',
    stack: ['Vue.js', 'Laravel', 'MySQL'],
    isBrowser: true,
    isGithub: false,
    browserLink: 'https://taskmanager.com',
    companyName: 'StartupHub',
    projectType: 'Company',
    projectRole: 'System Analyst',
  },
];

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
        <SectionTitle {...defaultSectionTitleProps} />
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto mt-6'>
          {projectCardData.slice(0, 4).map((project, index) => (
            <ProjectCard
              key={index}
              {...project}
            />
          ))}
        </div>
        {projectCardData.length > 4 && (
          <div className='flex items-center justify-end mt-4 group'>
            <Link
              to='/project'
              className='text-center text-xs italic font-medium hover:underline text-slate-500 dark:text-slate-400'
            >
              View all projects
            </Link>
            <IconChevronRight
              size={16}
              className={cn(
                'translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100 text-slate-500 dark:text-slate-400'
              )}
            />
          </div>
        )}
      </BlurFade>
    </section>
  );
};
