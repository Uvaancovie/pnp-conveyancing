import { useQuery } from '@tanstack/react-query';
import { defaultConfig, loadConfig } from './config';
export const useConfig = () => useQuery({ queryKey: ['cfg'], queryFn: loadConfig, staleTime: 60_000, initialData: defaultConfig });