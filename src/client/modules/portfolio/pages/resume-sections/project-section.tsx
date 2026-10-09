import { IconChevronRight } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ProjectCard } from '@/components/project-card'
import { SectionTitle, type SectionTitleProps } from '@/components/section-title'
import { BlurFade } from '@/components/ui/blur-fade'
import { getProjectData, type ProjectData } from '@/data/data-project'
import { cn } from '@/lib/utils'

const defaultSectionTitleProps: SectionTitleProps = {
  title: 'Project',
  shortDescription: 'Check out my latest work',
  description:
    "I've worked on a variety of projects, from simple websites to complex web applications. Here are a few of my works.",
}

export const ProjectSection = () => {
  const [data, setData] = useState<ProjectData[] | null>(null)

  useEffect(() => {
    getProjectData().then(setData)
  }, [])

  return (
    <section id="project" className="mt-20 mb-8">
      <BlurFade delay={0.3} inView>
        <SectionTitle {...defaultSectionTitleProps} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto mt-6">
          {data?.slice(0, 4).map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
        {data && data.length > 4 && (
          <div className="flex items-center justify-end mt-4 group">
            <Link
              to="/project"
              className="text-center text-xs italic font-medium hover:underline text-slate-500 dark:text-slate-400"
            >
              View all projects
            </Link>
            <IconChevronRight
              size={16}
              className={cn(
                'translate-x-0 transform opacity-0 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:opacity-100 text-slate-500 dark:text-slate-400',
              )}
            />
          </div>
        )}
      </BlurFade>
    </section>
  )
}
