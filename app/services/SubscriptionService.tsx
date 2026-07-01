import AuthService from "./AuthService";

const API_BASE_URL = "http://my.farimod.ir/api/MobileApp/SubscriptionPlan";

const fetchWithTimeout = (url: string, options: RequestInit, timeout: number = 10000): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
};

class SubscriptionService {
  async getAllActivePlans() {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/GetAllActive`, {
        method: "GET",
        headers: {
          accept: "*/*",
        },
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.Data || [],
          message: "لیست اشتراک‌ها دریافت شد",
        };
      } else {
        return {
          success: false,
          message: data.Message || "خطا در دریافت اشتراک‌ها",
        };
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      return {
        success: false,
        message: error.message === 'Request timeout' ? "زمان درخواست به پایان رسید" : "خطا در اتصال به سرور",
      };
    }
  }

  // دریافت اشتراک فعال کاربر - اصلاح شده
  async getActiveSubscriptionPlan(memberId: number) {
    try {
      if (!memberId) {
        return {
          success: false,
          data: null,
          message: "شناسه کاربر موجود نیست",
        };
      }

      const token = await AuthService.getUserToken();

      const response = await fetchWithTimeout(
        `${API_BASE_URL}/GetActiveSubscriptionPlanOfMember?memberId=${memberId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
            accept: "*/*",
          },
        }
      );

      const text = await response.text();

      if (!text || text.trim() === '') {
        return {
          success: false,
          data: null,
          message: "اشتراک فعالی یافت نشد",
        };
      }

      const data = JSON.parse(text);

      if (response.ok && data) {
        return {
          success: true,
          data,
          message: "اطلاعات اشتراک دریافت شد",
        };
      } else {
        return {
          success: false,
          data: null,
          message: data?.Message || "اشتراک فعالی یافت نشد",
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message === 'Request timeout' ? "زمان درخواست به پایان رسید" : "خطا در اتصال به سرور",
      };
    }
  }

  async applyDiscountCode(subscriptionPlanId: number, code: string, timePeriod: number) {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/ApplyDiscountCode?subscriptionPlanId=${subscriptionPlanId}&code=${encodeURIComponent(
          code
        )}&timePeriod=${timePeriod}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
          message: "کد تخفیف اعمال شد",
        };
      } else {
        return {
          success: false,
          message: data.Message || "کد تخفیف معتبر نیست",
        };
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      return {
        success: false,
        message: error.message === 'Request timeout' ? "زمان درخواست به پایان رسید" : "خطا در اعمال کد تخفیف",
      };
    }
  }

  // خرید اشتراک
  async buySubscriptionPlan(memberId: number, subscriptionPlanId: number, subscriptionTotalDays: number, discountCode: string = "") {
    try {
      const token = await AuthService.getUserToken();

      if (!token) {
        return {
          success: false,
          message: "کاربر وارد نشده است",
        };
      }

      const requestBody = {
        MemberId: memberId,
        SubscriptionPlanId: subscriptionPlanId,
        SubscriptionTotalDays: subscriptionTotalDays,
        DiscountCode: discountCode,
      };

      const response = await fetchWithTimeout(`${API_BASE_URL}/BuySubscriptionPlan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data,
          message: "اشتراک با موفقیت ثبت شد",
        };
      } else {
        return {
          success: false,
          message: data.Message || "خطا در ثبت اشتراک",
        };
      }
    } catch (error) {
      console.error("Error buying subscription:", error);
      return {
        success: false,
        message: error.message === 'Request timeout' ? "زمان درخواست به پایان رسید" : "خطا در اتصال به سرور",
      };
    }
  }

  // محاسبه تعداد روزها بر اساس نوع اشتراک
  calculateDays(subscriptionType: string): number {
    const daysMap: { [key: string]: number } = {
      fourteen_days: 14,
      one_month: 30,
      three_months: 90,
      six_months: 180,
      annual: 365,
    };

    return daysMap[subscriptionType] || 30;
  }

  // گرفتن قیمت بر اساس نوع اشتراک
  getPrice(plan: any, subscriptionType: string): number {
    const priceMap: { [key: string]: number } = {
      fourteen_days: plan.FourteenDaysSubscriptionPrice,
      one_month: plan.OneMonthSubscriptionPrice,
      three_months: plan.ThreeMonthsSubscriptionPrice,
      six_months: plan.SixMonthsSubscriptionPrice,
      annual: plan.AnnualSubscriptionPrice,
    };

    return priceMap[subscriptionType] || 0;
  }
}

export default new SubscriptionService();