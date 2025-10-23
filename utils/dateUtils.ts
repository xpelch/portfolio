export const formatDateRange = (startDate: string, endDate: string): string => {
  if (!endDate) {
    return startDate;
  }
  return `${startDate} - ${endDate}`;
};
