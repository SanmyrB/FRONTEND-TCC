import { useState } from "react";
import { Chart, registerables } from "chart.js";
import {
  Keyboard,
  Info,
  Droplets,
  Clock,
  Scale,
  Thermometer,
  Snail,
  Biohazard,
  Wind,
  Waves,
  Beaker,
  Vegan,
  CakeSlice,
  Percent,
  Candy,
  Shell,
} from "lucide-react";

// Hooks e componentes customizados
import { usePrevAcucarCalculation } from "../hooks/useCalculationAcucar";
import Input from "../components/Input";
import ModalDetalhes from "../components/ModalDetalhes";
import LoadingOverlay from "../components/LoadingOverlay";
import ChartContainer from "../components/ChartContainer";
import ChartWrapper from "../components/ChartWrapper";
import MetricCard from "../components/MetricCard";
import SectionHeader from "../components/SectionHeader";
import FormSection from "../components/FormSection";
import SelectInput from "../components/SelectInput";
import { Grafico, GraficoBrixEvaporadores, CORES } from "../components/Charts";

// Configuração do Chart.js
Chart.register(...registerables);

const PrevAcucar = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState(null);

  // Dados do formulário
  const [dados, setDados] = useState({
    toneladaCana: 9507,
    umidadeBagaço: 52.2,
    fibraCana: 12.29,
    disponibilidadeIndustrial: 100,
    disponibilidadeAgricola: 100,
    disponibilidadeClimatica: 100,
    brixCaldoPrimario: 17.08,
    polCaldoPrimario: 14.21,
    temperaturaCaldoPrimario: 27,
    vazaoCaldoPrimario: 211,
    polCaldo: 16.11,
    brixLodo: 8,
    polFiltrado: 6.2,
    pressaoVapor: 1.5,
    polXarope: 50.05,
    areaEvaporador: "1000",
    brixMelF: 67.92,
    purezMelF: 58.26,
  });

  // Hook de cálculo
  const { listaOriginalEvaporadores, useCalculation } =
    usePrevAcucarCalculation();
  const {
    calculando,
    resultados,
    erro,
    calcularProducao,
    ultimaTemperaturaRegeneradores,
    ultimaTemperaturaTrocadorCalor,
  } = useCalculation(dados);

  const handleInputChange = (campo, valor) => {
    setDados((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleEnviarDados = async () => {
    try {
      await calcularProducao();
      setMenuAberto(false);
    } catch (error) {
      console.error("Erro ao calcular:", error);
    }
  };

  // Opções para o select de evaporadores
  const opcoesEvaporadores = [
    { value: "3500", label: "3500 m²" },
    { value: "2500", label: "2500 m²" },
    { value: "2000", label: "2000 m²" },
    { value: "1000", label: "1000 m²" },
  ];

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <h1 className="text-2xl font-bold mb-4">
        Previsibilidade de Produção de Açúcar
      </h1>
      <h2 className="text-xl mb-6 text-gray-600">
        Insira os dados de interesse para simular o processo de produção de
        açúcar
      </h2>

      <div className="space-y-6">
        {/* Seção de Dados de Entrada */}
        <h1 className="text-2xl font-bold mb-4">Dados de entrada</h1>

        {/* Botão para abrir menu */}
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="rounded-md bg-gray-700 text-gray-50 hover:bg-gray-200 hover:text-gray-800 transition-colors font-bold py-4 px-6 shadow-md duration-300 w-full flex justify-between items-center group"
        >
          <div className="flex items-center space-x-3">
            <Keyboard size={24} className="mr-4 flex items-center" />
            <span className="text-lg">
              Clique para inserir dados de produção
            </span>
          </div>
          <span className="transform transition-transform duration-300 text-white group-hover:text-gray-800">
            {menuAberto ? "▲" : "▼"}
          </span>
        </button>

        {/* Formulário de Dados */}
        {menuAberto && (
          <div className="bg-white w-full rounded-md shadow p-6 border border-gray-800">
            {/* Entrada de Cana */}
            <FormSection title="Entrada de Cana">
              <Input
                label="Tonelada de Cana do dia"
                type="number"
                placeholder="Ex: 9507"
                value={dados.toneladaCana}
                onChange={(e) =>
                  handleInputChange("toneladaCana", e.target.value)
                }
              />
              <Input
                label="Umidade do Bagaço (%)"
                type="number"
                placeholder="Ex: 52,2 %"
                min="0"
                max="100"
                value={dados.umidadeBagaço}
                onChange={(e) =>
                  handleInputChange("umidadeBagaço", e.target.value)
                }
              />
              <Input
                label="Fibra Cana (%)"
                type="number"
                placeholder="Ex: 12,29 %"
                min="0"
                max="100"
                value={dados.fibraCana}
                onChange={(e) => handleInputChange("fibraCana", e.target.value)}
              />
            </FormSection>

            {/* Disponibilidade */}
            <FormSection title="Disponibilidade">
              <Input
                label="Disponibilidade Industrial"
                type="number"
                placeholder="Ex: 100 %"
                min="0"
                max="100"
                value={dados.disponibilidadeIndustrial}
                onChange={(e) =>
                  handleInputChange("disponibilidadeIndustrial", e.target.value)
                }
              />
              <Input
                label="Disponibilidade Agrícola"
                type="number"
                placeholder="Ex: 100 %"
                min="0"
                max="100"
                value={dados.disponibilidadeAgricola}
                onChange={(e) =>
                  handleInputChange("disponibilidadeAgricola", e.target.value)
                }
              />
              <Input
                label="Disponibilidade Climática"
                type="number"
                placeholder="Ex: 100 %"
                min="0"
                max="100"
                value={dados.disponibilidadeClimatica}
                onChange={(e) =>
                  handleInputChange("disponibilidadeClimatica", e.target.value)
                }
              />
            </FormSection>

            {/* Caldo Primário */}
            <FormSection title="Caldo Primário">
              <Input
                label="Brix do Caldo Primário (º)"
                type="number"
                placeholder="Ex: 17,08"
                min="0"
                max="100"
                value={dados.brixCaldoPrimario}
                onChange={(e) =>
                  handleInputChange("brixCaldoPrimario", e.target.value)
                }
              />
              <Input
                label="Pol do Caldo Primário (º)"
                type="number"
                placeholder="Ex: 14,21"
                min="0"
                max="100"
                value={dados.polCaldoPrimario}
                onChange={(e) =>
                  handleInputChange("polCaldoPrimario", e.target.value)
                }
              />
              <Input
                label="Temperatura do Caldo Primário (ºC)"
                type="number"
                placeholder="Ex: 27 (ºC)"
                value={dados.temperaturaCaldoPrimario}
                onChange={(e) =>
                  handleInputChange("temperaturaCaldoPrimario", e.target.value)
                }
              />
            </FormSection>

            {/* Fábrica de Açúcar */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">Fábrica de açúcar</h3>
              <Input
                label="Vazão de Caldo Primário para a Fábrica (m³/h)"
                type="number"
                placeholder="Ex: 211 (m³/h)"
                value={dados.vazaoCaldoPrimario}
                onChange={(e) =>
                  handleInputChange("vazaoCaldoPrimario", e.target.value)
                }
              />
            </div>

            {/* Decantador */}
            <FormSection title="Decantador">
              <Input
                label="Pol do Caldo (º)"
                type="number"
                placeholder="Ex: 16,11"
                min="0"
                max="100"
                value={dados.polCaldo}
                onChange={(e) => handleInputChange("polCaldo", e.target.value)}
              />
              <Input
                label="Brix do Lodo (º)"
                type="number"
                placeholder="Ex: 8"
                min="0"
                max="100"
                value={dados.brixLodo}
                onChange={(e) => handleInputChange("brixLodo", e.target.value)}
              />
              <Input
                label="Pol do Filtrado (º)"
                type="number"
                placeholder="Ex: 6,2"
                value={dados.polFiltrado}
                onChange={(e) =>
                  handleInputChange("polFiltrado", e.target.value)
                }
              />
            </FormSection>

            {/* Evaporadores */}
            <FormSection title="Evaporadores">
              <Input
                label="Pressão do Vapor de Espace (kgf/cm²)"
                type="number"
                placeholder="Ex: 1,5"
                min="0"
                max="100"
                value={dados.pressaoVapor}
                onChange={(e) =>
                  handleInputChange("pressaoVapor", e.target.value)
                }
              />
              <Input
                label="Pol do Xarope Flotado (º)"
                type="number"
                placeholder="Ex: 50,05"
                min="0"
                max="100"
                value={dados.polXarope}
                onChange={(e) => handleInputChange("polXarope", e.target.value)}
              />
              <SelectInput
                label="Escolha a área do evaporador parado:"
                value={dados.areaEvaporador}
                onChange={(e) =>
                  handleInputChange("areaEvaporador", e.target.value)
                }
                options={opcoesEvaporadores}
              />
            </FormSection>

            <div>
              <h3 className="text-lg font-bold mb-4">Cozedores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <Input
                  label="Brix do Mel Final (º)"
                  type="number"
                  placeholder="Ex: 67,92"
                  min="0"
                  max="100"
                  value={dados.brixMelF}
                  onChange={(e) =>
                    handleInputChange("brixMelF", e.target.value)
                  }
                />
                <Input
                  label="Pureza do Mel Final (%)"
                  type="number"
                  placeholder="Ex: 58,26"
                  min="0"
                  max="100"
                  value={dados.purezMelF}
                  onChange={(e) =>
                    handleInputChange("purezMelF", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setMenuAberto(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarDados}
                disabled={calculando}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  calculando
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-gray-700 text-gray-50 hover:bg-gray-200 hover:text-gray-800"
                }`}
              >
                {calculando ? "Calculando..." : "Calcular Produção"}
              </button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {calculando && <LoadingOverlay message="Calculando produção..." />}

        {/* Mensagem de Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">{erro}</div>
            </div>
          </div>
        )}

        {/* Resultados da Simulação */}
        {resultados && (
          <div className="mt-10">
            <h2 className="text-xl font-semibold mb-4">
              Resultados da Simulação
            </h2>

            {/* ===================================== EXTRAÇÃO ===================================== */}
            <div>
              <SectionHeader
                title="Extração"
                onInfoClick={() => setModalAberto("Extração")}
                infoTooltip="Ver detalhes da extração"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard
                  title="Vazão de Caldo Primário"
                  value={
                    resultados.Extracao?.Extração?.[
                      "Vazão de Caldo Primário (m³/h)"
                    ]
                  }
                  unit="m³/h"
                  icon={Vegan}
                />
                <MetricCard
                  title="Disponibilidade"
                  value={
                    resultados.Extracao?.Extração?.["Disponibilidade Geral (h)"]
                  }
                  unit="horas"
                  icon={Clock}
                />
                <MetricCard
                  title="Embebição"
                  value={resultados.Extracao?.Extração?.["Embebição (%)"]}
                  unit="%"
                  icon={Droplets}
                />
                <MetricCard
                  title="Mix p/ Açúcar"
                  value={resultados.Extracao?.Extração?.["Mix p/ Açúcar (%)"]}
                  unit="%"
                  icon={Percent}
                />
              </div>
            </div>

            {/* ===================================== TRATAMENTO ===================================== */}
            <SectionHeader title="Tratamento" />

            {/* ===================================== REGENERADORES ===================================== */}
            <div>
              <SectionHeader
                title="Regeneradores"
                onInfoClick={() => setModalAberto("Regeneradores")}
                infoTooltip="Ver detalhes dos regeneradores"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                <MetricCard
                  title="Velocidade do Caldo"
                  value={
                    resultados.Regeneradores?.Aquecedor?.["Velocidade (m/s)"]
                  }
                  unit="m/s"
                  icon={Snail}
                />
                <MetricCard
                  title="Temperatura de Saída do Regenerador"
                  value={ultimaTemperaturaRegeneradores}
                  unit="ºC"
                  icon={Thermometer}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                <ChartWrapper
                  title="Temperaturas nos Regeneradores"
                  data={
                    resultados.Regeneradores?.Aquecedor?.[
                      "Lista de Temperaturas (ºC)"
                    ]
                  }
                >
                  <Grafico
                    dados={
                      resultados.Regeneradores?.Aquecedor?.[
                        "Lista de Temperaturas (ºC)"
                      ] || []
                    }
                    titulo="Temperaturas nos Regeneradores"
                    cor={CORES.temperatura}
                    labelDataset="Temperatura (°C)"
                    unidadeMedida="°C"
                    mostrarDatalabels={true}
                    prefixoLabel="Reg"
                    escalaMin={20}
                    escalaMax={60}
                    stepSize={10}
                  />
                </ChartWrapper>

                <ChartWrapper
                  title="Perdas de Carga nos Regeneradores"
                  data={
                    resultados.Regeneradores?.Aquecedor?.[
                      "Lista de Perdas (kgf/cm²)"
                    ]
                  }
                >
                  <Grafico
                    dados={
                      resultados.Regeneradores?.Aquecedor?.[
                        "Lista de Perdas (kgf/cm²)"
                      ] || []
                    }
                    labels={[
                      "Inicial",
                      ...(
                        resultados.Regeneradores?.Aquecedor?.[
                          "Lista de Perdas (kgf/cm²)"
                        ]?.slice(1) || []
                      ).map((_, i) => `Reg ${String(i + 1).padStart(2, "0")}`),
                    ]}
                    titulo="Perdas de Carga nos Regeneradores"
                    cor={CORES.perda}
                    labelDataset="Perda (kgf/cm²)"
                    unidadeMedida="kgf/cm²"
                    tipo="bar"
                    beginAtZero={true}
                    escalaMin={0}
                    escalaMax={0.1}
                    casasDecimaisDatalabels={4} // Rótulos: 0.0015, 0.0023, 0.0038
                    casasDecimaisTooltip={4} // Tooltip: 0.001500, 0.002300
                    casasDecimaisEixoY={4}
                  />
                </ChartWrapper>
              </div>
            </div>

            {/* ===================================== SULFITAÇÃO E CALEAÇÃO ===================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
              {/* Sulfitação */}
              <div>
                <SectionHeader
                  title="Sulfitação"
                  onInfoClick={() => setModalAberto("Sulfitacao")}
                  infoTooltip="Ver detalhes da sulfitação"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricCard
                    title="Vazão de Enxofre"
                    value={
                      resultados.Sulfitacao?.Sulfitacao?.[
                        "Vazão de Enxofre (kg/h)"
                      ]
                    }
                    unit="kg/h"
                    icon={Biohazard}
                  />
                  <MetricCard
                    title="Vazão de Oxigênio"
                    value={
                      resultados.Sulfitacao?.Sulfitacao?.[
                        "Vazão de Oxigênio (kg/h)"
                      ]
                    }
                    unit="kg/h"
                    icon={Wind}
                    precision={2}
                  />
                </div>
              </div>

              {/* Caleação */}
              <div>
                <SectionHeader
                  title="Caleação"
                  onInfoClick={() => setModalAberto("Caleacao")}
                  infoTooltip="Ver detalhes da caleação"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricCard
                    title="Vazão de Cal"
                    value={
                      resultados.Caleacao?.Caleacao?.["Vazão de Cal (kg/h)"]
                    }
                    unit="kg/h"
                    icon={Beaker}
                  />
                  <MetricCard
                    title="Vazão de Água"
                    value={
                      resultados.Caleacao?.Caleacao?.["Vazão de Água (kg/h)"]
                    }
                    unit="kg/h"
                    icon={Waves}
                    precision={2}
                  />
                </div>
              </div>
            </div>

            {/* ===================================== TROCADOR DE CALOR ===================================== */}
            <div>
              <SectionHeader
                title="Trocador de Calor"
                onInfoClick={() => setModalAberto("TrocadorCalor")}
                infoTooltip="Ver detalhes do trocador de calor"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                <MetricCard
                  title="Velocidade do Caldo"
                  value={
                    resultados.TrocadorCalor?.TrocadorCalor?.[
                      "Velocidade (m/s)"
                    ]
                  }
                  unit="m/s"
                  icon={Snail}
                />
                <MetricCard
                  title="Temperatura de Saída"
                  value={ultimaTemperaturaTrocadorCalor}
                  unit="ºC"
                  icon={Thermometer}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                <ChartWrapper
                  title="Temperaturas no Trocador de Calor"
                  data={
                    resultados.TrocadorCalor?.TrocadorCalor?.[
                      "Lista de Temperaturas (ºC)"
                    ]
                  }
                >
                  <Grafico
                    dados={
                      resultados.TrocadorCalor?.TrocadorCalor?.[
                        "Lista de Temperaturas (ºC)"
                      ] || []
                    }
                    titulo="Temperaturas no Trocador de Calor"
                    cor={CORES.temperatura}
                    labelDataset="Temperatura (°C)"
                    unidadeMedida="°C"
                    mostrarDatalabels={true}
                    prefixoLabel="TC"
                    escalaMin={40}
                    escalaMax={130}
                    stepSize={10}
                  />
                </ChartWrapper>

                <ChartWrapper
                  title="Perdas de Carga no Trocador de Calor"
                  data={
                    resultados.TrocadorCalor?.TrocadorCalor?.[
                      "Lista de Perdas (kgf/cm²)"
                    ]
                  }
                >
                  <Grafico
                    dados={
                      resultados.TrocadorCalor?.TrocadorCalor?.[
                        "Lista de Perdas (kgf/cm²)"
                      ] || []
                    }
                    labels={[
                      "Inicial",
                      ...(
                        resultados.TrocadorCalor?.TrocadorCalor?.[
                          "Lista de Perdas (kgf/cm²)"
                        ]?.slice(1) || []
                      ).map((_, i) => `TC ${String(i + 1).padStart(2, "0")}`),
                    ]}
                    titulo="Perdas de Carga no Trocador de Calor"
                    cor={CORES.perda}
                    labelDataset="Perda (kgf/cm²)"
                    unidadeMedida="kgf/cm²"
                    tipo="bar"
                    beginAtZero={true}
                    escalaMin={0}
                    escalaMax={0.2}
                    casasDecimaisDatalabels={4} // Rótulos: 0.0015, 0.0023, 0.0038
                    casasDecimaisTooltip={4} // Tooltip: 0.001500, 0.002300
                    casasDecimaisEixoY={4}
                  />
                </ChartWrapper>
              </div>
            </div>

            {/* ===================================== BALÃO FLASH E DECANTADOR ===================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
              {/* Balão Flash */}
              <div>
                <SectionHeader
                  title="Balão Flash"
                  onInfoClick={() => setModalAberto("Flash")}
                  infoTooltip="Ver detalhes do balão flash"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricCard
                    title="Brix do Caldo"
                    value={
                      resultados.Flash?.["Balao Flash"]?.[
                        "Brix de Saída do Balão Flash (º)"
                      ]
                    }
                    unit="º Brix"
                    icon={Scale}
                    precision={2}
                  />
                  <MetricCard
                    title="Vazão do Caldo"
                    value={
                      resultados.Flash?.["Balao Flash"]?.[
                        "Vazão de Saída do Balão Flash (m³/h)"
                      ]
                    }
                    unit="m³/h"
                    icon={Vegan}
                    precision={2}
                  />
                </div>
              </div>

              {/* Decantador */}
              <div>
                <SectionHeader
                  title="Decantador"
                  onInfoClick={() => setModalAberto("Decantador")}
                  infoTooltip="Ver detalhes do decantador"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricCard
                    title="Brix do Caldo"
                    value={
                      resultados.Decantador?.Decantador?.[
                        "Brix do Caldo na Saída do Decantador (º)"
                      ]
                    }
                    unit="º Brix"
                    icon={Scale}
                    precision={2}
                  />
                  <MetricCard
                    title="Vazão do Caldo"
                    value={
                      resultados.Decantador?.Decantador?.[
                        "Vazão de Caldo na Saída do Decantador (m³/h)"
                      ]
                    }
                    unit="m³/h"
                    icon={Vegan}
                    precision={2}
                  />
                </div>
              </div>
            </div>

            {/* ===================================== FILTRO PRENSA ===================================== */}
            <div>
              <SectionHeader
                title="Filtro Prensa"
                onInfoClick={() => setModalAberto("FiltroPrensa")}
                infoTooltip="Ver detalhes do filtro prensa"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <MetricCard
                  title="Brix do Filtrado"
                  value={
                    resultados.FiltroPrensa?.["Filtro Prensa"]?.[
                      "Brix do Filtrado (º)"
                    ]
                  }
                  unit="º Brix"
                  icon={Scale}
                  precision={2}
                />
                <MetricCard
                  title="Vazão de Torta"
                  value={
                    resultados.FiltroPrensa?.["Filtro Prensa"]?.[
                      "Massa da Torta (ton/h)"
                    ]
                  }
                  unit="ton/h"
                  icon={CakeSlice}
                  precision={2}
                />
                <MetricCard
                  title="Vazão de Filtrado"
                  value={
                    resultados.FiltroPrensa?.["Filtro Prensa"]?.[
                      "Vazão de Filtrado (m³/h)"
                    ]
                  }
                  unit="m³/h"
                  icon={Vegan}
                  precision={2}
                />
              </div>
            </div>

            {/* ===================================== EVAPORADORES ===================================== */}
            <div>
              <SectionHeader
                title="Evaporadores"
                onInfoClick={() => setModalAberto("Evaporadores")}
                infoTooltip="Ver detalhes dos evaporadores"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <MetricCard
                  title="Vazão de Xarope"
                  value={
                    Array.isArray(
                      resultados.Evaporadores?.Evaporadores?.[
                        "Vazão de Caldo em Cada Efeito (kg/h)"
                      ]
                    )
                      ? resultados.Evaporadores.Evaporadores[
                          "Vazão de Caldo em Cada Efeito (kg/h)"
                        ][
                          resultados.Evaporadores.Evaporadores[
                            "Vazão de Caldo em Cada Efeito (kg/h)"
                          ].length - 1
                        ]
                      : resultados.Evaporadores?.Evaporadores?.[
                          "Vazão de Caldo em Cada Efeito (kg/h)"
                        ]
                  }
                  unit="ton/h"
                  icon={Vegan}
                  precision={2}
                />
                <MetricCard
                  title="Brix de Xarope Flotado"
                  value={
                    resultados.Evaporadores?.Evaporadores?.["Brix Final (º)"]
                  }
                  unit="º Brix"
                  icon={Scale}
                  precision={2}
                />
                <MetricCard
                  title="Injeção de Vapor VE"
                  value={
                    resultados.Evaporadores?.Evaporadores?.[
                      "Injeção de Vapor VE (ton/h)"
                    ]
                  }
                  unit="ton/h"
                  icon={Wind}
                  precision={2}
                />
              </div>

              {/* Gráfico de Brix dos Evaporadores */}
              <ChartContainer className="mb-8">
                <GraficoBrixEvaporadores
                  evaporadores={resultados.Evaporadores?.Evaporadores || {}}
                />
              </ChartContainer>

              {/* Gráficos dos Evaporadores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                <ChartWrapper
                  title="Temperaturas nos Evaporadores"
                  data={
                    resultados.Evaporadores?.Evaporadores?.[
                      "Lista de Temperatura em cada Efeito (ºC)"
                    ]
                  }
                >
                  <Grafico
                    dados={
                      resultados.Evaporadores?.Evaporadores?.[
                        "Lista de Temperatura em cada Efeito (ºC)"
                      ] || []
                    }
                    labels={[
                      "Inicial",
                      ...(
                        resultados.Evaporadores?.Evaporadores?.[
                          "Lista de Temperatura em cada Efeito (ºC)"
                        ]?.slice(1) || []
                      ).map((_, i) => `Evap ${String(i + 1).padStart(2, "0")}`),
                    ]}
                    titulo="Temperaturas nos Evaporadores"
                    cor={CORES.temperatura}
                    labelDataset="Temperatura (°C)"
                    unidadeMedida="°C"
                    mostrarDatalabels={true}
                    prefixoLabel="Evap"
                  />
                </ChartWrapper>

                <ChartWrapper
                  title="Vazões de Caldo nos Evaporadores"
                  data={
                    resultados.Evaporadores?.Evaporadores?.[
                      "Vazão de Caldo em Cada Efeito (kg/h)"
                    ]
                  }
                >
                  <Grafico
                    dados={
                      resultados.Evaporadores?.Evaporadores?.[
                        "Vazão de Caldo em Cada Efeito (kg/h)"
                      ] || []
                    }
                    labels={[
                      "Inicial",
                      ...(
                        resultados.Evaporadores?.Evaporadores?.[
                          "Vazão de Caldo em Cada Efeito (kg/h)"
                        ]?.slice(1) || []
                      ).map((_, i) => `Evap ${String(i + 1).padStart(2, "0")}`),
                    ]}
                    titulo="Vazões de Caldo nos Evaporadores"
                    cor={CORES.vazao}
                    labelDataset="Vazão (ton/h)"
                    unidadeMedida="ton/h"
                    mostrarDatalabels={true}
                    prefixoLabel="Evap"
                  />
                </ChartWrapper>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
                <ChartWrapper
                  title="Entrada de Vapor em cada Efeito"
                  data={
                    resultados.Evaporadores?.Evaporadores?.[
                      "Lista Vapor Entrada por Efeito (kg/h)"
                    ]
                  }
                >
                  <Grafico
                    dados={
                      resultados.Evaporadores?.Evaporadores?.[
                        "Lista Vapor Entrada por Efeito (kg/h)"
                      ] || []
                    }
                    labels={(
                      resultados.Evaporadores?.Evaporadores?.[
                        "Lista Vapor Entrada por Efeito (kg/h)"
                      ] || []
                    ).map((_, i) => `Evap ${i + 1}`)}
                    titulo="Entrada de Vapor em cada Efeito"
                    cor={CORES.vapor}
                    labelDataset="Vapor (ton/h)"
                    unidadeMedida="ton/h"
                    tipo="bar"
                    beginAtZero={true}
                  />
                </ChartWrapper>

                <ChartWrapper
                  title="Sangria por Evaporador"
                  data={
                    resultados.Evaporadores?.Evaporadores?.[
                      "Lista de Sangrias em cada efeito (kg/h)"
                    ]
                  }
                >
                  <Grafico
                    dados={
                      resultados.Evaporadores?.Evaporadores?.[
                        "Lista de Sangrias em cada efeito (kg/h)"
                      ] || []
                    }
                    labels={(
                      resultados.Evaporadores?.Evaporadores?.[
                        "Lista de Sangrias em cada efeito (kg/h)"
                      ] || []
                    ).map((_, i) => `Evap ${i + 1}`)}
                    titulo="Sangria por Evaporador"
                    cor={CORES.perda}
                    labelDataset="Sangria (ton/h)"
                    unidadeMedida="ton/h"
                    tipo="bar"
                    beginAtZero={true}
                  />
                </ChartWrapper>
              </div>
            </div>

            {/* ===================================== COZEDORES ===================================== */}
            <div>
              <SectionHeader
                title="Produção de Açúcar"
                onInfoClick={() => setModalAberto("Cozedores")}
                infoTooltip="Ver detalhes dos cozedores"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <MetricCard
                  title="Sacas Produzidas"
                  value={resultados.Cozedores?.Cozedores?.["Total de Sacas"]}
                  icon={Candy}
                  unit="sacas"
                  precision={0}
                />

                <MetricCard
                  title="SJM"
                  value={resultados.Cozedores?.Cozedores?.["SJM (%)"]}
                  icon={Percent}
                  unit="%"
                  precision={0}
                />

                <MetricCard
                  title="Vazão de Mel Final"
                  value={
                    resultados.Cozedores?.Cozedores?.["Vazão de Mel Final"]
                  }
                  icon={Shell}
                  unit="ton/h"
                  precision={0}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modais */}
        {modalAberto === "Extração" && (
          <ModalDetalhes
            titulo="Detalhes da Extração"
            dados={resultados?.Extracao?.Extração}
            onClose={() => setModalAberto(null)}
          />
        )}

        {modalAberto === "Evaporadores" && (
          <ModalDetalhes
            titulo="Detalhes dos Evaporadores"
            dados={resultados?.Evaporadores?.Evaporadores}
            onClose={() => setModalAberto(null)}
          />
        )}

        {modalAberto === "Flash" && (
          <ModalDetalhes
            titulo="Detalhes do Balão Flash"
            dados={resultados?.Flash?.["Balao Flash"]}
            onClose={() => setModalAberto(null)}
          />
        )}

        {modalAberto === "Decantador" && (
          <ModalDetalhes
            titulo="Detalhes do Decantador"
            dados={resultados?.Decantador?.Decantador}
            onClose={() => setModalAberto(null)}
          />
        )}

        {modalAberto === "Regeneradores" && (
          <ModalDetalhes
            titulo="Detalhes dos Regeneradores"
            dados={resultados?.Regeneradores?.Aquecedor}
            onClose={() => setModalAberto(null)}
          />
        )}

        {modalAberto === "TrocadorCalor" && (
          <ModalDetalhes
            titulo="Detalhes dos Trocadores de Calor"
            dados={resultados?.TrocadorCalor?.TrocadorCalor}
            onClose={() => setModalAberto(null)}
          />
        )}

        {modalAberto === "Sulfitacao" && (
          <ModalDetalhes
            titulo="Detalhes da Sulfitação"
            dados={resultados?.Sulfitacao?.Sulfitacao}
            onClose={() => setModalAberto(null)}
          />
        )}

        {modalAberto === "Caleacao" && (
          <ModalDetalhes
            titulo="Detalhes da Caleação"
            dados={resultados?.Caleacao?.Caleacao}
            onClose={() => setModalAberto(null)}
          />
        )}

        {modalAberto === "FiltroPrensa" && (
          <ModalDetalhes
            titulo="Detalhes do Filtro Prensa"
            dados={resultados?.FiltroPrensa?.["Filtro Prensa"]}
            onClose={() => setModalAberto(null)}
          />
        )}
        {modalAberto === "Cozedores" && (
          <ModalDetalhes
            titulo="Detalhes dos Cozedores"
            dados={resultados?.Cozedores?.Cozedores}
            onClose={() => setModalAberto(null)}
          />
        )}
      </div>
    </div>
  );
};

export default PrevAcucar;
