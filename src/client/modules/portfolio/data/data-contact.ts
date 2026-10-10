import { getPortfolio } from '../api'

export interface ContactData {
  title?: string
  icon?: string
  link: string
}

export const getContactData = async (): Promise<ContactData[] | null> => {
  const portfolio = await getPortfolio()
  return (
    portfolio?.contacts
      .filter((contact) => contact.isVisible)
      .map((contact) => ({ title: contact.label, icon: contact.icon?.url, link: contact.url })) ??
    null
  )
}
