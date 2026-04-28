import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export const handleAPIResponse = (response, successCallback, errorCallback) => {
    if (response?.code === 200) {
        toast(response.message, { type: "success" });
        successCallback?.();
    } else {
        toast(response.message || "Something went wrong.", { type: "error" });
        errorCallback?.();
    }
};
