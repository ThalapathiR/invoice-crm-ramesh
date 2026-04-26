import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "@/hooks/use-toast";

export abstract class CommonHelper {
  // Validation Logic
  public static FormValidation(
    thisvalue: React.Dispatch<React.SetStateAction<never[]>>,
    ValidationArray: any,
    data: any
  ) {
    const resValidation = this.Validation(ValidationArray, data);
    if (Object.keys(resValidation).length === 0) {
      thisvalue([]);
      return true;
    } else {
      thisvalue(resValidation);
      return false;
    }
  }

  private static Validation(initialValues: any, data: any) {
    let errors: any = {};
    for (const iterator of initialValues) {
      for (const iteratorvalidation of iterator.validation) {
        if (iteratorvalidation.type === "required") {
          if (!data[iterator.name]) {
            errors[iterator.name] = iteratorvalidation.message;
            break;
          }
        }
        if (iteratorvalidation.type === "email") {
          if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(
              data[iterator.name]
            )
          ) {
            errors[iterator.name] = iteratorvalidation.message;
            break;
          }
        }
        if (iteratorvalidation.type === "min") {
          if (
            parseFloat(data[iterator.name]) <
            parseFloat(iteratorvalidation.minvalue)
          ) {
            errors[iterator.name] = iteratorvalidation.message;
            break;
          }
        }
        if (iteratorvalidation.type === "max") {
          if (data[iterator.name] > iteratorvalidation.maxvalue) {
            errors[iterator.name] = iteratorvalidation.message;
            break;
          }
        }
        if (iteratorvalidation.type === "password") {
          if (data[iterator.name].length < 8) {
            errors[iterator.name] =
              "Your password must be at least 8 characters";
            break;
          }
          if (data[iterator.name].search(/[A-Z]/) < 0) {
            errors[iterator.name] =
              "Your password must contain at least one uppercase letter.";
            break;
          }
          if (data[iterator.name].search(/[a-z]/i) < 0) {
            errors[iterator.name] =
              "Your password must contain at least one lowercase letter.";
            break;
          }
          if (data[iterator.name].search(/[0-9]/) < 0) {
            errors[iterator.name] =
              "Your password must contain at least one digit.";
            break;
          }
          if (data[iterator.name].search(/[!@#$%^&*]/) < 0) {
            errors[iterator.name] =
              "Your password must contain at least one special character (!@#$%^&*).";
            break;
          }
        }
        if (iteratorvalidation.type === "mobile") {
          if (!/^\d{10}$/.test(data[iterator.name])) {
            errors[iterator.name] =
              iteratorvalidation.message ||
              "Enter a valid 10-digit mobile number";
            break;
          }
        }
        if (iteratorvalidation.type === "number") {
          if (!/^\d+$/.test(data[iterator.name])) {
            errors[iterator.name] =
              iteratorvalidation.message || "Only numbers are allowed";
            break;
          }
        }
      }
    }
    return errors;
  }

  // Localstorage
  static UserData: any;
  static UserStorageName: string = "api_token";
  static UserDataRecordName: string = "user_data";

  public static SetUserData(
    name: string,
    value: any,
    IsUserData: boolean = false,
    JsonFormat: boolean = true
  ) {
    if (name === "api_token" || name === this.UserStorageName || name === this.UserDataRecordName) {
      // Don't store auth tokens or user data in localStorage per user preference
      // These are managed via cookies now
      this.UserData = null;
      return;
    }

    if (IsUserData) {
      if (JsonFormat) {
        localStorage.setItem(this.UserDataRecordName, JSON.stringify(value));
      } else {
        localStorage.setItem(this.UserDataRecordName, value);
      }
      this.UserData = null;
    } else {
      if (JsonFormat) {
        localStorage.setItem(this.UserStorageName, JSON.stringify(value));
      } else {
        localStorage.setItem(this.UserStorageName, value);
      }
    }
  }

  public static SetLocalStorage(
    name: string,
    value: any,
    IsUserData: boolean = false,
    JsonFormat: boolean = true
  ) {
    if (name === "api_token" || name === this.UserStorageName || name === this.UserDataRecordName) {
       // Don't store auth tokens or user data in localStorage
       this.UserData = null;
       return;
    }

    if (IsUserData) {
      if (JsonFormat) {
        localStorage.setItem(name, JSON.stringify(value));
      } else {
        localStorage.setItem(name, value);
      }

      this.UserData = null;
    } else {
      if (JsonFormat) {
        localStorage.setItem(name, JSON.stringify(value));
      } else {
        localStorage.setItem(name, value);
      }
    }
  }

  public static GetLocalStorage(name: string, JsonFormat: boolean = true) {
    const value = localStorage.getItem(name);
    if (value === null) {
      return JsonFormat ? {} : "";
    }
    if (JsonFormat) {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    } else {
      return value;
    }
  }

  public static getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  }

  public static GetUserData() {
    if (!this.UserData) {
      // Use cookie as the single source of truth for user session/context
      const cookieData = this.getCookie("user_data");
      let RawUserData: any = null;

      if (cookieData && cookieData !== "null" && cookieData !== "undefined") {
        try {
          RawUserData = JSON.parse(decodeURIComponent(cookieData));
        } catch (e) {
          console.error("Failed to parse user_data cookie", e);
        }
      }

      this.UserData = RawUserData || {};
    }
    return this.UserData;
  }

  public static GetToken() {
    // 1. Try separate 'token' cookie first (Source of truth for token)
    // Note: JS can only read this if it's NOT httpOnly. 
    // If it's httpOnly, the browser manages it automatically via withCredentials: true.
    const cookieToken = this.getCookie("token");
    if (cookieToken && cookieToken !== "null" && cookieToken !== "undefined" && cookieToken.length > 20) {
      return cookieToken;
    }

    const userData = this.GetUserData();
    
    // 2. Try api_token inside user_data (from GetUserData which reads the non-httpOnly cookie)
    if (userData && typeof userData === "object" && userData.api_token) {
      const token = userData.api_token;
      if (token !== "null" && token !== "undefined" && token.length > 20) return token;
    }

    return null;
  }

  public static scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  public static ClearLocalStorage() {
    localStorage.clear();
    this.UserData = null;
    if (typeof document !== "undefined") {
      // Clear non-httpOnly cookies
      document.cookie = "user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      // Note: httpOnly 'token' cookie must be cleared by the backend / logout endpoint
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }

  public static decodeUnicode = (str?: string) => {
    if (!str) return ""; // handle undefined
    return str.replace(/\\u[\dA-Fa-f]{4}/g, (m) =>
      String.fromCharCode(parseInt(m.replace("\\u", ""), 16))
    );
  }

  public static ExceldownloadAsBlob(
    response: any,
    view: boolean = false,
    filename: string = ""
  ) {
    try {
      console.log("Response Headers:", response.headers); // Debugging

      // Check if the response contains valid data and create a Blob
      const blob =
        response.data instanceof Blob
          ? response.data
          : new Blob([response.data]);
      const objectUrl = window.URL.createObjectURL(blob);

      if (view) {
        window.open(objectUrl, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = objectUrl;

        // Ensure headers exist
        const contentDisposition =
          response.headers?.["content-disposition"] ||
          response.headers?.get("content-disposition");
        console.log("Content-Disposition:", contentDisposition); // Debugging

        // Extract filename from content-disposition
        let extractedFilename = "download.xlsx"; // Default
        if (contentDisposition) {
          const matches = contentDisposition.match(
            /filename\*?=['"]?(?:UTF-8['"]*)?([^;\n]*)/i
          );
          if (matches && matches[1]) {
            extractedFilename = decodeURIComponent(matches[1]);
          }
        }

        link.download = filename || extractedFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error handling file download:", error);
    }
  }

  public static SuccessToaster = (msg = "") => {
    toast({
      title: "Success",
      description: msg,
    });
  };

  public static ErrorToaster = (msg = "") => {
    toast({
      title: "Error",
      description: msg,
      variant: "destructive",
    });
  };
  public static normalizeToArray = (data: any) => {
    if (Array.isArray(data)) {
      return data;
    } else if (typeof data === "object" && data !== null) {
      return Object.values(data);
    } else {
      return [];
    }
  };
  public static formatDate = (inputDate: any) => {
    const momentDate = moment(inputDate);
    const now = moment();

    // Calculate the difference in days
    const diffInDays = now.diff(momentDate, "days");

    if (diffInDays < 7) {
      // Less than a week ago
      return momentDate.fromNow(); // e.g., "5 days ago", "3 hours ago"
    } else if (diffInDays < 365) {
      // Less than a year ago
      return momentDate.from(now); // e.g., "2 months ago"
    } else {
      // More than a year ago
      return momentDate.format("MMMM D, YYYY"); // e.g., "May 12, 2024"
    }
  };
  public static formatDateTime = (inputDate: any) => {
    const inputDateTime = moment(inputDate);
    return inputDateTime.format("DD/MM/YYYY hh:mm:ss A");
  };
  // public static Showspinner = () => {
  //     const x = document.getElementById('spinnerloading');
  //     const y = document.getElementById('spinnerloadingimage');
  //     if (x) {
  //         x.style.display = 'flex';
  //     }
  //     if (y) {
  //         y.style.display = 'block';
  //     }
  // };

  public static parseDescription = (content:any) => {
    if (Array.isArray(content)) {
      return CommonHelper.renderFlutterQuillBlocks(content);
    }
    if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);

        if (
          Array.isArray(parsed) &&
          parsed[0]?.type &&
          parsed[0]?.value !== undefined
        ) {
          return CommonHelper.renderFlutterQuillBlocks(parsed);
        }

        return content;
      } catch (e) {
        return content;
      }
    }
    return "";
  };

  public static renderFlutterQuillBlocks = (blocks:any) => {
    return blocks
      .map((block:any) => {
        if (block.type === "text") {
          return `<span>${CommonHelper.escapeHtml(block.value)}</span>`;
        } else if (block.type === "image") {
          return `<img src="data:image/jpeg;base64,${block.value}" style="max-width: 100%;" />`;
        }
        return "";
      })
      .join("");
  };

  public static escapeHtml = (text: any) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m: string) => map[m]);
  };

  // public static Hidespinner = () => {
  //     const x = document.getElementById('spinnerloading');
  //     const y = document.getElementById('spinnerloadingimage');
  //     if (x) {
  //         x.style.display = 'none';
  //     }
  //     if (y) {
  //         y.style.display = 'none';
  //     }
  // };

  public static Showspinner = () => {
    const spinner = document.getElementById("global-spinner");
    if (spinner) {
      spinner.style.display = "flex";
    }
  };

  public static Hidespinner = () => {
    const spinner = document.getElementById("global-spinner");
    if (spinner) {
      spinner.style.display = "none";
    }
  };

  public static async PdfDownloadAsBlob(
    response: any,
    view: boolean = false,
    filename: string = ""
  ) {
    try {
      // Ensure response is a Blob
      const blob = response instanceof Blob ? response : await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      if (view) {
        window.open(objectUrl, "_blank");
      } else {
        const link = document.createElement("a");
        link.href = objectUrl;

        // Handling content-disposition for filename
        const contentDisposition = response.headers?.get
          ? response.headers.get("content-disposition")
          : response.headers?.["content-disposition"];

        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = contentDisposition
          ? filenameRegex.exec(contentDisposition)
          : null;

        if (matches && matches[1]) {
          link.download = matches[1].replace(/['"]/g, "");
        } else if (filename) {
          link.download = filename;
        } else {
          link.download = "download.pdf";
        }

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Release the object URL
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Error handling file download:", error);
    }
  }

  public static downloadAsBlob(response: any, fileName: any) {
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(response);
    link.download = fileName;
    link.click();
  }
}
