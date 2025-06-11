export const toPersianDigits = (
  input: string | number | null | undefined
): string => {
  if (input === null || input === undefined) return "";

  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const englishDigits = "0123456789";

  return input.toString().replace(/[0-9]/g, (match) => {
    return persianDigits[englishDigits.indexOf(match)];
  });
};
