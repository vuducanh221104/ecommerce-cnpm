import axios from "axios";
axios.defaults.withCredentials = true;

const TOKEN_KEY = "ducanh_token";

const httpRequest = axios.create({
  baseURL: "http://localhost:4000/",
});

// Thêm interceptor để tự động gắn token vào header
httpRequest.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
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
  try {
    console.log(`PATCH ${path}:`, options);
    const res = await httpRequest.patch(path, options);
    console.log(`PATCH ${path} response:`, res.data);
    return res;
  } catch (error) {
    console.error(
      `PATCH ${path} error:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleted = async (path, options = {}) => {
  try {
    console.log(`DELETE ${path}:`, options);
    const res = await httpRequest.delete(path, options);
    console.log(`DELETE ${path} response:`, res.data);
    return res;
  } catch (error) {
    console.error(
      `DELETE ${path} error:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export default httpRequest;
