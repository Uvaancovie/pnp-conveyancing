import { useQuery } from '@tanstack/react-query';
import { loadConfig } from './config';
export const useConfig = () => useQuery({ queryKey: ['cfg'], queryFn: loadConfig, staleTime: 60_000 });