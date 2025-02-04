import { getJSONfile } from '@/services/get-jsonfile';

export interface ExperienceDataProps {
  link?: string;
  logoImage?: string;
  place?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export const getWorkExperience = () =>
  getJSONfile<ExperienceDataProps[]>('/data/work-exp.json');

export const getEducationExperience = () =>
  getJSONfile<ExperienceDataProps[]>('/data/education-exp.json');
