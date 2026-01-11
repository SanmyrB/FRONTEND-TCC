import { useState, useRef } from "react";
import { useCalculation } from "./useCalculationAcucar";
import * as PrevDestLib from "../assets/Library/PrevDestLib";

// Hook para uso específico do componente Dest (sem filtro de evaporadores e com destilação)
export const useCalculationDest = (dados) => {
  const listaPadraoEvaporadores = [3500, 2500, 2000, 2000, 1000, 1000]; // Lista padrão sem filtro

  // Usa o useCalculation com filtrarEvaporadores=false
  const calculationHook = useCalculation(dados, listaPadraoEvaporadores, false);

  // Ref para armazenar resultados atualizados
  const resultadosRef = useRef(null);
  resultadosRef.current = calculationHook.resultados;

  // Estados para destilação
  const [resultadosDestilacao, setResultadosDestilacao] = useState(null);
  const [calculandoDestilacao, setCalculandoDestilacao] = useState(false);
  const [erroDestilacao, setErroDestilacao] = useState(null);

  // Função para calcular destilação baseada nos resultados da produção de açúcar
  const calcularDestilacao = async (resultadosProducao) => {
    setCalculandoDestilacao(true);
    setErroDestilacao(null);

    try {
      const resultados = resultadosProducao || resultadosRef.current;
      console.log(
        "Resultados da produção de açúcar (passados ou via ref):",
        resultados
      );

      if (!resultados) {
        throw new Error(
          "Resultados da produção de açúcar não disponíveis. Execute calcularProducao primeiro."
        );
      }

      const { Extracao, Cozedores, FiltroPrensa } = resultados;

      // =============== CÁLCULO DO TANQUE DE MISTURA ===============
      const TanqueMistura = PrevDestLib.tanqMistura({
        vazEntrada:
          Extracao?.Extração?.["Vazão de Caldo Primário (m³/h)"] -
          dados.vazaoCaldoPrimario,
        brixEntrada: dados.brixCaldoPrimario,
        polEntrada: dados.polCaldoPrimario,
        vazMel: resultados.Cozedores?.Cozedores?.["Vazão de Mel Final"],
        brixMel: dados.brixMelF,
        purMel: dados.purezMelF,
        vazFiltrado:
          resultados.FiltroPrensa?.["Filtro Prensa"]?.[
            "Vazão de Filtrado (m³/h)"
          ],
        brixFiltrado:
          resultados.FiltroPrensa?.["Filtro Prensa"]?.["Brix do Filtrado (º)"],
        polFiltrado: dados.polFiltrado,
      });

      // =============== CÁLCULO DA FERMENTAÇÃO ===============
      const Fermentacao = PrevDestLib.calFermentacao({
        vazMosto: TanqueMistura?.TanqueMistura?.vazMosto_ton_real,
        brixMosto: TanqueMistura?.TanqueMistura?.brixMosto_real,
        purMosto: TanqueMistura?.TanqueMistura?.purezMosto,
        converFermentacao: 0.85, // Valor padrão
      });

      // =============== CÁLCULO DA DESTILAÇÃO ===============
      const Destilacao = PrevDestLib.sistemaDestilacaoEtanolFundo(
        Fermentacao.Fermentacao.vazDorna_L / 1000, // Vazão do vinho
        Fermentacao.Fermentacao.frac_et, // Fração de etanol
        0.94, // Frac topo AA1 Vap (exemplo)
        0.05, // Frac topo AA1 Liq (exemplo)
        0.02, // Frac fundo D (exemplo),
        parseFloat(dados.disponibilidadeAgricola),
        parseFloat(dados.disponibilidadeClimatica),
        parseFloat(dados.disponibilidadeIndustrial)
      );

      // Consolidar resultados da destilação
      const resultadosDestilacaoConsolidados = {
        TanqueMistura,
        Fermentacao,
        Destilacao,
      };

      setResultadosDestilacao(resultadosDestilacaoConsolidados);
      return resultadosDestilacaoConsolidados;
    } catch (error) {
      console.error("Erro ao calcular destilação:", error);
      const mensagemErro =
        error.message || "Erro ao calcular destilação. Verifique os dados.";
      setErroDestilacao(mensagemErro);
      throw error;
    } finally {
      setCalculandoDestilacao(false);
    }
  };

  const limparResultadosDestilacao = () => {
    setResultadosDestilacao(null);
    setErroDestilacao(null);
  };

  return {
    // Retorna tudo do useCalculation
    ...calculationHook,
    // Adiciona estados e funções da destilação
    resultadosDestilacao,
    calculandoDestilacao,
    erroDestilacao,
    calcularDestilacao,
    limparResultadosDestilacao,
    // Utilitários
    hasResultadosDestilacao: !!resultadosDestilacao,
    isValidCalculationDestilacao: !erroDestilacao && !!resultadosDestilacao,
  };
};

export default useCalculationDest;
