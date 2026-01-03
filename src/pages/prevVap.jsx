import { useState } from "react";

import {
  Keyboard,
  Droplets,
  Clock,
  Vegan,
  BatteryCharging,
  UtilityPole,
} from "lucide-react";

import Input from "../components/Input";
import ModalDetalhes from "../components/ModalDetalhes";
import LoadingOverlay from "../components/LoadingOverlay";
import ChartContainer from "../components/ChartContainer";
import ChartWrapper from "../components/ChartWrapper";
import MetricCard from "../components/MetricCard";
import SectionHeader from "../components/SectionHeader";
import FormSection from "../components/FormSection";
import SelectInput from "../components/SelectInput";

import { usePrevVapCalculation } from "../hooks/useCalculationCald";

const FabVap = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalAberto, setModalAberto] = useState(null);

  const [dados, setDados] = useState({
    toneladaCana: 9507,
    umidadeBagaço: 52.2,
    fibraCana: 12.29,
    disponibilidadeIndustrial: 100,
    disponibilidadeAgricola: 100,
    disponibilidadeClimatica: 100,
    vazBagacoCald3: 46.35,
    vazBagacoCald4: 46.35,
  });

  const { calculando, resultados, erro, calcularProducao } =
    usePrevVapCalculation(dados);

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

  return (
    <div className="p-6 relative">
      <h1 className="text-2xl font-bold mb-4">
        Previsibilidade da Produção de Vapor e Eletricidade
      </h1>
      <h2 className="text-xl mb-6 text-gray-600">
        Sistema os dados de interesse para prever a produção de vapor e
        eletricidade
      </h2>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold mb-4">Dados de entrada</h1>
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

        {menuAberto && (
          <div className="bg-white w-full rounded-md shadow p-6 border border-gray-800">
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
            <div>
              <h3 className="text-lg font-bold mb-4">Caldeiras</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <Input
                  label="Vazão de Bagaço para a Caldeira 1 (ton/h)"
                  type="number"
                  placeholder="Ex: 46,35"
                  min="0"
                  max="100"
                  value={dados.vazBagacoCald3}
                  onChange={(e) =>
                    handleInputChange("vazBagacoCald3", e.target.value)
                  }
                />
                <Input
                  label="Vazão de Bagaço para a Caldeira 2 (ton/h)"
                  type="number"
                  placeholder="Ex: 46,35"
                  min="0"
                  max="100"
                  value={dados.vazBagacoCald4}
                  onChange={(e) =>
                    handleInputChange("vazBagacoCald4", e.target.value)
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <MetricCard
                  title="Vazão de Bagaço Disponível"
                  value={
                    resultados.Extracao?.Extração?.["Vazão de Bagaço (ton/h)"]
                  }
                  unit="ton/h"
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
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
              {/* Caldeira 3 */}
              <div>
                <SectionHeader
                  title="Caldeira 1"
                  onInfoClick={() => setModalAberto("Caldeira1")}
                  infoTooltip="Ver detalhes da Caldeira 1"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricCard
                    title="Energia gerada - Cogeração"
                    value={
                      resultados.VaporEletricidadeCald1?.Caldeira
                        ?.potEletricaCogeracao
                    }
                    unit="MW"
                    icon={BatteryCharging}
                  />
                  <MetricCard
                    title="Energia gerada - Condensação"
                    value={
                      resultados.VaporEletricidadeCald1?.Caldeira
                        ?.potEletricaCondensacao
                    }
                    unit="MW"
                    icon={UtilityPole}
                    precision={2}
                  />
                </div>
              </div>

              {/* Caldeira 4 */}
              <div>
                <SectionHeader
                  title="Caldeira 2"
                  onInfoClick={() => setModalAberto("Caldeira2")}
                  infoTooltip="Ver detalhes da Caldeira 2"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MetricCard
                    title="Energia gerada - Cogeração"
                    value={
                      resultados.VaporEletricidadeCald2?.Caldeira
                        ?.potEletricaCogeracao
                    }
                    unit="MW"
                    icon={BatteryCharging}
                  />
                  <MetricCard
                    title="Energia gerada - Condensação"
                    value={
                      resultados.VaporEletricidadeCald2?.Caldeira
                        ?.potEletricaCondensacao
                    }
                    unit="MW"
                    icon={UtilityPole}
                    precision={2}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {modalAberto === "Extração" && (
          <ModalDetalhes
            titulo="Detalhes da Extração"
            dados={resultados?.Extracao?.Extração}
            onClose={() => setModalAberto(null)}
          />
        )}

        {modalAberto === "Caldeira1" && (
          <ModalDetalhes
            titulo="Detalhes da Caldeira 1"
            dados={resultados?.VaporEletricidadeCald1?.Caldeira}
            onClose={() => setModalAberto(null)}
          />
        )}

        {modalAberto === "Caldeira2" && (
          <ModalDetalhes
            titulo="Detalhes da Caldeira 2"
            dados={resultados?.VaporEletricidadeCald2?.Caldeira}
            onClose={() => setModalAberto(null)}
          />
        )}
      </div>
    </div>
  );
};

export default FabVap;
