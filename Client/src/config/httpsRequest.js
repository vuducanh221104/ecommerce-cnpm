import axios from "axios";
import { getAuthToken } from "../services/authService";

axios.defaults.withCredentials = true;
const httpRequest = axios.create({
  baseURL: "http://localhost:4000/",
});

// Add a request interceptor to attach the auth token
httpRequest.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const get = async (path, options = {}) => {
  const res = await httpRequest.get(path, options);
  return res;
};

export const post = async (path, options = {}) => {
  const res = await httpRequest.post(path, options);
  return res;
};

export const put = async (path, options = {}) => {
  const res = await httpRequest.put(path, options);
  return res;
};

export const patch = async (path, options = {}) => {
  const res = await httpRequest.patch(path, options);
  return res;
};

export const deleted = async (path, options = {}) => {
  const res = await httpRequest.delete(path, options);
  return res;
};

export default httpRequest;
