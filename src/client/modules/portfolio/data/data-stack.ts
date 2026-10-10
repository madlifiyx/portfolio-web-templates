import { getPortfolio } from '../api'

export const getStackData = async (): Promise<string[] | null> =>
  (await getPortfolio())?.technologies ?? null
