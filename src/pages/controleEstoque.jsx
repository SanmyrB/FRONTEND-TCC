import React, { useState } from "react";
import PastaOrganizadora from "../components/pastaOrganizadora";

export default function ControleEstoque() {
  const [activeTab, setActiveTab] = useState("info");

  return (
    <div className="p-6">
      {/* Cabeçalho */}
      <h1 className="text-2xl font-bold mb-4">
        Gestão de Estoque do Laboratório e Usina
      </h1>
      <h2 className="text-xl mb-6 text-gray-600">
        Insira a quantidade de Consumo e Entrada de Materiais
      </h2>
      <PastaOrganizadora activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
