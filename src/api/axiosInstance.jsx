import axios from "axios";

export const localApi = axios.create({
  baseURL: 'http://192.168.143.231:4000',
  headers: {
    "Content-Type": "application/json",
  },
});

