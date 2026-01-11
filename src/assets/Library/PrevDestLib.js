export function tanqMistura({
  vazEntrada,
  brixEntrada,
  polEntrada,
  vazMel,
  brixMel,
  purMel,
  vazFiltrado,
  brixFiltrado,
  polFiltrado,
}) {
  const destEntrada =
    0.000028 * Math.pow(brixEntrada, 2) + 0.002951 * brixEntrada + 1.01037;
  const destFiltrado =
    0.000028 * Math.pow(brixFiltrado, 2) + 0.002951 * brixFiltrado + 1.01037;
  const vazFiltrado_ton = vazFiltrado * destFiltrado;
  const vazEntrada_ton = vazEntrada * destEntrada;
  const vazMosto_ton = vazEntrada_ton + vazMel + vazFiltrado_ton;
  const brixMosto_pD =
    (vazEntrada_ton * brixEntrada +
      vazMel * brixMel +
      vazFiltrado_ton * brixFiltrado) /
    vazMosto_ton;
  const brixMosto_real = 22;
  const agua = (brixMosto_pD * vazMosto_ton) / brixMosto_real;
  const vazMosto_ton_real = vazMosto_ton + agua;
  const destMosto =
    0.000028 * Math.pow(brixMosto_real, 2) +
    0.002951 * brixMosto_real +
    1.01037;
  const vazMosto_M = vazMosto_ton_real / destMosto;
  const purezEntrada = (polEntrada / brixEntrada) * 100;
  const purezFiltrado = (polFiltrado / brixFiltrado) * 100;
  const purezMosto =
    (vazEntrada_ton * purezEntrada +
      vazMel * purMel +
      purezFiltrado * vazFiltrado_ton) /
    vazMosto_ton;

  return {
    TanqueMistura: {
      vazMosto_ton_real,
      brixMosto_pD,
      brixMosto_real,
      destMosto,
      vazMosto_M,
      purezMosto,
      agua,
    },
  };
}

export function calFermentacao({
  vazMosto,
  brixMosto,
  purMosto,
  converFermentacao = 0.9,
}) {
  // Entradas esperadas:
  // vazMosto: toneladas por hora (t/h)
  // brixMosto: ºBrix (%% m/m)
  // purMosto: pureza do mosto (%% de Brix como sacarose)
  // converFermentacao: eficiência de conversão (0-1)

  // Constantes estequiométricas e densidades
  const M_glucose = 180.156; // g/mol (aprox. glicose)
  const M_ethanol = 46.06844; // g/mol
  const M_CO2 = 44.01; // g/mol
  const densEt = 0.789; // kg/L (etanol)
  const densH2O = 0.997; // kg/L (água)

  // Rendimento teórico (massa de EtOH por massa de glicose)
  const rendimento_teorico = (2 * M_ethanol) / M_glucose; // ~0.5117 g EtOH / g glicose

  const vazTon_h = vazMosto ? Number(vazMosto) : 0;
  const total_mass_kg_h = vazTon_h * 1000; // kg/h
  const solids_frac = brixMosto ? Number(brixMosto) / 100 : 0; // fração m/m
  const purity_frac = purMosto ? Number(purMosto) / 100 : 0; // fração (pol/brix)

  // Massa de açúcar disponível (kg/h) -- assumimos sacarose equivalente fermentável
  const sugar_mass_kg_h = total_mass_kg_h * solids_frac * purity_frac;

  // Etanol produzido (kg/h) por balanço estequiométrico e eficiência de conversão
  const ethanol_mass_kg_h =
    sugar_mass_kg_h * rendimento_teorico * converFermentacao;

  // CO2 gerado (kg/h) por estequiometria: 2 mol CO2 / mol glicose
  const CO2_mass_kg_h =
    sugar_mass_kg_h * ((2 * M_CO2) / M_glucose) * converFermentacao;

  // Volumes (L/h)
  const ethanol_vol_L_h = ethanol_mass_kg_h / densEt;

  // Massa que permanece no líquido (descontando CO2 perdido como gás)
  const liquid_mass_kg_h = total_mass_kg_h - CO2_mass_kg_h;
  const water_mass_kg_h = liquid_mass_kg_h - ethanol_mass_kg_h; // inclui água + não fermentáveis
  const water_vol_L_h = water_mass_kg_h / densH2O;

  const vazDorna_L = ethanol_vol_L_h + water_vol_L_h;
  const vazDorna_ton_h = (vazDorna_L * densH2O) / 1000; // aproximação com densidade da mistura ~ água

  const GL = water_vol_L_h > 0 ? (ethanol_vol_L_h / water_vol_L_h) * 100 : 0; // ºGL aproximado
  const frac_et = vazDorna_L > 0 ? ethanol_vol_L_h / vazDorna_L : 0;

  return {
    Fermentacao: {
      vazDorna_ton_h,
      vazDorna_L,
      vazEt_L: ethanol_vol_L_h,
      vazEt_kg_h: ethanol_mass_kg_h,
      vazCO2_kg_h: CO2_mass_kg_h,
      GL,
      frac_et,
      rendimento_teorico,
      sugar_mass_kg_h,
    },
  };
}

export function colunaDestilacao(
  nome,
  vazaoIn,
  fracIn,
  fracFundo,
  fracVap = null,
  fracLiq = null
) {
  const etanolIn = vazaoIn * fracIn;
  const saidas = {};

  // Trata valores null
  const fracVapCalc = fracVap !== null ? fracVap : 0.0;
  const fracLiqCalc = fracLiq !== null ? fracLiq : 0.0;

  const totalFracSum = fracVapCalc + fracLiqCalc + fracFundo;
  if (totalFracSum === 0) {
    return { coluna: nome, saidas: {} };
  }

  // Saída vapor
  if (fracVap !== null) {
    const etanolVap = etanolIn * (fracVapCalc / totalFracSum);
    const VAPOR_OUT = fracVap > 0 ? etanolVap / fracVap : 0;
    saidas.Vapor_Out = VAPOR_OUT;
    saidas.Etanol_Vapor = VAPOR_OUT * fracVap;
    saidas.Frac_Et_Vapor = VAPOR_OUT > 0 ? saidas.Etanol_Vapor / VAPOR_OUT : 0;
  }

  // Saída líquida
  if (fracLiq !== null) {
    const etanolLiqTopo = etanolIn * (fracLiqCalc / totalFracSum);
    const LIQUIDO_OUT = fracLiq > 0 ? etanolLiqTopo / fracLiq : 0;
    saidas.Liquido_Out = LIQUIDO_OUT;
    saidas.Etanol_Liquido = LIQUIDO_OUT * fracLiq;
    saidas.Frac_Et_Liquido =
      LIQUIDO_OUT > 0 ? saidas.Etanol_Liquido / LIQUIDO_OUT : 0;
  }

  // Saída fundo
  const etanolFundo = etanolIn * (fracFundo / totalFracSum);
  const FUNDO_OUT = fracFundo > 0 ? etanolFundo / fracFundo : 0;
  saidas.Fundo_Out = FUNDO_OUT;
  saidas.Etanol_Fundo = FUNDO_OUT * fracFundo;
  saidas.Frac_Et_Fundo = FUNDO_OUT > 0 ? saidas.Etanol_Fundo / FUNDO_OUT : 0;

  return { coluna: nome, saidas };
}

export function sistemaDestilacaoEtanolFundo(
  vazaoVinho,
  fracVinho,
  fracTopoAA1Vap,
  fracTopoAA1Liq,
  fracFundoD,
  disponi_agric,
  disponi_clim,
  disponi_indust
) {
  const disponi_list = [disponi_clim, disponi_indust, disponi_agric];
  const disponi = Math.min(...disponi_list) / 100;
  const disponi_h = disponi * 24;

  // --- Coluna AA1 ---
  const colAA1 = colunaDestilacao(
    "AA1",
    vazaoVinho,
    fracVinho,
    0.01,
    fracTopoAA1Vap,
    fracTopoAA1Liq
  );

  // --- Coluna D ---
  const feedD = colAA1.saidas.Liquido_Out;
  const fracInD = feedD > 0 ? colAA1.saidas.Etanol_Liquido / feedD : 0;
  const colD = colunaDestilacao("D", feedD, fracInD, fracFundoD, null, 0.05);

  // --- Coluna B ---
  const feedB = colAA1.saidas.Vapor_Out + colD.saidas.Fundo_Out;
  const etanolFeedB = colAA1.saidas.Etanol_Vapor + colD.saidas.Etanol_Fundo;
  const fracInB = feedB > 0 ? etanolFeedB / feedB : 0;
  const colB = colunaDestilacao("B", feedB, fracInB, 0.01, null, 0.95);

  // --- Resultados principais ---
  const residuosTotais =
    colAA1.saidas.Fundo_Out + colD.saidas.Fundo_Out + colB.saidas.Fundo_Out;
  const fracEtResiduos =
    residuosTotais > 0
      ? (colAA1.saidas.Etanol_Fundo +
          colD.saidas.Etanol_Fundo +
          colB.saidas.Etanol_Fundo) /
        residuosTotais
      : 0;

  return {
    Destilacao: {
      "Produto Final (ETANOL-2 Fundo D)": colD.saidas.Etanol_Fundo,
      "Produto Final (ETHID B)": colB.saidas.Etanol_Liquido,
      "Produto Final (ETHID B) diário": colB.saidas.Etanol_Liquido * disponi_h,
      "Resíduos Totais": residuosTotais,
      "Frac Etanol Resíduos": fracEtResiduos,
    },
  };
}
