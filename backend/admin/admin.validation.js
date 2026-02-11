export const validateProduct = (data) => {
  if (!data.name || !data.price) return false;
  if (typeof data.price !== 'number') return false;
  return true;
};