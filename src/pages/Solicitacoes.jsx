import { useState, useRef, useEffect } from "react";
import Button from "../components/Button";
import Input from "../components/Input";
import { Eraser, FlaskConical } from "lucide-react";

const Solicitacoes = () => {
  const [mostrarDivOculta, setMostrarDivOculta] = useState(false);
  const [ultimaAnalise, setUltimaAnalise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");
  const [formData, setFormData] = useState({
    umidade: "",
    particulas: "",
    pontosPretos: "",
    cor: "",
    motivo: "",
  });

  const divOcultaRef = useRef(null);

  // Função para obter a cor baseada na classificação (para texto)
  const getCorClassificacao = (classificacao) => {
    switch (classificacao) {
      case "Especial 1":
        return "text-green-600";
      case "Especial 2":
        return "text-blue-600";
      case "Especial 3":
        return "text-amber-700";
      case "Standard":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Função para obter a cor HEX baseada na classificação (para o ícone)
  const getCorIcone = (classificacao) => {
    switch (classificacao) {
      case "Especial 1":
        return "#16a34a";
      case "Especial 2":
        return "#2563eb";
      case "Especial 3":
        return "#b45309";
      case "Standard":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  // ✅ NOVA FUNÇÃO: Notificar outras páginas sobre alteração
  const notificarAlteracao = () => {
    // Notifica a página de visualização (armazém)
    window.postMessage(
      {
        type: "ANALISE_ALTERADA",
        message: "Uma análise foi alterada via solicitação",
      },
      window.location.origin
    );

    // Notifica abas abertas da última análise
    window.postMessage(
      {
        type: "FORCAR_ATUALIZACAO",
      },
      window.location.origin
    );

    console.log("📢 Notificando outras páginas sobre alteração");
  };

  // Buscar a última análise do banco de dados
  useEffect(() => {
    const buscarUltimaAnalise = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "http://localhost:3001/api/ultima-analise"
        );

        if (!response.ok) {
          if (response.status === 404) {
            setUltimaAnalise(null);
            setError("Nenhuma análise encontrada no banco de dados");
            return;
          }
          throw new Error(`Erro ${response.status} ao buscar análise`);
        }

        const data = await response.json();

        if (data.success) {
          setUltimaAnalise(data);
          setError(null);
        } else {
          setUltimaAnalise(null);
          setError(data.message || "Erro ao carregar dados");
        }
      } catch (err) {
        setUltimaAnalise(null);
        setError("Erro de conexão com o servidor.");
      } finally {
        setLoading(false);
      }
    };

    buscarUltimaAnalise();
  }, []);

  const handleSolicitarAlteracao = () => {
    if (!ultimaAnalise) {
      setError("Não há análise para alterar");
      return;
    }
    setMostrarDivOculta(true);
  };

  const handleCancelar = () => {
    setFormData({
      umidade: "",
      particulas: "",
      pontosPretos: "",
      cor: "",
      motivo: "",
    });
    setMostrarDivOculta(false);
    setMensagemSucesso("");
  };

  const handleLimparCampos = () => {
    setFormData({
      umidade: "",
      particulas: "",
      pontosPretos: "",
      cor: "",
      motivo: "",
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Função para validar campos numéricos
  const validarCampoNumerico = (valor, campo) => {
    if (valor === "" || isNaN(parseFloat(valor))) {
      setError(`O campo ${campo} deve ser um número válido`);
      return false;
    }
    return true;
  };

  // ✅ ATUALIZADA: Função para enviar a alteração com notificação
  const handleEnviarAlteracao = async () => {
    if (!ultimaAnalise || !ultimaAnalise.id) {
      setError(
        "Nenhuma análise disponível para alteração ou ID não encontrado"
      );
      return;
    }

    // Validação dos campos
    if (
      !formData.umidade ||
      !formData.particulas ||
      !formData.pontosPretos ||
      !formData.cor ||
      !formData.motivo
    ) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    // Validar campos numéricos
    if (!validarCampoNumerico(formData.umidade, "Umidade")) return;
    if (!validarCampoNumerico(formData.particulas, "Partículas")) return;
    if (!validarCampoNumerico(formData.pontosPretos, "Pontos Pretos")) return;
    if (!validarCampoNumerico(formData.cor, "Cor")) return;

    if (formData.motivo.length > 200) {
      setError("O motivo deve ter no máximo 200 caracteres");
      return;
    }

    try {
      setEnviando(true);
      setError("");

      const dadosEnvio = {
        id: ultimaAnalise.id,
        analise: ultimaAnalise.analise,
        umidade: parseFloat(formData.umidade),
        particulas: parseFloat(formData.particulas),
        pontosPretos: parseFloat(formData.pontosPretos),
        cor: parseFloat(formData.cor),
        motivo: formData.motivo,
      };

      const response = await fetch(
        "http://localhost:3001/api/alterar-analise",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosEnvio),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao alterar análise");
      }

      setMensagemSucesso("Alteração enviada com sucesso!");

      // ✅ ATUALIZADO: Recarrega e notifica com mais força
      const refreshResponse = await fetch(
        "http://localhost:3001/api/ultima-analise"
      );
      if (refreshResponse.ok) {
        const newData = await refreshResponse.json();
        setUltimaAnalise(newData);

        // ✅ NOTIFICAÇÃO MAIS ROBUSTA
        window.postMessage(
          {
            type: "ANALISE_ALTERADA",
            message: "Análise alterada via solicitação",
            dados: newData,
          },
          window.location.origin
        );

        // ✅ ENVIA MÚLTIPLAS NOTIFICAÇÕES PARA GARANTIR
        setTimeout(() => {
          window.postMessage(
            {
              type: "FORCAR_ATUALIZACAO",
            },
            window.location.origin
          );
        }, 500);
      }

      // Limpar formulário e ocultar div
      setTimeout(() => {
        handleCancelar();
      }, 2000);
    } catch (err) {
      console.error("Erro ao enviar alteração:", err);
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  // Efeito para fazer scroll quando a div oculta for mostrada
  useEffect(() => {
    if (mostrarDivOculta && divOcultaRef.current) {
      divOcultaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [mostrarDivOculta]);

  // Função para exibir o valor ou estado de carregamento
  const exibirValor = (campo) => {
    if (loading) return "Carregando...";
    if (!ultimaAnalise) return "N/A";
    return ultimaAnalise[campo] || "N/A";
  };

  // Obter as cores atuais para a classificação
  const corClassificacao = ultimaAnalise
    ? getCorClassificacao(ultimaAnalise.classif)
    : "text-gray-600";

  const corIcone = ultimaAnalise
    ? getCorIcone(ultimaAnalise.classif)
    : "#6b7280";

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Solicitar Alteração</h1>
      <h2 className="text-xl mb-6 text-gray-600">
        Altere a última análise registrada
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {mensagemSucesso && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {mensagemSucesso}
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white w-full rounded-md shadow p-6">
          <div className="flex w-full justify-between">
            <h2 className="text-xl font-bold mb-4">Solicitar Alteração</h2>
            <div className="flex items-center gap-2">
              <FlaskConical size={24} color={corIcone} />
              <p className={`text-right font-bold ${corClassificacao}`}>
                {ultimaAnalise ? ultimaAnalise.classif : "Nenhuma análise"}
              </p>
            </div>
          </div>
          <div className="ml-4 mr-4 mt-4 flex gap-4 justify-between">
            <div className="bg-gray-200 px-8 py-2 rounded-md shadow flex-col w-50">
              <label className="text-[12px] text-left w-full">
                Código da Amostra
              </label>
              <h2 className="text-center mt-2 font-bold">
                {exibirValor("analise")}
              </h2>
            </div>
            <div className="bg-gray-200 px-8 py-2 rounded-md shadow flex-col w-50">
              <label className="text-[12px] text-left w-full">Umidade</label>
              <h2 className="text-center mt-2 font-bold">
                {exibirValor("umidade")}%
              </h2>
            </div>
            <div className="bg-gray-200 px-8 py-2 rounded-md shadow flex-col w-50">
              <label className="text-[12px] text-left w-full">
                Pontos Pretos
              </label>
              <h2 className="text-center mt-2 font-bold">
                {exibirValor("pontos_pretos")}
              </h2>
            </div>
            <div className="bg-gray-200 px-8 py-2 rounded-md shadow flex-col w-50">
              <label className="text-[12px] text-left w-full">Partículas</label>
              <h2 className="text-center mt-2 font-bold">
                {exibirValor("particulas")}
              </h2>
            </div>
            <div className="bg-gray-200 px-8 py-2 rounded-md shadow flex-col w-50">
              <label className="text-[12px] text-left w-full">Cor</label>
              <h2 className="text-center mt-2 font-bold">
                {exibirValor("cor")}
              </h2>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={handleSolicitarAlteracao}
              disabled={loading || !ultimaAnalise}
            >
              {loading ? "Carregando..." : "Solicitar Alteração"}
            </Button>
          </div>
        </div>

        {mostrarDivOculta && ultimaAnalise && (
          <div
            ref={divOcultaRef}
            className="bg-white w-full rounded-md shadow p-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold mb-6">Parâmetros Técnicos</h2>
              <button
                onClick={handleLimparCampos}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                title="Limpar todos os campos"
              >
                <Eraser size={20} />
                <span className="text-sm">Limpar</span>
              </button>
            </div>

            {/* Grid responsivo para os campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Umidade */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium">Umidade (%)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={`Ex: ${ultimaAnalise?.umidade || "0.03"}`}
                  className="w-full"
                  value={formData.umidade}
                  onChange={(e) => handleInputChange("umidade", e.target.value)}
                />
              </div>

              {/* Partículas */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium">
                  Partículas (unidades)
                </label>
                <Input
                  type="number"
                  placeholder={`Ex: ${ultimaAnalise?.particulas || "5"}`}
                  className="w-full"
                  value={formData.particulas}
                  onChange={(e) =>
                    handleInputChange("particulas", e.target.value)
                  }
                />
              </div>

              {/* Pontos Pretos */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium">
                  Pontos Pretos (unidades)
                </label>
                <Input
                  type="number"
                  placeholder={`Ex: ${ultimaAnalise?.pontos_pretos || "20"}`}
                  className="w-full"
                  value={formData.pontosPretos}
                  onChange={(e) =>
                    handleInputChange("pontosPretos", e.target.value)
                  }
                />
              </div>

              {/* Cor */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium">Cor (unidades)</label>
                <Input
                  type="number"
                  placeholder={`Ex: ${ultimaAnalise?.cor || "150"}`}
                  className="w-full"
                  value={formData.cor}
                  onChange={(e) => handleInputChange("cor", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col w-full mb-6">
              <label className="mb-2 font-medium">Motivo da Alteração</label>
              <textarea
                rows="4"
                cols="50"
                placeholder="Descreva o motivo da alteração (máximo 200 caracteres)..."
                className="w-full shadow border border-gray-300 rounded-md p-3"
                value={formData.motivo}
                onChange={(e) => handleInputChange("motivo", e.target.value)}
                maxLength={200}
              ></textarea>
              <div className="text-right text-sm text-gray-500 mt-1">
                {formData.motivo.length}/200 caracteres
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleEnviarAlteracao} disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar Solicitação"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleCancelar}
                disabled={enviando}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Solicitacoes;
