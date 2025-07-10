import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const localApi = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// export const serverApi = axios.create({
//   baseURL: 'https://api-human-detection.pptik.id/',
//   headers: {
//     "Content-Type": "application/json",
//   },
// });
