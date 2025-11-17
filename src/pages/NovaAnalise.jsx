import { useState } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { Eraser } from "lucide-react";

const NovaAnalise = () => {
  const [formData, setFormData] = useState({
    identificacaoAmostra: "",
    umidade: "",
    particulas: "",
    pontosPretos: "",
    cor: "",
  });

  const [status, setStatus] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLimparCampos = () => {
    setFormData({
      identificacaoAmostra: "",
      umidade: "",
      particulas: "",
      pontosPretos: "",
      cor: "",
    });
    setStatus("");
  };

  const handleRegistrarAnalise = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/analises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analise: formData.identificacaoAmostra,
          umidade: parseFloat(formData.umidade),
          particulas: parseFloat(formData.particulas),
          pontosPretos: parseFloat(formData.pontosPretos),
          cor: parseFloat(formData.cor),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus(`✅ ${data.message} | Classificação: ${data.classif}`);
        handleLimparCampos();
      } else {
        setStatus(`❌ Erro: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Erro ao conectar ao servidor.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Registro de Análises</h1>
      <h2 className="text-xl mb-6 text-gray-600">
        Registre os resultados da análise química da amostra
      </h2>

      <div className="space-y-6">
        {/* Dados da Amostra */}
        <div className="bg-white w-full rounded-md shadow p-6">
          <h2 className="text-xl font-bold mb-4">Dados da Amostra</h2>
          <label className="mb-2 font-medium">Identificação da Amostra</label>
          <Input
            type="text"
            placeholder="Ex: AM-2025-01"
            className="w-full"
            value={formData.identificacaoAmostra.toUpperCase()}
            onChange={(e) =>
              handleInputChange("identificacaoAmostra", e.target.value)
            }
          />
        </div>

        {/* Parâmetros Técnicos */}
        <div className="bg-white w-full rounded-md shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold mb-6">Parâmetros Técnicos</h2>
            <button
              onClick={handleLimparCampos}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Eraser size={20} />
              <span className="text-sm">Limpar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Input
              label="Umidade (%)"
              type="number"
              placeholder="Ex: 0.06"
              value={formData.umidade}
              onChange={(e) => handleInputChange("umidade", e.target.value)}
            />
            <Input
              label="Partículas (unid.)"
              type="number"
              placeholder="Ex: 5"
              value={formData.particulas}
              onChange={(e) => handleInputChange("particulas", e.target.value)}
            />
            <Input
              label="Pontos Pretos (unid.)"
              type="number"
              placeholder="Ex: 20"
              value={formData.pontosPretos}
              onChange={(e) =>
                handleInputChange("pontosPretos", e.target.value)
              }
            />
            <Input
              label="Cor (unid.)"
              placeholder="Ex: 150"
              type="number"
              value={formData.cor}
              onChange={(e) => handleInputChange("cor", e.target.value)}
            />
          </div>

          <Button className="w-full md:w-auto" onClick={handleRegistrarAnalise}>
            Registrar Análise
          </Button>

          {status && (
            <p className="mt-4 text-sm font-medium text-gray-700">{status}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NovaAnalise;
