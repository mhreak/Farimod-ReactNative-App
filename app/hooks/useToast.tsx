import React, { useState, useEffect } from "react";

const useToast = () => {
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [toastType, setToastType] = useState<
    "success" | "error" | "warning" | "info"
  >("error");

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "error"
  ) => {
    console.log('🔥 showToast called with:', { message, type });
    console.log('🔥 Current state before:', { toastVisible, toastMessage, toastType });

    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);

    console.log('🔥 State should be updated to:', { visible: true, message, type });
  };

  // Log state changes
  useEffect(() => {
    console.log('🔥 Toast state changed:', { toastVisible, toastMessage, toastType });
  }, [toastVisible, toastMessage, toastType]);

  return { toastVisible, setToastVisible, toastMessage, toastType, showToast };
};

export default useToast;