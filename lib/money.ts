export const formatZAR = (n: number) => {
  if (!isFinite(n)) n = 0;
  const [rands, cents] = n.toFixed(2).split('.');
  const withSpaces = rands.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `R ${withSpaces},${cents}`;
};