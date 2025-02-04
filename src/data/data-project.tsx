import { getJSONfile } from '@/services/get-jsonfile';

export interface ProjectData {
  title?: string;
  // projectVideo?: string; // u can add video link or import video from assets folder
  projectImage?: string; // u can add image link or import image from assets folder
  date?: string;
  description?: string;
  stack?: string[];
  isBrowser?: boolean;
  isGithub?: boolean;
  isMobile?: boolean;
  isDekstop?: boolean;
  browserLink?: string;
  githubLink?: string;
  mobileLink?: string;
  dekstopLink?: string;
  companyName?: string;
  projectType?: 'Personal' | 'Freelance' | 'Company' | string;
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
    | string;
}

export const getProjectData = () =>
  getJSONfile<ProjectData[]>('/data/project.json');
