import { useRef, useEffect } from "react";
import { Chart } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Cores padronizadas
export const CORES = {
  temperatura: "rgb(237, 60, 19)",
  vazao: "rgb(54, 162, 235)",
  brix: "rgb(255, 205, 86)",
  vapor: "rgb(201, 203, 207)",
  pressao: "rgb(153, 102, 255)",
  perda: "rgb(255, 99, 132)",
  verde: "rgb(75, 192, 192)",
};

// Hook para configuração de escala
const useChartConfig = (dados, customConfig = {}) => {
  const {
    escalaMin = null,
    escalaMax = null,
    stepSize = null,
    beginAtZero = false,
    tipoEscala = "linear",
  } = customConfig;

  const calcularValoresEscala = () => {
    const dadosFiltrados =
      dados?.filter(
        (val) => val !== null && val !== undefined && !isNaN(val)
      ) || [];

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

    // Calcular o mínimo garantindo que não seja menor que 0
    const calcularMinimo = () => {
      if (escalaMin !== null) {
        return Math.max(0, escalaMin);
      }

      if (beginAtZero) {
        return 0;
      }

      const minCalculado = minVal - range * 0.1;
      return Math.max(0, minCalculado);
    };

    return {
      min: calcularMinimo(),
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

// Utilitários para gráficos
export const ChartUtils = {
  formatarValor: (value, casasDecimais = 1) => {
    if (value === null || value === undefined || isNaN(value)) return "";
    if (typeof value !== "number") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return "";
      return numValue.toFixed(casasDecimais);
    }
    return value.toFixed(casasDecimais);
  },

  formatarValorPreciso: (value, casasDecimais = 4) => {
    if (value === null || value === undefined || isNaN(value)) return "";
    const numValue =
      typeof value === "string"
        ? parseFloat(value.replace(",", "."))
        : parseFloat(value);
    if (isNaN(numValue)) return "";
    return numValue.toFixed(casasDecimais);
  },

  gerarLabels: (data, prefix = "Etapa", includeInitial = true) => {
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

  validarDados: (dados) => {
    return (
      dados &&
      dados.length > 0 &&
      dados.some((val) => val !== null && !isNaN(val))
    );
  },
};

/**
 * Componente Gráfico de Linha Genérico
 */
export const Grafico = ({
  dados,
  labels,
  titulo,
  cor = CORES.temperatura,
  labelDataset = "Valores",
  unidadeMedida = "",
  mostrarDatalabels = true,
  // NOVAS PROPS PARA CASAS DECIMAIS
  casasDecimaisDatalabels = 1, // Casas decimais nos rótulos de dados
  casasDecimaisTooltip = 2, // Casas decimais no tooltip
  casasDecimaisEixoY = null, // Casas decimais no eixo Y (null = automático)
  // CONFIGURAÇÕES EXISTENTES
  escalaMin = null,
  escalaMax = null,
  stepSize = null,
  beginAtZero = false,
  tipoEscala = "linear",
  formatoTick = null,
  prefixoLabel = "Etapa",
  tipo = "line",
  className = "",
  altura = "64",
}) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const { valoresEscala, hasValidData } = useChartConfig(dados, {
    escalaMin,
    escalaMax,
    stepSize,
    beginAtZero,
    tipoEscala,
  });

  useEffect(() => {
    if (!hasValidData || !canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    // Criar labels com prefixo personalizado
    const labelsFinal = labels || ChartUtils.gerarLabels(dados, prefixoLabel);

    // Função de formatação personalizada para o eixo Y
    const formatoEixoY =
      casasDecimaisEixoY !== null
        ? function (value) {
            if (value >= 1000) {
              return (value / 1000).toFixed(casasDecimaisEixoY) + "k";
            }
            if (value % 1 === 0) {
              return value.toString();
            }
            return value.toFixed(casasDecimaisEixoY);
          }
        : formatoTick ||
          function (value) {
            if (value >= 1000) {
              return (value / 1000).toFixed(1) + "k";
            }
            if (value % 1 === 0) {
              return value.toString();
            }
            return value.toFixed(1);
          };

    const config = {
      type: tipo,
      data: {
        labels: labelsFinal,
        datasets: [
          {
            label: labelDataset,
            data: dados,
            borderColor: cor,
            backgroundColor:
              tipo === "line"
                ? cor.replace("rgb", "rgba").replace(")", ", 0.1)")
                : cor,
            tension: 0.1,
            fill: tipo === "line",
            borderWidth: 2,
            pointBackgroundColor: cor,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: titulo,
            font: {
              size: 16,
              weight: "bold",
            },
          },
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  // USA AS CASAS DECIMAIS CONFIGURADAS PARA TOOLTIP
                  label += context.parsed.y.toFixed(casasDecimaisTooltip);
                  if (unidadeMedida) {
                    label += ` ${unidadeMedida}`;
                  }
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Etapas",
            },
            grid: {
              display: true,
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
          y: {
            type: tipoEscala,
            beginAtZero: beginAtZero,
            min: valoresEscala.min,
            max: valoresEscala.max,
            title: {
              display: true,
              text: unidadeMedida,
            },
            ticks: {
              stepSize: valoresEscala.step,
              callback: formatoEixoY,
            },
            grid: {
              display: true,
              color: "rgba(0, 0, 0, 0.1)",
            },
          },
        },
        interaction: {
          intersect: false,
          mode: "nearest",
        },
      },
    };

    if (mostrarDatalabels) {
      config.options.plugins.datalabels = {
        display: true,
        color: "#374151",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 4,
        padding: 4,
        font: {
          weight: "bold",
          size: 10,
        },
        // USA AS CASAS DECIMAIS CONFIGURADAS PARA DATALABELS
        formatter: (value) =>
          ChartUtils.formatarValor(value, casasDecimaisDatalabels),
        align: "top",
        anchor: "end",
      };

      config.plugins = [ChartDataLabels];
    }

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [
    dados,
    labels,
    titulo,
    cor,
    labelDataset,
    unidadeMedida,
    mostrarDatalabels,
    hasValidData,
    valoresEscala,
    tipoEscala,
    beginAtZero,
    formatoTick,
    prefixoLabel,
    tipo,
    casasDecimaisDatalabels,
    casasDecimaisTooltip,
    casasDecimaisEixoY,
  ]);

  if (!hasValidData) {
    return (
      <div
        className={`w-full h-${altura} flex items-center justify-center bg-gray-50 rounded-lg ${className}`}
      >
        <div className="text-center text-gray-500">
          <p>Nenhum dado disponível para o gráfico</p>
          <p className="text-sm">"{titulo}"</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-${altura} ${className}`}>
      <canvas ref={canvasRef} />
    </div>
  );
};

/**
 * Componente específico para Brix dos Evaporadores usando Grafico
 */
export const GraficoBrixEvaporadores = ({
  evaporadores,
  className = "",
  altura = "64",
  // Props para casas decimais
  casasDecimaisDatalabels = 1,
  casasDecimaisTooltip = 2,
  casasDecimaisEixoY = 1,
}) => {
  // Extrair dados de Brix dos evaporadores
  const brixData =
    evaporadores?.["Brix Efeitos (º)"] ||
    evaporadores?.["Lista de Brix em cada Efeito"] ||
    [];

  return (
    <Grafico
      dados={brixData}
      titulo="Evolução do Brix nos Evaporadores"
      cor={CORES.brix}
      labelDataset="Brix (°)"
      unidadeMedida="°Brix"
      prefixoLabel="Evap"
      className={className}
      altura={altura}
      mostrarDatalabels={true}
      beginAtZero={false}
      // Passa as configurações de casas decimais
      casasDecimaisDatalabels={casasDecimaisDatalabels}
      casasDecimaisTooltip={casasDecimaisTooltip}
      casasDecimaisEixoY={casasDecimaisEixoY}
    />
  );
};

// Exportação padrão com todos os componentes
const Charts = {
  Grafico,
  GraficoBrixEvaporadores,
  CORES,
  ChartUtils,
};

export default Charts;
