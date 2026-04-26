import { CommonService } from "@/service/commonservice.page";

export const api = {
    get: (url: string) => CommonService.GetAll(url),
    post: (url: string, data: any) => CommonService.CommonPost(data, url),
    put: (url: string, data: any) => CommonService.CommonPut(data, url),
    delete: (url: string) => {
        // Handle cases where URL already contains the ID
        const parts = url.split('/');
        const id = parts.pop() || "";
        const basePath = parts.join('/');
        return CommonService.Delete(id, basePath);
    },
};
