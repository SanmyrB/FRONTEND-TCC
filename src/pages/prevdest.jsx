import { useState } from "react";
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
  BadgePlus,
} from "lucide-react";

// Hooks e componentes customizados
import useCalculationDest from "../hooks/useCalculationDest";
import Input from "../components/Input";
import ModalDetalhes from "../components/ModalDetalhes";
import LoadingOverlay from "../components/LoadingOverlay";
import ChartContainer from "../components/ChartContainer";
import ChartWrapper from "../components/ChartWrapper";
import MetricCard from "../components/MetricCard";
import SectionHeader from "../components/SectionHeader";
import FormSection from "../components/FormSection";
import SelectInput from "../components/SelectInput";

const PrevDest = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState(null);

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
    brixMelF: 67.92,
    purezMelF: 58.26,
  });

  const {
    calculando,
    resultados,
    erro,
    calcularProducao,
    resultadosDestilacao,
    calculandoDestilacao,
    erroDestilacao,
    calcularDestilacao,
  } = useCalculationDest(dados);

  const handleInputChange = (campo, valor) => {
    setDados((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };
  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4">
        Previsibilidade da Produção de Álcool
      </h1>
      <h2 className="text-xl mb-6 text-gray-600">
        Insira os dados de interesse para prever a produção de álcool
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
            <div>
              <h3 className="text-lg font-bold mb-4">Evaporadores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
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
                  onChange={(e) =>
                    handleInputChange("polXarope", e.target.value)
                  }
                />
              </div>
            </div>

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
                onClick={async () => {
                  try {
                    const resultadosProducao = await calcularProducao();
                    await calcularDestilacao(resultadosProducao);
                  } catch (error) {
                    console.error("Erro ao calcular:", error);
                  }
                  setMenuAberto(false);
                }}
                disabled={calculando || calculandoDestilacao}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  calculando || calculandoDestilacao
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-gray-700 text-gray-50 hover:bg-gray-200 hover:text-gray-800"
                }`}
              >
                {calculando || calculandoDestilacao
                  ? "Calculando..."
                  : "Calcular Produção e Destilação"}
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
        {erroDestilacao && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">{erroDestilacao}</div>
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
                  title="Vazão de Caldo Primário p/ Destilaria"
                  value={
                    resultados.Extracao?.Extração?.[
                      "Vazão de Caldo Primário (m³/h)"
                    ] - dados.vazaoCaldoPrimario
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
            <div>
              <SectionHeader
                title="Tanque de Mistura"
                onInfoClick={() => setModalAberto("TanqueMistura")}
                infoTooltip="Ver detalhes da Tanque de Mistura"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <MetricCard
                  title="Vazão de Mosto"
                  value={
                    resultadosDestilacao?.TanqueMistura?.TanqueMistura
                      ?.vazMosto_M || 0
                  }
                  unit="m³/h"
                  icon={Droplets}
                />
                <MetricCard
                  title="Brix do Mosto pré Diluição"
                  value={
                    resultadosDestilacao?.TanqueMistura?.TanqueMistura
                      ?.brixMosto_pD || 0
                  }
                  unit="º"
                  icon={Beaker}
                />
                <MetricCard
                  title="Pureza do Mosto"
                  value={
                    resultadosDestilacao?.TanqueMistura?.TanqueMistura
                      ?.purezMosto || 0
                  }
                  unit="%"
                  icon={BadgePlus}
                />
              </div>
            </div>
            <div>
              <SectionHeader
                title="Fermentação"
                onInfoClick={() => setModalAberto("Fermentacao")}
                infoTooltip="Ver detalhes da Fermentação"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <MetricCard
                  title="Vazão de Mosto"
                  value={
                    resultadosDestilacao?.Fermentacao?.Fermentacao?.vazDorna_L /
                      1000 || 0
                  }
                  unit="m³/h"
                  icon={Droplets}
                />
                <MetricCard
                  title="Vazão de Etanol Disponível"
                  value={
                    resultadosDestilacao?.Fermentacao?.Fermentacao?.vazEt_L /
                      1000 || 0
                  }
                  unit="m³/h"
                  icon={Beaker}
                />
                <MetricCard
                  title="GLº do Mosto"
                  value={
                    resultadosDestilacao?.Fermentacao?.Fermentacao?.GL || 0
                  }
                  unit="º"
                  icon={BadgePlus}
                />
              </div>
            </div>
            <div>
              <SectionHeader
                title="Destilação"
                onInfoClick={() => setModalAberto("Destilacao")}
                infoTooltip="Ver detalhes da Destilação"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"></div>
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
        {modalAberto === "TanqueMistura" && (
          <ModalDetalhes
            titulo="Detalhes do Tanque de Mistura"
            dados={resultadosDestilacao?.TanqueMistura?.TanqueMistura}
            onClose={() => setModalAberto(null)}
          />
        )}
        {modalAberto === "Fermentacao" && (
          <ModalDetalhes
            titulo="Detalhes da Fermentação"
            dados={resultadosDestilacao?.Fermentacao?.Fermentacao}
            onClose={() => setModalAberto(null)}
          />
        )}
        {modalAberto === "Destilacao" && (
          <ModalDetalhes
            titulo="Detalhes da Destilacao"
            dados={resultadosDestilacao?.Destilacao?.Destilacao}
            onClose={() => setModalAberto(null)}
          />
        )}
      </div>
    </div>
  );
};

export default PrevDest;
