import { getJSONfile } from '@/lib/get-json-file'

export const getStackData = () => getJSONfile<string[]>('/data/stack.json')
