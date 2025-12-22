// PrevAcucarLib.js
// Biblioteca em JavaScript convertida de funções Python para uso em aplicações web (ES Modules)

/** Utilitários básicos */
const roundTo = (v, n = 2) => {
  return Math.round((v + Number.EPSILON) * Math.pow(10, n)) / Math.pow(10, n);
};

const isArray = (a) => Array.isArray(a);

const linspace = (start, stop, num) => {
  if (num === 1) return [start];
  const step = (stop - start) / (num - 1);
  return Array.from({ length: num }, (_v, i) => start + step * i);
};

const interp1d = (xArr, yArr, x) => {
  // linear interpolation for single x or array x
  const interp = (xi) => {
    if (xi <= xArr[0]) return yArr[0];
    if (xi >= xArr[xArr.length - 1]) return yArr[yArr.length - 1];
    let i = 0;
    while (xArr[i + 1] < xi) i++;
    const x0 = xArr[i],
      x1 = xArr[i + 1];
    const y0 = yArr[i],
      y1 = yArr[i + 1];
    const t = (xi - x0) / (x1 - x0);
    return y0 + t * (y1 - y0);
  };
  if (Array.isArray(x)) return x.map(interp);
  return interp(x);
};

/**
 * Transforma todas as vazões em ton/h dividindo por 1000
 * @param {number[]} lista_original
 * @returns {number[]}
 */
export function dividirListaPorMil(lista_original) {
  if (!isArray(lista_original))
    throw new TypeError("A entrada deve ser uma lista.");
  return lista_original.map((item) => roundTo(item / 1000, 2));
}

/**
 * Arredonda uma lista para 2 casas decimais
 * @param {number[]} lista_original
 * @returns {number[]}
 */
export function arredondaLista(lista_original) {
  if (!isArray(lista_original))
    throw new TypeError("A entrada deve ser uma lista.");
  return lista_original.map((item) => roundTo(item, 2));
}

/**
 * Converte m.c.a para kgf/cm² (multiplica por 0.01)
 * @param {number[]} lista_original
 * @returns {number[]}
 */
export function mcaParaKgf(lista_original) {
  if (!isArray(lista_original))
    throw new TypeError("A entrada deve ser uma lista.");
  return lista_original.map((item) => item * 0.01);
}

/**
 * Converte bar para kgf/cm²
 * @param {number[]} lista_original
 * @returns {number[]}
 */
export function barParaKgf(lista_original) {
  if (!isArray(lista_original))
    throw new TypeError("A entrada deve ser uma lista.");
  return lista_original.map((item) => item * 1.01972);
}

/**
 * Cálculo de moenda (versão JS)
 */
export function calcularMoenda({
  ton_cana_dia,
  disponi_agric,
  disponi_clim,
  disponi_indust,
  extra_terno = 0.7,
  umid_bag,
  brix_prim,
  pol_prim,
  fibra_cana,
  vazCaldoFab,
}) {
  const disponi_list = [disponi_clim, disponi_indust, disponi_agric];
  const disponi = Math.min(...disponi_list) / 100;
  const disponi_h = disponi * 24;
  const tch = ton_cana_dia / (24 * disponi);

  const vaz_fibra = tch * (fibra_cana / 100);
  const embebi_fibra = (90 / vaz_fibra) * 100;
  const vaz_bagac = vaz_fibra / (umid_bag / 100);

  const vaz_caldo_1 = tch * extra_terno;
  const vaz_caldo_26 = tch + 90 - vaz_caldo_1 - vaz_bagac;

  const vaz_caldo_prim = vaz_caldo_1 + vaz_caldo_26;
  const purez_prim = (pol_prim / brix_prim) * 100;
  const dens_prim =
    0.000028 * Math.pow(brix_prim, 2) + (0.002951 * brix_prim + 1.01037);
  const vaz_caldo_prim_m = vaz_caldo_prim * dens_prim;

  const mix = (vazCaldoFab / vaz_caldo_prim_m) * 100;

  const resultados = {
    Extração: {
      "Tonelada de Cana por hora": roundTo(tch, 2),
      "Disponibilidade Geral (h)": roundTo(disponi_h, 2),
      "Vazão de Bagaço (ton/h)": roundTo(vaz_bagac, 2),
      "Vazão de Caldo Primário (ton/h)": roundTo(vaz_caldo_prim, 2),
      "Vazão de Caldo Primário (m³/h)": roundTo(vaz_caldo_prim_m, 2),
      "Pureza do Caldo Primário (%)": roundTo(purez_prim, 2),
      "Densidade do Caldo Primário": roundTo(dens_prim, 2),
      "Embebição (%)": roundTo(embebi_fibra, 2),
      "Mix p/ Açúcar (%)": roundTo(mix, 2),
    },
  };

  return resultados;
}

/**
 * Cálculo de aquecimento/trocador
 */
export function calcularAquecimento({
  nome,
  num_equip = nome == "Aquecedor" ? 3 : 8,
  temp_entrada,
  temp_aque = nome == "Aquecedor" ? 90 : 114,
  dint = 0.0366,
  quant_passe = nome == "Aquecedor" ? 2 : 6,
  tubos = nome == "Aquecedor" ? 33 : 62,
  comp_tubo = nome == "Aquecedor" ? 5.185 : 4.4,
  brix,
  vaz_entrada,
}) {
  const valor_pi = Math.PI;
  const cp = 1 - 0.006 * brix;
  const dens =
    (0.000028 * Math.pow(brix, 2) + 0.002951 * brix + 1.01037) * 1000;

  const area = ((valor_pi * Math.pow(dint, 2)) / 4) * tubos;
  const vaz_entrada_kg = vaz_entrada * 1000;
  const vaz_entrada_m3_s = vaz_entrada_kg / 3600 / dens;

  const sai = valor_pi * dint * tubos * quant_passe * comp_tubo;
  const temperaturas = [temp_entrada];
  const perdas = [0];
  const vel = vaz_entrada_m3_s / area;
  const velRound = vel.toFixed(2);

  let quant_passes_equip = quant_passe;
  for (let i = 0; i < num_equip; i++) {
    const coef = temp_aque * (5 + vel);
    const expoente = (-coef * sai) / (vaz_entrada_kg * cp);
    const temp_said =
      temp_aque -
      (temp_aque - temperaturas[temperaturas.length - 1]) *
        Math.pow(2.81, expoente);
    temperaturas.push(temp_said);

    const perda =
      (0.0025 * Math.pow(vel, 2) * quant_passes_equip * (comp_tubo + 1)) / dint;
    perdas.push(perda);
    quant_passes_equip += nome === "Aquecedor" ? 2 : 6;
  }

  const denominador_q = (607 - 0.7 * temp_aque) / 0.95;
  const q = (
    (vaz_entrada_kg *
      cp *
      (temperaturas[temperaturas.length - 1] - temp_entrada)) /
    denominador_q /
    1000
  ).toFixed(2);

  const temperaturasRound = arredondaLista(temperaturas);
  const perdasKg = mcaParaKgf(perdas).map((perda) =>
    // Aplica parseFloat para garantir que é um número (caso mcaParaKgf retorne strings)
    // e formata para 4 casas decimais.
    parseFloat(perda).toFixed(4)
  );

  const resultados = {
    [`${nome}`]: {
      "Lista de Temperaturas (ºC)": temperaturasRound,
      "Lista de Perdas (kgf/cm²)": perdasKg,
      "Velocidade (m/s)": velRound,
      "Calor trocado (kcal)": q,
    },
  };

  return resultados;
}

/**
 * Sulfitacão
 */
export function calcularSulfitacao(
  vaz_entrada,
  s_tonc = 225,
  mm_s = 32.065,
  mm_oxig = 32
) {
  const vaz_s_g = vaz_entrada * s_tonc;
  const vaz_s_mol = vaz_s_g / mm_s;
  const vaz_oxig_mol = vaz_s_mol;
  const vaz_oxig_g = vaz_oxig_mol * mm_oxig;

  const vaz_s_kg = vaz_s_g / 1000;
  const vaz_oxig_kg = vaz_oxig_g / 1000;

  return {
    Sulfitacao: {
      "Vazão de Enxofre (kg/h)": vaz_s_kg,
      "Vazão de Oxigênio (kg/h)": vaz_oxig_kg,
    },
  };
}

/**
 * Caleação
 */
export function calcularCaleacao(
  vaz_entrada,
  cal_tonc = 650,
  mm_ca = 100,
  mm_h2o = 18
) {
  const vaz_cal_g = vaz_entrada * cal_tonc;
  const vaz_cal_mol = vaz_cal_g / mm_ca;
  const vaz_h2o_mol = vaz_cal_mol / 4;
  const vaz_h2o_g = vaz_h2o_mol * mm_h2o;

  const vaz_cal_kg = vaz_cal_g / 1000;
  const vaz_h2o_kg = vaz_h2o_g / 1000;

  return {
    Caleacao: {
      "Vazão de Cal (kg/h)": vaz_cal_kg,
      "Vazão de Água (kg/h)": vaz_h2o_kg,
    },
  };
}

/**
 * Balão Flash
 */
export function calcularBalaoFlash(
  vaz_entrada,
  brix,
  temp_tc,
  temp_said_balao_flash = 99
) {
  const Cp = 1 - 0.006 * brix;
  const denom_agua_evap = 607 - 0.7 * (temp_tc - temp_said_balao_flash);
  const agua_evap_bflash =
    vaz_entrada * Cp * ((temp_tc - temp_said_balao_flash) / denom_agua_evap);
  const vaz_saida = vaz_entrada - agua_evap_bflash;
  const brix_flash = (brix * vaz_entrada) / vaz_saida;
  const dens_flash =
    0.000028 * Math.pow(brix_flash, 2) + 0.002951 * brix_flash + 1.01037;
  const vaz_saida_m = vaz_saida / dens_flash;

  return {
    "Balao Flash": {
      "Vazão de Saída do Balão Flash (ton/h)": vaz_saida,
      "Vazão de Saída do Balão Flash (m³/h)": vaz_saida_m,
      "Brix de Saída do Balão Flash (º)": brix_flash,
    },
  };
}

/**
 * Filtro Rotativo
 */
export function calcularFiltroRotativo(vaz_entrada, brix_entrada) {
  const vaz_saida_fr = vaz_entrada;
  const brix_fr = (brix_entrada * vaz_entrada) / vaz_saida_fr;
  const dens_fr =
    0.000028 * Math.pow(brix_fr, 2) + 0.002951 * brix_fr + 1.01037;
  const vaz_fr_m = vaz_saida_fr / dens_fr;

  return {
    "Filtro Rotativo": {
      "Vazão de Saída do Filtro Rotativo (ton/h)": vaz_saida_fr,
      "Vazão de Saída do Filtro Rotativo (m³/h)": vaz_fr_m,
      "Brix de Saída do Filtro Rotativo (º)": brix_fr,
    },
  };
}

/**
 * Decantador
 */
export function calcularDecantador(
  vaz_entrada,
  brix_fr,
  reten_decant = 0.17,
  brix_lodo,
  pol_decant
) {
  const vaz_lodo = vaz_entrada * reten_decant;
  const vaz_caldo_decant = vaz_entrada - vaz_lodo;
  const brix_decant =
    (brix_fr * vaz_entrada - brix_lodo * vaz_lodo) / vaz_caldo_decant;
  const purez_decant = (pol_decant / brix_decant) * 100;
  const dens_decant =
    0.000028 * Math.pow(brix_decant, 2) + 0.002951 * brix_decant + 1.01037;
  const vaz_decant_m = vaz_caldo_decant / dens_decant;

  return {
    Decantador: {
      "Vazão de Lodo (ton/h)": vaz_lodo,
      "Vazão de Caldo na Saída do Decantador (ton/h)": vaz_caldo_decant,
      "Vazão de Caldo na Saída do Decantador (m³/h)": vaz_decant_m,
      "Brix do Caldo na Saída do Decantador (º)": brix_decant,
      "Pureza do Caldo na Saída do Decantador (%)": purez_decant,
    },
  };
}

/**
 * Filtro Prensa
 */
export function calcularFiltroPrensa(
  mass_flow_tph,
  Ss_kg_m3,
  B_feed_degBx,
  xc = 0.3
) {
  const M_feed = mass_flow_tph * 1000.0;
  const rho_feed =
    (0.000028 * Math.pow(B_feed_degBx, 2) + 0.002951 * B_feed_degBx + 1.01037) *
    1000;
  const V_feed = M_feed / rho_feed;
  const M_susp = Ss_kg_m3 * V_feed;
  const M_liquid = M_feed - M_susp;
  if (M_liquid <= 0)
    return {
      error:
        "Massa líquida negativa ou zero: reveja sólidos em suspensão ou vazão.",
    };
  const M_diss = (B_feed_degBx / 100.0) * M_liquid;
  const M_cake = M_susp / xc;
  const V_cake = M_cake / 1000.0;
  const M_filtrado = M_feed - M_cake;
  if (M_filtrado <= 0)
    return {
      error:
        "Massa filtrada <= 0: reveja fração sólida na torta ou sólidos suspensos.",
    };
  const B_filtrado = (100.0 * M_diss) / M_filtrado;
  const rho_filtrado =
    (0.000028 * Math.pow(B_filtrado, 2) + 0.002951 * B_filtrado + 1.01037) *
    1000;
  const V_filtrado = M_filtrado / rho_filtrado;
  const M_torta_tph = M_cake / 1000.0;

  return {
    "Filtro Prensa": {
      "Vazão de Filtrado (m³/h)": V_filtrado,
      "Brix do Filtrado (º)": B_filtrado,
      "Massa da Torta (ton/h)": M_torta_tph,
    },
  };
}

/**
 * Peneira Rotativa
 */
export function calcularPeneiraRotativa(vaz_caldo_decant, brix_decant) {
  const vaz_caldo_pr = vaz_caldo_decant;
  const brix_pr = (brix_decant * vaz_caldo_decant) / vaz_caldo_pr;
  const dens_pr =
    0.000028 * Math.pow(brix_pr, 2) + 0.002951 * brix_pr + 1.01037;
  const vaz_pr_m = vaz_caldo_pr / dens_pr;

  return {
    "Peneira Rotativa": {
      "Vazão de Caldo na Saída da Peneira Rotativa (ton/h)": vaz_caldo_pr,
      "Vazão de Caldo na Saída da Peneira Rotativa (m³/h)": vaz_pr_m,
      "Brix de Saída da Peneira Rotativa (º)": brix_pr,
    },
  };
}

/**
 * Dados de referência de pressão/temperatura/entalpia/latente (estrutura parecida com df_press_abs)
 * Importante: a aplicação que consumir esta lib pode fornecer seu próprio conjunto.
 */
export const dfPressAbs = {
  P: [
    0.01, 0.02, 0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.15, 0.2, 0.3,
    0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8, 2.0,
    2.2, 2.4, 2.6, 2.8, 3.0,
  ],
  T: [
    6.7, 17.2, 23.8, 28.6, 32.5, 35.8, 38.9, 41.2, 43.9, 45.4, 53.6, 59.7, 68.7,
    75.9, 81.3, 86.0, 90.0, 93.5, 96.6, 99.6, 101.8, 104.8, 107.5, 109.9, 112.0,
    114.0, 117.6, 120.9, 124.0, 126.8, 129.5, 131.9, 134.2,
  ],
  H: [
    600.1, 604.8, 607.7, 609.8, 611.5, 612.9, 613.9, 615.1, 616.1, 617.0, 620.5,
    623.1, 626.8, 629.4, 631.3, 632.9, 634.2, 635.3, 636.3, 637.2, 638.0, 638.7,
    639.4, 640.0, 640.6, 641.1, 642.1, 643.0, 643.8, 644.5, 645.1, 645.7, 646.2,
  ],
  L: [
    593.0, 587.4, 583.9, 581.1, 578.9, 577.1, 575.0, 574.1, 572.9, 571.6, 567.0,
    563.5, 558.2, 553.7, 550.2, 547.0, 544.1, 541.6, 539.3, 537.1, 535.4, 533.1,
    531.0, 529.1, 527.3, 525.6, 522.4, 519.5, 516.7, 514.1, 511.7, 509.4, 507.2,
  ],
};

/**
 * Arruma lista: arredonda todos os valores
 */
/**
 * Arruma lista: arredonda todos os valores (robusto)
 * Aceita array de números ou número único.
 */
export function arrumarLista(lista) {
  if (lista == null) return lista;
  if (!Array.isArray(lista)) {
    if (typeof lista === "number") return roundTo(lista / 1000, 2);
    return lista;
  }
  return lista.map((v) => {
    if (v == null) return v;
    // garante que não quebre se o elemento não for número
    const num = Number(v);
    return Number.isFinite(num) ? roundTo(num / 1000, 2) : v;
  });
}

/**
 * calcularPressaoTemp convertido
 */
export function calcularPressaoTemp(
  seq,
  press_inicial,
  key_inicial,
  key_final,
  P_ref,
  T_ref,
  H_ref,
  L_ref
) {
  const frac_queda = (key_inicial - key_final) / (seq - 1);
  const queda_rel = [0];
  for (let i = 1; i < seq; i++) {
    queda_rel.push((key_inicial - i * frac_queda) / (10 * seq));
  }
  const queda_total = roundTo(
    (press_inicial - queda_rel[queda_rel.length - 1]) * 1.01972,
    2
  );
  const queda_entre = queda_rel.map((v) => v * queda_total);

  const press_efeitos = new Array(seq + 1).fill(0);
  press_efeitos[0] = press_inicial;
  for (let i = 0; i < seq; i++) {
    press_efeitos[i + 1] = press_efeitos[i] - queda_entre[i];
  }

  const df = press_efeitos.map((p, idx) => ({
    Efeito: idx + 1,
    "Pressão (bar)": roundTo(p, 3),
    "Temperatura (°C)": roundTo(interp1d(P_ref, T_ref, p), 2),
    "Entalpia (kcal/kg)": roundTo(interp1d(P_ref, H_ref, p), 2),
    "Calor Latente (kcal/kg)": roundTo(interp1d(P_ref, L_ref, p), 2),
  }));

  return { df, queda_rel, queda_total, queda_entre };
}

/**
 * calcularEvaporadores (versão adaptada para JS)
 * Recebe: objeto de parâmetros e retorna resultados compatíveis com a versão Python
 */
export function calcularEvaporadores({
  df_press_abs_local = dfPressAbs,
  brix_inicial,
  vaz_caldo,
  temp_inicial,
  press_vapor,
  listaEvap,
  perda_rad_frac = 0.005,
  perda_incond_frac = 0.015,
  alvo_brix_final = [60, 63],
}) {
  const P_ref = df_press_abs_local.P;
  const T_ref = df_press_abs_local.T;
  const H_ref = df_press_abs_local.H;
  const L_ref = df_press_abs_local.L;

  function simular(mul_1, mul_2, press_vapor_local) {
    const seqImpar = calcularPressaoTemp(
      3,
      press_vapor_local,
      11.0,
      9.0,
      P_ref,
      T_ref,
      H_ref,
      L_ref
    );
    const seqPar = calcularPressaoTemp(
      2,
      press_vapor_local,
      11.0,
      9.0,
      P_ref,
      T_ref,
      H_ref,
      L_ref
    );

    const entalpia_98C = interp1d(T_ref, H_ref, temp_inicial);
    const latente_98C = interp1d(T_ref, L_ref, temp_inicial);

    const Pressao_list = [
      press_vapor_local,
      press_vapor_local,
      seqImpar.df[1]["Pressão (bar)"],
      seqPar.df[1]["Pressão (bar)"],
      seqImpar.df[2]["Pressão (bar)"],
    ];

    const Entalpia_list = [
      entalpia_98C,
      seqImpar.df[0]["Entalpia (kcal/kg)"],
      seqImpar.df[0]["Entalpia (kcal/kg)"],
      seqImpar.df[1]["Entalpia (kcal/kg)"],
      seqPar.df[1]["Entalpia (kcal/kg)"],
      seqImpar.df[2]["Entalpia (kcal/kg)"],
    ];

    const Latente_list = [
      latente_98C,
      seqImpar.df[0]["Calor Latente (kcal/kg)"],
      seqImpar.df[0]["Calor Latente (kcal/kg)"],
      seqImpar.df[1]["Calor Latente (kcal/kg)"],
      seqPar.df[1]["Calor Latente (kcal/kg)"],
      seqImpar.df[2]["Calor Latente (kcal/kg)"],
    ];

    // ---- proteções / sanidade ----
    const quantidade = 5;
    if (!Array.isArray(listaEvap) || listaEvap.length < quantidade) {
      // Se listaEvap for menor/errada, preenche com valores de fallback razoáveis
      listaEvap = Array.from(
        { length: quantidade },
        (_, i) => listaEvap?.[i] ?? 1000
      );
    }
    const listaEvapSafe = listaEvap.map((v) =>
      !Number.isFinite(v) || Math.abs(v) < 1e-6 ? 1e-6 : v
    );

    // brix / EPE / temperaturas
    const brix_teorico = linspace(brix_inicial, 68, quantidade + 1);
    const brix_med = brix_teorico
      .slice(0, -1)
      .map((v, i) => (v + brix_teorico[i + 1]) / 2);
    const EPE = [0].concat(
      brix_med.map((bm) => (2 * brix_inicial) / (100 - bm))
    );

    const temp_vapor = Pressao_list.map((p) => interp1d(P_ref, T_ref, p));
    const temp_caldo = [temp_inicial].concat(
      temp_vapor.map((v) => roundTo(v, 2))
    );
    const temp_caldo_ajustada = temp_caldo.map((t, i) => t + (EPE[i] || 0));

    // inicializa vetores
    const vazao_list = new Array(quantidade + 1).fill(0);
    const brix_list = new Array(quantidade + 1).fill(0);
    const vazVap_list = new Array(quantidade).fill(0); // +2 para indices i+2
    const Cp_list = new Array(quantidade + 1).fill(0);
    const ConsVap_list = new Array(quantidade).fill(0);
    const VapUtil_list = new Array(quantidade).fill(0);
    const vapGeradoTotal_list = new Array(quantidade).fill(0);
    const vazSangria_list = new Array(quantidade).fill(0);
    const taxaEvap = new Array(quantidade).fill(0);

    vazao_list[0] = vaz_caldo * 1000; // assume vaz_caldo em ton/h -> kg/h
    brix_list[0] = brix_inicial;
    Cp_list[0] = 1 - 0.006 * brix_list[0];

    for (let i = 0; i < quantidade; i++) {
      // declara e protege Consumo_Vapor (evita ReferenceError)
      let Consumo_Vapor = 0.0;

      if (i <= 1) {
        // protege divisor entalpia
        const ent_i =
          Math.abs(Entalpia_list[i]) < 1e-9 ? 1e-9 : Entalpia_list[i];
        Consumo_Vapor =
          vazao_list[i] *
          Cp_list[i] *
          ((temp_caldo_ajustada[i + 1] - temp_caldo_ajustada[i]) / ent_i);

        // sanitiza
        if (!Number.isFinite(Consumo_Vapor) || Consumo_Vapor < 0)
          Consumo_Vapor = 0;
        ConsVap_list[i] = Consumo_Vapor;
      } else {
        ConsVap_list[i] = 0;
      }

      if (i <= 1) {
        // limita mul_1/mul_2 a faixas razoáveis (ajuste se souber outra escala)
        const safeMul1 = Math.min(Math.max(mul_1, 0.01), 10000);
        const safeMul2 = Math.min(Math.max(mul_2, 0.01), 10000);
        const VazVapor = Consumo_Vapor * (i === 0 ? safeMul1 : safeMul2);
        vazVap_list[i] =
          Number.isFinite(VazVapor) && VazVapor > 0 ? VazVapor : 0;
      }

      const PerdRad = perda_rad_frac * vazVap_list[i];
      const PerdIncond = perda_incond_frac * vazVap_list[i];
      let VapUtil = vazVap_list[i] - PerdRad - PerdIncond - ConsVap_list[i];
      if (!Number.isFinite(VapUtil) || VapUtil < 0) VapUtil = 0;
      VapUtil_list[i] = VapUtil;

      // protege latente next
      const lat_next =
        Math.abs(Latente_list[i + 1]) < 1e-9 ? 1e-9 : Latente_list[i + 1];
      const vapGerado = (Latente_list[i] / lat_next) * VapUtil;

      const VazFlash =
        i <= 1
          ? 0.0
          : vazao_list[i] *
            Cp_list[i] *
            ((temp_caldo_ajustada[i] - temp_caldo_ajustada[i + 1]) /
              (Math.abs(Latente_list[i]) < 1e-9 ? 1e-9 : Latente_list[i]));

      let vapGeradoTotal = (vapGerado || 0) + (VazFlash || 0);
      if (!Number.isFinite(vapGeradoTotal) || vapGeradoTotal < 0)
        vapGeradoTotal = 0;
      vapGeradoTotal_list[i] = vapGeradoTotal;

      let keySangria = 0;
      if (i === 0) keySangria = 100 / 350;
      else if (i <= 2) keySangria = 14 / 350;
      else keySangria = 0;
      vazSangria_list[i] = vazao_list[i] * keySangria;

      if (i <= 2) {
        const nextVap = (vapGeradoTotal_list[i] || 0) - vazSangria_list[i];
        vazVap_list[i + 2] =
          Number.isFinite(nextVap) && nextVap > 0 ? nextVap : 0;
      }

      vazao_list[i + 1] = vazao_list[i] - vapGeradoTotal_list[i];
      if (!Number.isFinite(vazao_list[i + 1]) || vazao_list[i + 1] <= 0)
        vazao_list[i + 1] = 1e-9;

      brix_list[i + 1] = (vazao_list[i] * brix_list[i]) / vazao_list[i + 1];
      Cp_list[i + 1] = 1 - 0.006 * brix_list[i + 1];
      taxaEvap[i] = vapGeradoTotal_list[i] / (listaEvapSafe[i] || 1e-9);

      // DEBUG (comente/descomente para inspecionar)
      // console.debug("simular iter", i, {
      //   Consumo_Vapor, vazVap: vazVap_list[i], PerdRad, PerdIncond, VapUtil, vapGerado, VazFlash,
      //   vapGeradoTotal: vapGeradoTotal_list[i], vazSangria: vazSangria_list[i], vazao_next: vazao_list[i+1],
      //   brix_next: brix_list[i+1]
      // });
    }

    return {
      Evaporadores: {
        brix_final: brix_list[quantidade],
        brix_list,
        ConsVap_list,
        vazVap_list,
        vapGeradoTotal: vapGeradoTotal_list,
        vazao_list,
        Cp_list,
        VapUtil_list,
        taxaEvap,
        temp_caldo_ajustada,
        vazSangria_list,
      },
    };
  }

  // busca de melhores parâmetros
  let melhor_brix = null;
  let melhor_par = [0, 0];
  let melhor_cons = 0.0;

  outer: for (const m1 of linspace(5, 15, 20)) {
    for (const m2 of linspace(1500, 2500, 20)) {
      const { Evaporadores: simEvap } = simular(m1, m2, press_vapor);
      if (!simEvap) continue;
      if (
        alvo_brix_final[0] <= simEvap.brix_final &&
        simEvap.brix_final <= alvo_brix_final[1]
      ) {
        melhor_brix = simEvap.brix_final;
        melhor_par = [m1, m2];
        melhor_cons = (simEvap.ConsVap_list || []).reduce(
          (a, b) => a + (b || 0),
          0
        );
        break outer;
      }
    }
  }

  if (melhor_brix === null) {
    const alvo = 0.5 * (alvo_brix_final[0] + alvo_brix_final[1]);
    let melhor_erro = 1e12;
    for (const m1 of linspace(5, 15, 40)) {
      for (const m2 of linspace(1200, 2800, 40)) {
        const { Evaporadores: simEvap } = simular(m1, m2, press_vapor);
        if (!simEvap) continue;
        const erro = Math.abs(simEvap.brix_final - alvo);
        if (erro < melhor_erro) {
          melhor_erro = erro;
          melhor_par = [m1, m2];
          melhor_brix = simEvap.brix_final;
        }
      }
    }
  }

  const { Evaporadores: finalSim } = simular(...melhor_par, press_vapor);
  const consumo_total_vapor = (finalSim?.ConsVap_list || []).reduce(
    (a, b) => a + (b || 0),
    0
  );
  const vapor_entrada_12 =
    (finalSim?.vazVap_list?.[0] || 0) + (finalSim?.vazVap_list?.[1] || 0);

  const resultados = {
    Evaporadores: {
      "Brix Final (º)": roundTo(finalSim?.brix_final ?? 0, 2),
      "Brix Efeitos (º)": finalSim?.brix_list ?? [],
      "Consumo Total de Vapor (kg/h)": roundTo(consumo_total_vapor, 6),
      "Lista Consumo por Efeito (kg/h)": arrumarLista(
        finalSim?.ConsVap_list ?? []
      ),
      "Lista Vapor Entrada por Efeito (kg/h)": arrumarLista(
        finalSim?.vazVap_list ?? []
      ),
      "Injeção de Vapor VE (kg/h)": roundTo(vapor_entrada_12 / 1000, 2),
      "Taxa de Evaporação (%)": finalSim?.taxaEvap ?? [],
      "Lista de Vapores Gerados (kg/h)": arrumarLista(
        finalSim?.vapGeradoTotal ?? []
      ),
      "Vazão de Caldo em Cada Efeito (kg/h)": arrumarLista(
        finalSim?.vazao_list ?? []
      ),
      "Lista de Cp do Caldo (kcal/kg)": arrumarLista(finalSim?.Cp_list ?? []),
      "Lista de Vapor Útil (kg/h)": arrumarLista(finalSim?.VapUtil_list ?? []),
      "Lista de Temperatura em cada Efeito (ºC)":
        finalSim?.temp_caldo_ajustada ?? [],
      "Lista de Sangrias em cada efeito (kg/h)": arrumarLista(
        finalSim?.vazSangria_list ?? []
      ),
    },
  };

  return resultados;
}

export function calcularCozedores(
  vaz_caldo_entrada,
  brix_entrada,
  pol_entrada,
  brixMelFinal,
  purezMelFinal,
  disponibilidade
) {
  const purez_entrada = (pol_entrada / brix_entrada) * 100;

  const vazSol_entrada = vaz_caldo_entrada * (brix_entrada / 100);
  const vazSac_entrada = vazSol_entrada * (purez_entrada / 100);

  const vazImpureza = vazSol_entrada - vazSac_entrada;

  const vazSacMelF = vazImpureza * (purezMelFinal / (100 - purezMelFinal));
  const vazMelF = (vazSacMelF * vazImpureza) / (brixMelFinal / 100);

  const vazSugar = vazSac_entrada - vazSacMelF;

  const sacas = (disponibilidade * vazSugar * 1000) / 50;

  const SJM = (vazSugar / vazSac_entrada) * 100;

  return {
    Cozedores: {
      "Vazão de Açúcar Final": vazSugar,
      "Total de Sacas": sacas,
      "SJM (%)": SJM.toFixed(2),
      "Vazão de Mel Final": vazMelF,
    },
  };
}
