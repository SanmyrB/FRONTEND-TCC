// Utilitários para os cálculos
export const CalculationUtils = {
  // Converter valores para número seguro
  parseSafe: (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === "")
      return defaultValue;
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  },

  // Validar se um objeto de resultados é válido
  isValidResult: (result) => {
    return (
      result && typeof result === "object" && Object.keys(result).length > 0
    );
  },

  // Extrair array de dados de forma segura
  getSafeArray: (obj, path, defaultValue = []) => {
    try {
      const value = path.split(".").reduce((o, p) => o?.[p], obj);
      return Array.isArray(value) ? value : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  // Extrair valor numérico de forma segura
  getSafeNumber: (obj, path, defaultValue = 0) => {
    try {
      const value = path.split(".").reduce((o, p) => o?.[p], obj);
      return this.parseSafe(value, defaultValue);
    } catch {
      return defaultValue;
    }
  },

  // Gerar labels para gráficos
  generateLabels: (data, prefix = "Evap", includeInitial = true) => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const labels = [];
    if (includeInitial) {
      labels.push("Inicial");
    }

    const startIndex = includeInitial ? 1 : 0;
    for (let i = startIndex; i < data.length; i++) {
      labels.push(`${prefix} ${String(i).padStart(2, "0")}`);
    }

    return labels;
  },
};
