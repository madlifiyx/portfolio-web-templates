import { getJSONfile } from '@/lib/get-json-file'

export interface ContactData {
  title?: string
  icon?: string
  link: string
}

export const getContactData = () => getJSONfile<ContactData[]>('/data/contact.json')
