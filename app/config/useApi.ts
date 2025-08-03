import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import appConfig from "./config";
import {
  Member,
  MemberResponse,
  Product,
  ProductResponse,
  Course,
  CourseResponse,
  MemberGroup,
  MemberGroupResponse,
  UseApiState,
  MemberProfile, // New interface for detailed member profile
} from "./type";

// Generic API hook
export const useApi = <T>(
  endpoint: string,
  initialData: T[] = []
): UseApiState<T> => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}${endpoint}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.Data && Array.isArray(result.Data)) {
        setData(result.Data);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      console.error(`Error fetching ${endpoint}:`, err);
      setError(err instanceof Error ? err.message : "خطا در دریافت اطلاعات");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// NEW: Hook for single member profile with detailed information
export const useMemberProfile = (
  memberId: number | null
): {
  data: MemberProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} => {
  const [data, setData] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberProfile = useCallback(async () => {
    if (!memberId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${appConfig.mobileApi}Member/Get?memberId=${memberId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.Data) {
        setData(result.Data);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      console.error(`Error fetching member profile for ID ${memberId}:`, err);
      setError(
        err instanceof Error ? err.message : "خطا در دریافت اطلاعات پروفایل"
      );
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchMemberProfile();
  }, [fetchMemberProfile]);

  const refetch = useCallback(() => {
    fetchMemberProfile();
  }, [fetchMemberProfile]);

  return { data, loading, error, refetch };
};

// Specific hook for members
export const useMembers = (): UseApiState<Member> => {
  return useApi<Member>("Member/GetAllLast");
};

// Specific hook for products
export const useProducts = (): UseApiState<Product> => {
  return useApi<Product>("Product/GetAllLast");
};

// Specific hook for courses
export const useCourses = (): UseApiState<Course> => {
  return useApi<Course>("Course/GetAllLast");
};

// NEW: Specific hook for member groups
export const useMemberGroups = (): UseApiState<MemberGroup> => {
  return useApi<MemberGroup>("MemberGroup/GetAll?filterActive=true");
};

// Hook for posting data
export const usePostApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postData = useCallback(async (endpoint: string, data: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error(`Error posting to ${endpoint}:`, err);
      const errorMessage =
        err instanceof Error ? err.message : "خطا در ارسال اطلاعات";
      setError(errorMessage);
      Alert.alert("خطا", errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { postData, loading, error };
};

// Hook for updating data
export const usePutApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const putData = useCallback(async (endpoint: string, data: any) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error(`Error updating ${endpoint}:`, err);
      const errorMessage =
        err instanceof Error ? err.message : "خطا در به‌روزرسانی اطلاعات";
      setError(errorMessage);
      Alert.alert("خطا", errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { putData, loading, error };
};

// Hook for deleting data
export const useDeleteApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteData = useCallback(async (endpoint: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${appConfig.mobileApi}${endpoint}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.error(`Error deleting ${endpoint}:`, err);
      const errorMessage =
        err instanceof Error ? err.message : "خطا در حذف اطلاعات";
      setError(errorMessage);
      Alert.alert("خطا", errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteData, loading, error };
};

// Utility function for handling network errors
export const handleApiError = (error: any, customMessage?: string) => {
  let message = customMessage || "خطای غیرمنتظره‌ای رخ داد";

  if (error instanceof Error) {
    if (error.message.includes("Network request failed")) {
      message = "خطا در اتصال به شبکه. لطفاً اتصال اینترنت خود را بررسی کنید.";
    } else if (error.message.includes("timeout")) {
      message = "درخواست منقضی شد. لطفاً دوباره تلاش کنید.";
    } else if (error.message.includes("500")) {
      message = "خطای سرور. لطفاً بعداً تلاش کنید.";
    } else if (error.message.includes("404")) {
      message = "اطلاعات مورد نظر یافت نشد.";
    }
  }

  return message;
};

// Hook for handling offline/online status
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  // This would typically use NetInfo for React Native
  // For now, we'll return a simple implementation
  return { isOnline };
};
