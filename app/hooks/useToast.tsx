import { useState, useCallback } from "react";

const useToast = () => {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "error" | "warning" | "info" = "error"
    ) => {
      setToastMessage(message);
      setToastType(type);
      setToastVisible(true);
    },
    []
  );

  return { toastVisible, setToastVisible, toastMessage, toastType, showToast };
};

export default useToast;
