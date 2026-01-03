import { useState } from "react";
import * as PrevLibVap from "../assets/Library/PrevVapLib";
import * as PrevLib from "../assets/Library/PrevAcucarLib";

export const usePrevVapCalculation = (dados) => {
  const [calculando, setCalculando] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [erro, setErro] = useState(null);

  const validarDados = () => {
    const camposObrigatorios = [
      "toneladaCana",
      "umidadeBagaço",
      "fibraCana",
      "disponibilidadeIndustrial",
      "disponibilidadeAgricola",
      "disponibilidadeClimatica",
      "vazBagacoCald3",
      "vazBagacoCald4",
    ];

    for (const campo of camposObrigatorios) {
      if (!dados[campo] && dados[campo] !== 0) {
        throw new Error(`Campo obrigatório não preenchido: ${campo}`);
      }
    }

    // Validações específicas
    if (
      parseFloat(dados.umidadeBagaço) < 0 ||
      parseFloat(dados.umidadeBagaço) > 100
    ) {
      throw new Error("Umidade do bagaço deve estar entre 0% e 100%");
    }

    if (parseFloat(dados.fibraCana) < 0 || parseFloat(dados.fibraCana) > 100) {
      throw new Error("Fibra da cana deve estar entre 0% e 100%");
    }

    return true;
  };

  const calcularProducao = async () => {
    setCalculando(true);
    setErro(null);

    try {
      // Validação dos dados
      validarDados();

      // =============== CÁLCULO DA EXTRAÇÃO ===============
      // Usar a mesma lógica de extração do PrevAcucarLib
      const Extracao = PrevLib.calcularMoenda({
        ton_cana_dia: parseFloat(dados.toneladaCana),
        disponi_agric: parseFloat(dados.disponibilidadeAgricola),
        disponi_clim: parseFloat(dados.disponibilidadeClimatica),
        disponi_indust: parseFloat(dados.disponibilidadeIndustrial),
        umid_bag: parseFloat(dados.umidadeBagaço),
        brix_prim: 17,
        pol_prim: 16,
        fibra_cana: parseFloat(dados.fibraCana),
        vazCaldoFab: 211,
      });

      // =============== CÁLCULO DOS PODERES CALORÍFICOS ===============
      const PoderesCalorificos = PrevLibVap.calPoderesCalorificos({
        umidade_pct: parseFloat(dados.umidadeBagaço),
      });

      // =============== CÁLCULO DO VAPOR E ELETRICIDADE PARA CALDEIRA 3 ===============
      const VaporEletricidadeCald1 = PrevLibVap.calVaporEletricidade({
        umidade_pct: parseFloat(dados.umidadeBagaço),
        vazBagaco: parseFloat(dados.vazBagacoCald3),
        efiCaldeira: 53.1, // Exemplo, ajustar conforme necessário
        DELTA_H_MJ_KG: 2.936, // Exemplo
      });

      // =============== CÁLCULO DO VAPOR E ELETRICIDADE PARA CALDEIRA 4 ===============
      const VaporEletricidadeCald2 = PrevLibVap.calVaporEletricidade({
        umidade_pct: parseFloat(dados.umidadeBagaço),
        vazBagaco: parseFloat(dados.vazBagacoCald4),
        efiCaldeira: 58.74,
        DELTA_H_MJ_KG: 2.936,
      });

      // =============== CONSOLIDAR RESULTADOS ===============
      const resultadosConsolidados = {
        Extracao,
        PoderesCalorificos,
        VaporEletricidadeCald1,
        VaporEletricidadeCald2,
      };

      setResultados(resultadosConsolidados);
      return resultadosConsolidados;
    } catch (error) {
      console.error("Erro ao calcular produção:", error);
      const mensagemErro =
        error.message ||
        "Erro ao calcular produção. Verifique os dados inseridos.";
      setErro(mensagemErro);
      throw error;
    } finally {
      setCalculando(false);
    }
  };

  return {
    calculando,
    resultados,
    erro,
    calcularProducao,
  };
};

export default usePrevVapCalculation;
