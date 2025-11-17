import { useState } from "react";
import * as PrevLib from "../assets/Library/PrevAcucarLib";

// Função para filtrar a lista de evaporadores
const filtrarListaEvaporadores = (listaOriginal, valorParaRemover) => {
  const valorNumerico = parseInt(valorParaRemover);
  const novaLista = [...listaOriginal];

  const indexParaRemover = novaLista.findIndex(
    (area) => area === valorNumerico
  );

  if (indexParaRemover !== -1) {
    novaLista.splice(indexParaRemover, 1);
  }

  return novaLista;
};

export const useCalculation = (dados, listaOriginalEvaporadores) => {
  const [calculando, setCalculando] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [listaEvaporadoresFiltrada, setListaEvaporadoresFiltrada] = useState([
    ...listaOriginalEvaporadores,
  ]);
  const [ultimaTemperaturaRegeneradores, setUltimaTemperaturaRegeneradores] =
    useState(null);
  const [ultimaTemperaturaTrocadorCalor, setUltimaTemperaturaTrocadorCalor] =
    useState(null);
  const [erro, setErro] = useState(null);

  const validarDados = () => {
    const camposObrigatorios = [
      "toneladaCana",
      "umidadeBagaço",
      "fibraCana",
      "disponibilidadeIndustrial",
      "disponibilidadeAgricola",
      "disponibilidadeClimatica",
      "brixCaldoPrimario",
      "polCaldoPrimario",
      "temperaturaCaldoPrimario",
      "vazaoCaldoPrimario",
      "polCaldo",
      "brixLodo",
      "polFiltrado",
      "pressaoVapor",
      "polXarope",
      "areaEvaporador",
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

      // Filtrar lista de evaporadores
      const listaFiltrada = filtrarListaEvaporadores(
        listaOriginalEvaporadores,
        dados.areaEvaporador
      );
      setListaEvaporadoresFiltrada(listaFiltrada);

      // =============== CÁLCULO DA EXTRAÇÃO ===============
      const Extracao = PrevLib.calcularMoenda({
        ton_cana_dia: parseFloat(dados.toneladaCana),
        disponi_agric: parseFloat(dados.disponibilidadeAgricola),
        disponi_clim: parseFloat(dados.disponibilidadeClimatica),
        disponi_indust: parseFloat(dados.disponibilidadeIndustrial),
        extra_terno: 0.7,
        umid_bag: parseFloat(dados.umidadeBagaço),
        brix_prim: parseFloat(dados.brixCaldoPrimario),
        pol_prim: parseFloat(dados.polCaldoPrimario),
        fibra_cana: parseFloat(dados.fibraCana),
        vazCaldoFab: parseFloat(dados.vazaoCaldoPrimario),
      });

      // =============== CÁLCULO DOS REGENERADORES ===============
      const Regeneradores = PrevLib.calcularAquecimento({
        nome: "Aquecedor",
        temp_entrada: parseFloat(dados.temperaturaCaldoPrimario),
        brix: parseFloat(dados.brixCaldoPrimario),
        vaz_entrada: parseFloat(dados.vazaoCaldoPrimario),
      });

      // =============== CÁLCULO DA SULFITAÇÃO ===============
      const Sulfitacao = PrevLib.calcularSulfitacao(
        parseFloat(dados.vazaoCaldoPrimario)
      );

      // =============== CÁLCULO DA CALEAÇÃO ===============
      const Caleacao = PrevLib.calcularCaleacao(
        parseFloat(dados.vazaoCaldoPrimario)
      );

      // =============== TEMPERATURAS DOS REGENERADORES ===============
      const temperaturas_regeneradores =
        Regeneradores?.Aquecedor?.["Lista de Temperaturas (ºC)"] || [];
      const ultimaTemperatura_regeneradores =
        temperaturas_regeneradores.length > 0
          ? temperaturas_regeneradores[temperaturas_regeneradores.length - 1]
          : parseFloat(dados.temperaturaCaldoPrimario);

      setUltimaTemperaturaRegeneradores(ultimaTemperatura_regeneradores);

      // =============== CÁLCULO DO TROCADOR DE CALOR ===============
      const TrocadorCalor = PrevLib.calcularAquecimento({
        nome: "TrocadorCalor",
        temp_entrada: ultimaTemperatura_regeneradores,
        brix: parseFloat(dados.brixCaldoPrimario),
        vaz_entrada: parseFloat(dados.vazaoCaldoPrimario),
      });

      // =============== TEMPERATURAS DO TROCADOR DE CALOR ===============
      const temperaturas_TrocadorCalor =
        TrocadorCalor?.TrocadorCalor?.["Lista de Temperaturas (ºC)"] || [];
      const ultimaTemperatura_TrocadorCalor =
        temperaturas_TrocadorCalor.length > 0
          ? temperaturas_TrocadorCalor[temperaturas_TrocadorCalor.length - 1]
          : ultimaTemperatura_regeneradores;

      setUltimaTemperaturaTrocadorCalor(ultimaTemperatura_TrocadorCalor);

      // =============== CÁLCULO DO BALÃO FLASH ===============
      const Flash = PrevLib.calcularBalaoFlash(
        parseFloat(dados.vazaoCaldoPrimario),
        parseFloat(dados.brixCaldoPrimario),
        ultimaTemperatura_TrocadorCalor,
        99 // Temperatura fixa do balão flash
      );

      // =============== CÁLCULO DO FILTRO ROTATIVO ===============
      const FiltroRotativo = PrevLib.calcularFiltroRotativo(
        Flash?.["Balao Flash"]?.["Vazão de Saída do Balão Flash (ton/h)"] || 0,
        Flash?.["Balao Flash"]?.["Brix de Saída do Balão Flash (º)"] || 0
      );

      // =============== CÁLCULO DO DECANTADOR ===============
      const Decantador = PrevLib.calcularDecantador(
        FiltroRotativo?.["Filtro Rotativo"]?.[
          "Vazão de Saída do Filtro Rotativo (ton/h)"
        ] || 0,
        FiltroRotativo?.["Filtro Rotativo"]?.[
          "Brix de Saída do Filtro Rotativo (º)"
        ] || 0,
        0.17, // Percentual de lodo fixo
        parseFloat(dados.brixLodo),
        parseFloat(dados.polCaldo)
      );

      // =============== CÁLCULO DO FILTRO PRENSA ===============
      const FiltroPrensa = PrevLib.calcularFiltroPrensa(
        Decantador?.Decantador?.["Vazão de Lodo (ton/h)"] || 0,
        50, // Umidade da torta fixa
        parseFloat(dados.brixLodo),
        0.3 // Percentual de filtrado fixo
      );

      // =============== CÁLCULO DA PENEIRA ROTATIVA ===============
      const PeneiraRotativa = PrevLib.calcularPeneiraRotativa(
        Decantador?.Decantador?.[
          "Vazão de Caldo na Saída do Decantador (ton/h)"
        ] || 0,
        Decantador?.Decantador?.["Brix do Caldo na Saída do Decantador (º)"] ||
          0
      );

      // =============== VALIDAÇÃO PARA EVAPORADORES ===============
      const brixPeneira = parseFloat(
        PeneiraRotativa?.["Peneira Rotativa"]?.[
          "Brix de Saída da Peneira Rotativa (º)"
        ] || 0
      );
      const vazaoPeneira = parseFloat(
        PeneiraRotativa?.["Peneira Rotativa"]?.[
          "Vazão de Caldo na Saída da Peneira Rotativa (ton/h)"
        ] || 0
      );

      if (isNaN(brixPeneira) || isNaN(vazaoPeneira)) {
        throw new Error("Valores inválidos para cálculo dos evaporadores");
      }

      // =============== CÁLCULO DOS EVAPORADORES ===============
      const Evaporadores = PrevLib.calcularEvaporadores({
        brix_inicial: brixPeneira,
        vaz_caldo: vazaoPeneira,
        temp_inicial: 99, // Temperatura fixa inicial
        press_vapor: parseFloat(dados.pressaoVapor) + 1, // Pressão ajustada
        listaEvap: listaFiltrada,
        alvo_brix_final: [60, 63], // Range de brix final
      });

      // =============== CONSOLIDAR RESULTADOS ===============
      const resultadosConsolidados = {
        Extracao,
        Regeneradores,
        Sulfitacao,
        Caleacao,
        TrocadorCalor,
        Flash,
        FiltroRotativo,
        Decantador,
        FiltroPrensa,
        PeneiraRotativa,
        Evaporadores,
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

  const limparResultados = () => {
    setResultados(null);
    setErro(null);
    setUltimaTemperaturaRegeneradores(null);
    setUltimaTemperaturaTrocadorCalor(null);
    setListaEvaporadoresFiltrada([...listaOriginalEvaporadores]);
  };

  const recalcularComNovosDados = async (novosDados) => {
    // Atualiza os dados e recalcula
    return await calcularProducao(novosDados);
  };

  return {
    // Estados
    calculando,
    resultados,
    listaEvaporadoresFiltrada,
    ultimaTemperaturaRegeneradores,
    ultimaTemperaturaTrocadorCalor,
    erro,

    // Ações
    calcularProducao,
    limparResultados,
    recalcularComNovosDados,

    // Utilitários
    hasResultados: !!resultados,
    isValidCalculation: !erro && !!resultados,
  };
};

// Hook para uso específico do componente PrevAcucar
export const usePrevAcucarCalculation = () => {
  const listaOriginalEvaporadores = [3500, 2500, 2000, 2000, 1000, 1000];

  return {
    listaOriginalEvaporadores,
    useCalculation: (dados) => useCalculation(dados, listaOriginalEvaporadores),
  };
};

export default useCalculation;
