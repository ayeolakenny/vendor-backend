export const daysToUnix = (days: number) => {
  return new Date().setDate(new Date().getDate() + days);
};

export const unixToDaysLeft = (unix: number) => {
  const unixDaysLeft = new Date(unix).getTime() - new Date().getTime();
  return Math.ceil(unixDaysLeft / (1000 * 3600 * 24));
};
