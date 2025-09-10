// // src/lib/utils.js
// export function cn(...classes) {
//   return classes.filter(Boolean).join(" ")
// }

import { toast } from "react-toastify";

// src/lib/utils.js
export function cn(...classes) {
  return classes.filter(Boolean).join(" ")
}

// Toast notification functions
export const handleSuccess = (msg) => {
  toast.success(msg, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

export const handleError = (msg) => {
  toast.error(msg, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};
