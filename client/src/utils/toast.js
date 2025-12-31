import toast from "react-hot-toast";
import { getUserFriendlyError } from "./errorMessage";

//  generic err toast

export const showErrToast = (error, options = {}) => {
  const message =
    typeof error === "string" ? error : getUserFriendlyError(error);

  toast.error(message, { id: options.id || "global-error" });
};

// Loading toast
export const showLoadingToast = (message = "Please wait...") => {
  return toast.loading(message);
};

// Success toast (can override loading)
export const showSuccessToast = (message, toastId) => {
  toast.success(message, toastId ? { id: toastId } : undefined);
};

// Dismiss toast
export const dismissToast = (toastId) => {
  if (toastId) toast.dismiss(toastId);
};
