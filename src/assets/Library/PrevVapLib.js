export function calPoderesCalorificos({
  umidade_pct,
  C = 44.6,
  H = 44.5,
  O = 5.8,
  S = 0.1,
  cinzas_pct = 0.6,
}) {
  const pcsSeco_kj_kg = 338 * C + 1442 * (H - O / 8) + 94 * S;
  const pciSeco_kj_kg = pcsSeco_kj_kg - 2442 * 9 * (H / 100);

  const umidade = umidade_pct / 100;
  const cinzas = cinzas_pct / 100;

  const pcsUmido_MJ_kg = (pcsSeco_kj_kg / 1000) * (1 - umidade - cinzas);
  const pciUmido_MJ_kg = (pciSeco_kj_kg / 1000) * (1 - umidade - cinzas);

  return {
    pcsSeco_kj_kg,
    pciSeco_kj_kg,
    pcsUmido_MJ_kg,
    pciUmido_MJ_kg,
  };
}

export function calVaporEletricidade({
  umidade_pct,
  vazBagaco,
  efiCaldeira,
  DELTA_H_MJ_KG,
}) {
  const { pciUmido_MJ_kg } = calPoderesCalorificos({ umidade_pct });
  const vazBagaco_kg_s = (vazBagaco * 1000) / 3600;
  const energiaCombustivel = vazBagaco_kg_s * pciUmido_MJ_kg;
  const energiaVapor = energiaCombustivel * (efiCaldeira / 100);
  const vazaoVapor_kg_s = ((energiaVapor / DELTA_H_MJ_KG) * 3600) / 1000;

  const efiEletricaCogeracao = 0.24;
  const efiEletricaCondensacao = 0.3;

  const potEletricaCogeracao = energiaVapor * efiEletricaCogeracao;
  const potEletricaCondensacao = energiaVapor * efiEletricaCondensacao;

  const kwhEletricaCogeracao = potEletricaCogeracao * (1000 / vazBagaco);
  const kwhEletricaCondensacao = potEletricaCondensacao * (1000 / vazBagaco);

  return {
    Caldeira: {
      vazaoVapor_kg_s,
      potEletricaCogeracao,
      potEletricaCondensacao,
      kwhEletricaCogeracao,
      kwhEletricaCondensacao,
    },
  };
}
