import { getJSONfile } from '@/services/get-jsonfile';

export interface ContactData {
  title?: string;
  icon?: string;
  link: string;
}

export const getContactData = () =>
  getJSONfile<ContactData[]>('/data/contact.json');
