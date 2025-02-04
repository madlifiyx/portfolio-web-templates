import { getJSONfile } from '@/services/get-jsonfile';

export const getStackData = () => getJSONfile<string[]>('/data/stack.json');
