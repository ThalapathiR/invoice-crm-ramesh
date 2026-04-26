import axios from 'axios';
import { CommonHelper } from '@/helper/helper';
import { toast } from '@/hooks/use-toast';

const APIURL = '/api/v1'; // Using relative path for Vite proxy/Nginx compatibility
const TOAST_COOLDOWN = 500; // ms to prevent duplicate toasts
const toastCache: Record<string, number> = {};

function showDeDupToast(options: any) {
  const cacheKey = `${options.title}-${options.description}-${options.variant}`;
  const now = Date.now();
  if (toastCache[cacheKey] && now - toastCache[cacheKey] < TOAST_COOLDOWN) {
    return;
  }
  toastCache[cacheKey] = now;
  toast(options);
}

// Add global loading interceptors
axios.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase();
    const isMutation = method && ["post", "put", "patch", "delete"].includes(method);

    // Axios v1.x uses AxiosHeaders, which requires .get() or normalizes keys.
    const getHeader = (key: string) => {
      if (!config.headers) return null;
      if (typeof (config.headers as any).get === 'function') return (config.headers as any).get(key);
      return (config.headers as any)[key];
    };

    const hideLoaderVal = getHeader("x-no-loader");
    const forceShowLoaderVal = getHeader("x-show-loader");

    const hideLoader = hideLoaderVal === "true" || hideLoaderVal === true;
    const forceShowLoader = forceShowLoaderVal === "true" || forceShowLoaderVal === true;

    const shouldShowLoader = (isMutation || forceShowLoader) && !hideLoader;
    (config as any)._loaderShown = shouldShowLoader;

    if (shouldShowLoader && typeof window !== "undefined" && window.showGlobalLoader) {
      window.showGlobalLoader();
    }
    return config;
  },
  (error) => {
    if (error.config && (error.config as any)._loaderShown && typeof window !== 'undefined' && window.hideGlobalLoader) {
      window.hideGlobalLoader();
    } else if (!error.config && typeof window !== 'undefined' && window.hideGlobalLoader) {
      window.hideGlobalLoader();
    }
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    if ((response.config as any)._loaderShown && typeof window !== 'undefined' && window.hideGlobalLoader) {
      window.hideGlobalLoader();
    }

    // Display global toasts for successful responses if a message is present
    const data = response.data;
    const method = response.config.method?.toLowerCase();
    const isMutation = method && ['post', 'put', 'patch', 'delete'].includes(method);
    const hideToast = response.config.headers?.["x-no-toast"] === "true" || 
                      response.config.headers?.["x-no-toast"] === true ||
                      response.config.url?.toLowerCase().includes("auth/me");
    
    if (hideToast) return response;

    if (data && (data.Message || data.message)) {
      const rawMessage = data.Message || data.message;
      // Don't toast if the message is just "S" or "E" (which are status codes)
      if (rawMessage === "S" || rawMessage === "E") return response;

      // If it's explicitly marked as Error but came back as 2xx, still show as error
      const isError = data.Type === 'E';

      // Only show success toasts for mutation actions (POST, PUT, PATCH, DELETE)
      if (isError || isMutation) {
        showDeDupToast({
          title: isError ? "Error" : (data.Type === "S" ? "Success" : "Notification"),
          description: rawMessage,
          variant: isError ? "destructive" : "success",
        });
      }
    }

    return response;
  },
  (error) => {
    if (error.config && (error.config as any)._loaderShown && typeof window !== 'undefined' && window.hideGlobalLoader) {
      window.hideGlobalLoader();
    } else if (!error.config && typeof window !== 'undefined' && window.hideGlobalLoader) {
      window.hideGlobalLoader();
    }

    // Display global toasts for error responses
    const data = error.response?.data;
    const isAuthMe = error.config?.url?.toLowerCase().includes("auth/me");

    if (data && (data.Message || data.message)) {
      // Don't toast for unauthorized auth/me checks
      if (isAuthMe && error.response?.status === 401) {
        return Promise.reject(error);
      }

      showDeDupToast({
        title: "Error",
        description: data.Message || data.message,
        variant: "destructive",
      });
    } else if (!error.response) {
      // Network error
      showDeDupToast({
        title: "Network Error",
        description: "Unable to connect to the server. Please check your connection.",
        variant: "destructive",
      });
    }

    return Promise.reject(error);
  }
);

let cachedPublicIp: string | null = null;

if (typeof window !== 'undefined') {
  cachedPublicIp = sessionStorage.getItem('client_public_ip');
  if (!cachedPublicIp) {
    fetch('https://api.ipify.org?format=json')
      .then(r => r.json())
      .then(data => {
        if (data.ip) {
          cachedPublicIp = data.ip;
          sessionStorage.setItem('client_public_ip', data.ip);
        }
      })
      .catch(e => console.warn('Failed to fetch public IP', e));
  }
}

export abstract class CommonService {
  private static getHeaders(model?: any) {
    const headers: any = {};

    // Authorization is now handled automatically by the browser via httpOnly cookies
    // withCredentials: true ensures cookies are sent with every request

    const userData = CommonHelper.GetUserData();
    if (userData?.Ip) {
      headers["Ip"] = userData.Ip;
    }

    const token = CommonHelper.GetToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (cachedPublicIp) {
      headers["x-client-public-ip"] = cachedPublicIp;
    }

    if (!(model instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  }

  private static setHeaders(model?: any) {
    const headers = this.getHeaders(model);
    Object.keys(headers).forEach(key => {
      if (key !== "Content-Type") {
        axios.defaults.headers.common[key] = headers[key];
      }
    });

    // Ensure Content-Type is NOT in common as it breaks multipart uploads
    delete axios.defaults.headers.common["Content-Type"];
    axios.defaults.withCredentials = true;
  }

  private static handleResponse(
    resolve: Function,
    reject: Function,
    error: any,
  ) {
    if (error.response) {
      // Check for 401 Unauthorized globally, but ignore for the initial /auth/me session check
      if (
        error.response.status === 401 &&
        !error.config?.url?.includes("/auth/me") &&
        !error.config?.url?.includes("ErrorLog") &&
        !error.config?.url?.includes("AuditLog") &&
        !error.config?.url?.includes("tools/logs")
      ) {
        console.warn("Unauthorized API call, clearing token and redirecting.");
        CommonHelper.ClearLocalStorage();
        window.location.href = "/login";
      }
      // Reject with a structured object that includes status and data
      const data = error.response.data;
      const message = data?.Message || data?.message || data?.error?.message || error.message;
      reject({
        status: error.response.status,
        data: data,
        message: message,
      });
    } else {
      console.error("API Network/CORS Error:", error);
      reject(error);
    }
  }

  /**
   * Sanitizes the URL path to prevent redundant /api/v1 and ensure correct formatting
   */
  private static formatUrl(UrlName: string): string {
    // 1. Remove leading slash
    let path = UrlName.startsWith('/') ? UrlName.substring(1) : UrlName;

    // 2. Remove redundant /api prefix if present
    if (path.startsWith('api/')) {
      path = path.substring(4);
    }

    // 3. Remove redundant /v1 prefix if present
    if (path.startsWith('v1/')) {
      path = path.substring(3);
    } else if (path === 'v1') {
      path = '';
    }

    // 4. Final join with APIURL and ensure only single slashes
    // This allows passing just "auth/me", "/auth/me", or even "/api/v1/auth/me" consistently
    return `${APIURL}/${path}`.replace(/\/+/g, '/');
  }

  public static GetAll(UrlName: string, showLoader: boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders();
      const config = {
        headers: {
          [showLoader ? 'x-show-loader' : 'x-no-loader']: 'true'
        }
      };

      axios
        .get(this.formatUrl(UrlName), config)
        .then((response) => resolve(response.data?.AddtionalData || response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static GetAudio(url: string): Promise<any> {
    return axios.get(this.formatUrl(url), {
      responseType: "arraybuffer",
      headers: {
        Accept: "audio/mpeg",
      },
    });
  }

  public static GetById(id: any, UrlName: string, showLoader: boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders();
      const config = {
        headers: {
          [showLoader ? 'x-show-loader' : 'x-no-loader']: 'true'
        }
      };
      axios
        .get(`${this.formatUrl(UrlName)}/${id}`, config)
        .then((response) => resolve(response.data?.AddtionalData || response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static async CommonPost(
    model: any,
    UrlName: string,
    config?: any,
  ): Promise<any> {
    this.setHeaders(model);
    try {
      const response = await axios.post(this.formatUrl(UrlName), model, config);
      return response.data;
    } catch (error) {
      return new Promise((_, reject) => {
        this.handleResponse(() => { }, reject, error);
      });
    }
  }

  public static Delete(id: string, UrlName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders();
      axios
        .delete(`${this.formatUrl(UrlName)}/${id}`)
        .then((response) => resolve(response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static CacheClear(UrlName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders();
      axios
        .delete(this.formatUrl(UrlName))
        .then((response) => resolve(response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static PostWithParameter(
    model: any,
    UrlName: string,
    params: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders(model);
      let url = this.formatUrl(UrlName);
      params.forEach((e: any) => {
        url = `${url}/${e.params}`;
      });
      axios
        .post(url, model)
        .then((response) => resolve(response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static GetWithParameter(UrlName: string, params: any, showLoader: boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders();
      const config = { headers: { [showLoader ? 'x-show-loader' : 'x-no-loader']: 'true' } };
      let url = this.formatUrl(UrlName);
      params.forEach((e: any) => {
        url = `${url}/${e.params}`;
      });
      axios
        .get(url, config)
        .then((response) => resolve(response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static FullUrlGet(UrlName: string, showLoader: boolean = true): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders();
      const config = { headers: { [showLoader ? 'x-show-loader' : 'x-no-loader']: 'true' } };
      axios
        .get(UrlName, config)
        .then((response) => resolve(response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static CommonPatch(
    model: any,
    UrlName: string,
    config?: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders(model);
      axios
        .patch(this.formatUrl(UrlName), model, config)
        .then((response) => resolve(response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static CommonPut(model: any, UrlName: string, config?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders(model);
      axios
        .put(this.formatUrl(UrlName), model, config)
        .then((response) => resolve(response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static CommonPutConfig(
    model: any,
    UrlName: string,
    config?: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders(model);
      axios
        .put(this.formatUrl(UrlName), model, config)
        .then((response) => resolve(response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static CommonDelete(UrlName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders();
      axios
        .delete(this.formatUrl(UrlName))
        .then((response) => resolve(response.data))
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static ExcelDownloadGet(UrlName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setHeaders();
      axios
        .get(this.formatUrl(UrlName), { responseType: "blob" })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => this.handleResponse(resolve, reject, error));
    });
  }

  public static async DownloadPost(model: any, UrlName: string): Promise<any> {
    try {
      const response = await axios.post(this.formatUrl(UrlName), model, {
        responseType: "blob",
      });
      return response;
    } catch (error) {
      console.error("DownloadPost Error:", error);
      throw error;
    }
  }

  public static async FileUpload(model: FormData, UrlName: string): Promise<any> {
    const headers = this.getHeaders(model);
    try {
      const response = await axios.post(this.formatUrl(UrlName), model, {
        headers,
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      return new Promise((_, reject) => {
        this.handleResponse(() => { }, reject, error);
      });
    }
  }
}
