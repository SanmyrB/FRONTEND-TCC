export const formatNumber = (value, precision = 2) => {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return typeof value === "number" ? value.toFixed(precision) : value;
};

export const validateData = (data) => {
  return (
    data && data.length > 0 && data.some((val) => val !== null && !isNaN(val))
  );
};

export const generateLabels = (data, prefix = "Evap") => {
  return [
    "Inicial",
    ...data
      .slice(1)
      .map((_, i) => `${prefix} ${String(i + 1).padStart(2, "0")}`),
  ];
};
