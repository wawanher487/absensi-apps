import axios from "axios";

export const localApi = axios.create({
  baseURL: 'http://192.168.143.231:4000',
  headers: {
    "Content-Type": "application/json",
  },
});

// export const localApi = axios.create({
//   baseURL: 'https://api-human-detection.pptik.id/',
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

