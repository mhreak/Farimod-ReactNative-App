// services/ApiService.js
import axios from "axios";
import appInfo from "../config/appInfo";

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: appInfo.api.baseUrl,
      timeout: 30000, // 30 seconds
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("API Request Error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(
          "API Response Error:",
          error.response?.status,
          error.message
        );
        return Promise.reject(error);
      }
    );
  }

  async get(endpoint, config = {}) {
    try {
      const response = await this.api.get(endpoint, config);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async post(endpoint, data = {}, config = {}) {
    try {
      const response = await this.api.post(endpoint, data, config);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async put(endpoint, data = {}, config = {}) {
    try {
      const response = await this.api.put(endpoint, data, config);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete(endpoint, config = {}) {
    try {
      const response = await this.api.delete(endpoint, config);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // سرور پاسخ داده ولی با status code خطا
      const errorMessage =
        error.response.data?.message ||
        error.response.data?.error ||
        `خطای سرور: ${error.response.status}`;

      return new Error(errorMessage);
    } else if (error.request) {
      // درخواست ارسال شده ولی پاسخی دریافت نشده
      return new Error(
        "خطا در ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید."
      );
    } else {
      // خطای دیگر
      return new Error(error.message || "خطای غیرمنتظره رخ داده است");
    }
  }

  // متد برای تنظیم Authorization header
  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common["Authorization"];
    }
  }

  // متد برای تنظیم User-Agent یا سایر header های سفارشی
  setCustomHeader(key, value) {
    if (value) {
      this.api.defaults.headers.common[key] = value;
    } else {
      delete this.api.defaults.headers.common[key];
    }
  }
}

// ایجاد instance واحد
const apiService = new ApiService();

export default apiService;
