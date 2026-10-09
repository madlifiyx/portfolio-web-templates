import { useEffect, useState } from 'react'
import { ProjectCard } from '@/components/project-card'
import { SectionTitle, type SectionTitleProps } from '@/components/section-title'
import { BlurFade } from '@/components/ui/blur-fade'
import { getProjectData, type ProjectData } from '@/data/data-project'

const defaultSectionTitleProps: SectionTitleProps = {
  title: 'Project',
  shortDescription: 'Check out my projects',
  description: (
    <p>
      I have worked on a number of projects, ranging from web development to machine learning. Here
      are some of my recent projects.
    </p>
  ),
}

export const ProjectPage = () => {
  const [data, setData] = useState<ProjectData[] | null>(null)

  useEffect(() => {
    getProjectData().then(setData)
  }, [])

  return (
    <main id="project-page">
      <BlurFade delay={0.2} inView>
        <SectionTitle {...defaultSectionTitleProps} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-[800px] mx-auto mt-6">
          {data?.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </BlurFade>
    </main>
  )
}
