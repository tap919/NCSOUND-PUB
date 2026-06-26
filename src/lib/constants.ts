const splitRatio = parseFloat(import.meta.env.VITE_NCSOUND_SPLIT || '0.20');
export const SPLIT = {
  ARTIST: 1 - splitRatio,
  NCSOUND: splitRatio,
};
