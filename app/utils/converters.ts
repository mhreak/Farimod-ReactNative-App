export const toPersianDigits = (
  input: string | number | null | undefined
): string => {
  // Handle null, undefined, or empty cases
  if (input === null || input === undefined || input === "") {
    return "۰";
  }

  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  try {
    // Convert to string safely
    const stringValue = typeof input === "string" ? input : String(input);

    // Replace English digits with Persian digits
    return stringValue.replace(/[0-9]/g, (match) => {
      const index = englishDigits.indexOf(match);
      return index !== -1 ? persianDigits[index] : match;
    });
  } catch (error) {
    console.warn("Error converting to Persian digits:", error);
    return "۰";
  }
};

// Helper function to safely get numeric value
export const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }

  const numValue = typeof value === "number" ? value : Number(value);
  return isNaN(numValue) ? defaultValue : numValue;
};

// Helper function to safely format price
export const formatPrice = (
  price: number | string | null | undefined,
  currency: string = "تومان"
): string => {
  const safePrice = safeNumber(price);
  return `${toPersianDigits(safePrice.toLocaleString())} ${currency}`;
};

// Helper function to safely check string contains
export const safeStringIncludes = (str: any, searchString: string): boolean => {
  if (!str) return false;
  try {
    return String(str).includes(searchString);
  } catch (error) {
    return false;
  }
};

// Helper function to safely get string value
export const safeString = (value: any, defaultValue: string = ""): string => {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  try {
    return String(value);
  } catch (error) {
    return defaultValue;
  }
};

// ========================= DATE CONVERSION FUNCTIONS =========================

/**
 * Check if a year is leap in Gregorian calendar
 */
const isGregorianLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

/**
 * Check if a year is leap in Persian calendar
 */
const isPersianLeapYear = (year: number): boolean => {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097,
    2192, 2262, 2324, 2394, 2456, 3178,
  ];

  let jp = breaks[0];
  let jump = 0;
  for (let j = 1; j < breaks.length; j++) {
    const jm = breaks[j];
    jump = jm - jp;
    if (year < jm) break;
    jp = jm;
  }
  const n = year - jp;

  if (n < jump) {
    if (jump - n < 6) return false;
    const n1 = n + 1;
    if (jump - n1 < 6) return n1 % 4 === 0;
    return n % 4 === 0;
  }
  return false;
};

/**
 * Convert Gregorian date to Persian (Jalali) date
 */
export const gregorianToPersian = (
  gregorianDate: Date | string | null | undefined
): { year: number; month: number; day: number; formatted: string } | null => {
  try {
    if (!gregorianDate) return null;

    const date =
      typeof gregorianDate === "string"
        ? new Date(gregorianDate)
        : gregorianDate;

    if (isNaN(date.getTime())) return null;

    const gy = date.getFullYear();
    const gm = date.getMonth() + 1;
    const gd = date.getDate();

    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

    let jy = gy <= 1600 ? 0 : 979;
    gy > 1600 && (jy = 1342);

    const gy2 = gy > 1600 ? gy - 1600 : gy - 621;
    const days =
      365 * gy2 +
      Math.floor((gy2 + 3) / 4) +
      Math.floor((gy2 + 99) / 100) -
      Math.floor((gy2 + 399) / 400) -
      80 +
      gd +
      (gm > 2
        ? g_d_m[gm - 1] + (gm > 2 && isGregorianLeapYear(gy) ? 1 : 0)
        : g_d_m[gm - 1]);

    jy += 33 * Math.floor(days / 12053);
    const days2 = days % 12053;

    jy += 4 * Math.floor(days2 / 1461);
    let days3 = days2 % 1461;

    if (days3 >= 366) {
      jy += Math.floor((days3 - 1) / 365);
      days3 = (days3 - 1) % 365;
    }

    let jm = 0;
    let jd = 0;

    if (days3 < 186) {
      jm = 1 + Math.floor(days3 / 31);
      jd = 1 + (days3 % 31);
    } else {
      jm = 7 + Math.floor((days3 - 186) / 30);
      jd = 1 + ((days3 - 186) % 30);
    }

    const formatted = `${toPersianDigits(jy)}/${toPersianDigits(
      jm.toString().padStart(2, "0")
    )}/${toPersianDigits(jd.toString().padStart(2, "0"))}`;

    return {
      year: jy,
      month: jm,
      day: jd,
      formatted,
    };
  } catch (error) {
    console.warn("Error converting Gregorian to Persian date:", error);
    return null;
  }
};

/**
 * Convert Persian (Jalali) date to Gregorian date
 */
export const persianToGregorian = (
  persianYear: number,
  persianMonth: number,
  persianDay: number
): Date | null => {
  try {
    if (
      persianYear < 1 ||
      persianMonth < 1 ||
      persianMonth > 12 ||
      persianDay < 1
    ) {
      return null;
    }

    const jy = persianYear;
    const jm = persianMonth;
    const jd = persianDay;

    const jy2 = jy > 979 ? 1600 : 621;
    const jy3 = jy > 979 ? jy - 979 : jy;

    const jp = Math.floor(jy3 / 33);
    const jp2 = jy3 % 33;
    const jp3 = Math.floor(jp2 / 4);

    const days =
      365 * jy3 +
      8 * jp +
      Math.floor((jp3 + 3) / 4) +
      78 +
      jd +
      (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

    let gy = days <= 366 ? jy2 : jy2 + Math.floor((days - 366) / 365.25);
    let gd =
      days -
      (365 * (gy - jy2) +
        Math.floor((gy - jy2 + 3) / 4) +
        Math.floor((gy - jy2 + 99) / 100) -
        Math.floor((gy - jy2 + 399) / 400));

    const isLeap = isGregorianLeapYear(gy);
    const sal_a = [
      0,
      31,
      isLeap ? 29 : 28,
      31,
      30,
      31,
      30,
      31,
      31,
      30,
      31,
      30,
      31,
    ];

    let gm = 0;
    while (gm < 13 && gd > sal_a[gm]) {
      gd -= sal_a[gm];
      gm++;
    }

    if (gm > 12) {
      gm = 1;
      gy++;
      gd = 1;
    }

    return new Date(gy, gm - 1, gd);
  } catch (error) {
    console.warn("Error converting Persian to Gregorian date:", error);
    return null;
  }
};

/**
 * Format Persian date with custom format
 */
export const formatPersianDate = (
  date: Date | string | null | undefined,
  format: "short" | "medium" | "long" | "full" = "medium",
  includeTime: boolean = false
): string => {
  try {
    if (!date) return "";

    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) return "";

    const persianDate = gregorianToPersian(parsedDate);
    if (!persianDate) return "";

    const persianMonths = [
      "",
      "فروردین",
      "اردیبهشت",
      "خرداد",
      "تیر",
      "مرداد",
      "شهریور",
      "مهر",
      "آبان",
      "آذر",
      "دی",
      "بهمن",
      "اسفند",
    ];

    const persianDaysOfWeek = [
      "یکشنبه",
      "دوشنبه",
      "سه‌شنبه",
      "چهارشنبه",
      "پنج‌شنبه",
      "جمعه",
      "شنبه",
    ];

    let formattedDate = "";

    switch (format) {
      case "short":
        formattedDate = `${toPersianDigits(persianDate.year)}/${toPersianDigits(
          persianDate.month.toString().padStart(2, "0")
        )}/${toPersianDigits(persianDate.day.toString().padStart(2, "0"))}`;
        break;

      case "medium":
        formattedDate = `${toPersianDigits(persianDate.day)} ${
          persianMonths[persianDate.month]
        } ${toPersianDigits(persianDate.year)}`;
        break;

      case "long":
        const dayOfWeek = parsedDate.getDay();
        formattedDate = `${persianDaysOfWeek[dayOfWeek]}، ${toPersianDigits(
          persianDate.day
        )} ${persianMonths[persianDate.month]} ${toPersianDigits(
          persianDate.year
        )}`;
        break;

      case "full":
        const dayOfWeekFull = parsedDate.getDay();
        formattedDate = `${persianDaysOfWeek[dayOfWeekFull]}، ${toPersianDigits(
          persianDate.day
        )} ${persianMonths[persianDate.month]} سال ${toPersianDigits(
          persianDate.year
        )}`;
        break;
    }

    if (includeTime) {
      const hours = parsianDate.getHours();
      const minutes = parsedDate.getMinutes();
      const timeString = `${toPersianDigits(
        hours.toString().padStart(2, "0")
      )}:${toPersianDigits(minutes.toString().padStart(2, "0"))}`;
      formattedDate += ` - ${timeString}`;
    }

    return formattedDate;
  } catch (error) {
    console.warn("Error formatting Persian date:", error);
    return "";
  }
};

/**
 * Get current Persian date
 */
export const getCurrentPersianDate = (): {
  year: number;
  month: number;
  day: number;
  formatted: string;
} | null => {
  return gregorianToPersian(new Date());
};

/**
 * Parse Persian date string (YYYY/MM/DD format) to Gregorian Date
 */
export const parsePersianDateString = (
  persianDateString: string
): Date | null => {
  try {
    if (!persianDateString || typeof persianDateString !== "string")
      return null;

    // Convert Persian digits to English digits
    const englishDateString = persianDateString.replace(/[۰-۹]/g, (match) => {
      return String.fromCharCode(
        match.charCodeAt(0) - "۰".charCodeAt(0) + "0".charCodeAt(0)
      );
    });

    const parts = englishDateString.split("/");
    if (parts.length !== 3) return null;

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    return persianToGregorian(year, month, day);
  } catch (error) {
    console.warn("Error parsing Persian date string:", error);
    return null;
  }
};

/**
 * Calculate difference between two dates in Persian calendar
 */
export const calculatePersianDateDifference = (
  date1: Date | string,
  date2: Date | string
): {
  years: number;
  months: number;
  days: number;
  totalDays: number;
} | null => {
  try {
    const d1 = typeof date1 === "string" ? new Date(date1) : date1;
    const d2 = typeof date2 === "string" ? new Date(date2) : date2;

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const persian1 = gregorianToPersian(d1);
    const persian2 = gregorianToPersian(d2);

    if (!persian1 || !persian2) return null;

    // Calculate total days difference
    const totalDays = Math.abs(
      Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
    );

    // Calculate year, month, day differences
    let years = Math.abs(persian2.year - persian1.year);
    let months = Math.abs(persian2.month - persian1.month);
    let days = Math.abs(persian2.day - persian1.day);

    // Adjust for negative values
    if (days < 0) {
      months--;
      days += 30; // Approximate days in a month
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return {
      years,
      months,
      days,
      totalDays,
    };
  } catch (error) {
    console.warn("Error calculating Persian date difference:", error);
    return null;
  }
};

/**
 * Validate Persian date
 */
export const isValidPersianDate = (
  year: number,
  month: number,
  day: number
): boolean => {
  try {
    if (year < 1 || month < 1 || month > 12 || day < 1) return false;

    // Check maximum days in each month
    const maxDays =
      month <= 6 ? 31 : month <= 11 ? 30 : isPersianLeapYear(year) ? 30 : 29;

    return day <= maxDays;
  } catch (error) {
    return false;
  }
};

/**
 * Get Persian month name
 */
export const getPersianMonthName = (month: number): string => {
  const monthNames = [
    "",
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  return monthNames[month] || "";
};

/**
 * Get Persian day of week name
 */
export const getPersianDayName = (date: Date): string => {
  const dayNames = [
    "یکشنبه",
    "دوشنبه",
    "سه‌شنبه",
    "چهارشنبه",
    "پنج‌شنبه",
    "جمعه",
    "شنبه",
  ];

  return dayNames[date.getDay()] || "";
};
