
export function getImgUrl(filename) {
  const base = import.meta.env.VITE_AI_URL;          
  return `${base}/static/detections/${filename}`;   
}
