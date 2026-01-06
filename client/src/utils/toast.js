import toast from "react-hot-toast";
import { getUserFriendlyError } from "./errorMessage";

//  generic err toast

export const showErrToast = (error, toastId) => {
  const message =
    typeof error === "string" ? error : getUserFriendlyError(error);

  toast.error(message, toastId ? { id: toastId } : undefined);
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
// use when
// Manual close before navigation

// Global cleanup (logout, route change)

// Toasts not meant to be replaced
