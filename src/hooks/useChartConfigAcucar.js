const useChartConfig = (dados, customConfig = {}) => {
  const {
    escalaMin = null,
    escalaMax = null,
    stepSize = null,
    beginAtZero = false,
    tipoEscala = "linear",
  } = customConfig;

  const calcularValoresEscala = () => {
    const dadosFiltrados = dados.filter(
      (val) => val !== null && val !== undefined && !isNaN(val)
    );

    if (dadosFiltrados.length === 0) {
      return { min: 0, max: 100, step: 10 };
    }

    const minVal = Math.min(...dadosFiltrados);
    const maxVal = Math.max(...dadosFiltrados);
    const range = maxVal - minVal;

    const calcularStep = () => {
      if (stepSize !== null) return stepSize;
      if (range === 0) return 1;
      const potencia = Math.floor(Math.log10(range));
      const baseStep = Math.pow(10, potencia);
      return range / baseStep > 5 ? baseStep * 2 : baseStep;
    };

    return {
      min:
        escalaMin !== null
          ? escalaMin
          : beginAtZero
          ? Math.min(0, minVal - range * 0.1)
          : minVal - range * 0.1,
      max: escalaMax !== null ? escalaMax : maxVal + range * 0.3,
      step: calcularStep(),
    };
  };

  return {
    valoresEscala: calcularValoresEscala(),
    hasValidData:
      dados &&
      dados.length > 0 &&
      dados.some((val) => val !== null && !isNaN(val)),
  };
};
