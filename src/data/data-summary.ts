import { getJSONfile } from '@/services/get-jsonfile';

export interface SummaryData {
  name?: string;
  pronouns?: string;
  position?: string;
  avatar?: string;
  about?: string;
}

export const getSummary = () => getJSONfile<SummaryData>('/data/summary.json');
