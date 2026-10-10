import { getPortfolio } from '../api'

export interface ProjectData {
  title?: string
  // projectVideo?: string; // u can add video link or import video from assets folder
  projectImage?: string // u can add image link or import image from assets folder
  date?: string
  description?: string
  stack?: string[]
  isBrowser?: boolean
  isGithub?: boolean
  isMobile?: boolean
  isDekstop?: boolean
  browserLink?: string
  githubLink?: string
  mobileLink?: string
  dekstopLink?: string
  companyName?: string
  projectType?: 'Personal' | 'Freelance' | 'Company' | string
  projectRole?:
    | 'Frontend'
    | 'Backend'
    | 'Fullstack'
    | 'UI/UX'
    | 'Database'
    | 'DevOps'
    | 'Security'
    | 'Project Manager'
    | 'System Analyst'
    | 'Quality Assurance'
    | string
  links?: Array<{ label: string; url: string; icon?: string }>
}

export const getProjectData = async (): Promise<ProjectData[] | null> => {
  const portfolio = await getPortfolio()
  return (
    portfolio?.projects.map((project) => {
      const links = new Map(project.links.map((link) => [link.platformKey, link.url]))
      return {
        title: project.title,
        projectImage: project.image?.url,
        date: project.projectDate ?? undefined,
        description: project.description,
        stack: project.technologies,
        isBrowser: links.has('website'),
        isGithub: links.has('github'),
        isMobile: links.has('mobile'),
        isDekstop: links.has('desktop'),
        browserLink: links.get('website'),
        githubLink: links.get('github'),
        mobileLink: links.get('mobile'),
        dekstopLink: links.get('desktop'),
        companyName: project.clientName,
        projectType: project.projectType,
        projectRole: project.projectRole,
        links: project.links.map((link) => ({
          label: link.label,
          url: link.url,
          icon: link.icon?.url,
        })),
      }
    }) ?? null
  )
}
