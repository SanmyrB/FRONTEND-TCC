import { useState, useEffect, useRef } from "react";
import { FlaskConical, Home, RefreshCw } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

const UltimaAnalisePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());
  const [error, setError] = useState(null);

  const dadosRecebidosRef = useRef(false);

  const carregarAnalise = async (dadosExternos = null) => {
    try {
      setLoading(true);
      setError(null);

      // ✅ CORREÇÃO: Se recebeu dados externos, usa eles diretamente
      if (dadosExternos) {
        console.log("📨 Usando dados externos:", dadosExternos);
        setAnalise(dadosExternos);
        setUltimaAtualizacao(new Date());
        setLoading(false);
        return;
      }

      // ✅ CORREÇÃO: Tenta carregar da URL primeiro (quando abre via link)
      const dadosUrl = searchParams.get("dados");
      if (dadosUrl && !dadosRecebidosRef.current) {
        try {
          const dadosDecodificados = JSON.parse(decodeURIComponent(dadosUrl));
          console.log("📄 Usando dados da URL:", dadosDecodificados);
          setAnalise(dadosDecodificados);
          dadosRecebidosRef.current = true;
          setLoading(false);
          return;
        } catch (urlError) {
          console.error("Erro ao decodificar dados da URL:", urlError);
          // Continua para buscar do servidor
        }
      }

      // ✅ CORREÇÃO: Busca do servidor com tratamento de erro melhorado
      console.log("🔍 Buscando dados do servidor...");
      const response = await fetch("http://localhost:3001/api/ultima-analise");

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Dados do servidor:", data);

        if (data.success) {
          setAnalise(data);
          setUltimaAtualizacao(new Date());
        } else {
          setError("Nenhuma análise encontrada no servidor");
        }
      } else {
        if (response.status === 404) {
          setError("Nenhuma análise encontrada no servidor");
        } else {
          setError(`Erro ${response.status} ao buscar análise`);
        }
      }
    } catch (error) {
      console.error("❌ Erro ao carregar análise:", error);
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      console.log("📨 Mensagem recebida:", event.data);

      if (event.data && event.data.type === "ATUALIZAR_ULTIMA_ANALISE") {
        console.log("🔄 Recebendo dados atualizados da aba principal");
        carregarAnalise(event.data.dados);
      }

      if (event.data && event.data.type === "FORCAR_ATUALIZACAO") {
        console.log("🔄 Forçando atualização via mensagem");
        carregarAnalise();
      }

      // ✅ NOVO: Escuta notificações de alteração
      if (event.data && event.data.type === "ANALISE_ALTERADA") {
        console.log("📢 Recebida notificação de alteração de análise");
        carregarAnalise();
      }
    };

    window.addEventListener("message", handleMessage);

    // ✅ CORREÇÃO: Solicita dados iniciais da aba principal apenas se for uma aba filha
    if (window.opener) {
      console.log("👶 Esta é uma aba filha, solicitando dados...");
      window.opener.postMessage(
        { type: "SOLICITAR_DADOS_ATUALIZADOS" },
        window.location.origin
      );

      // ✅ Timeout de segurança para caso não receba resposta
      setTimeout(() => {
        if (loading && !analise) {
          console.log("⏰ Timeout: buscando dados do servidor...");
          carregarAnalise();
        }
      }, 3000);
    } else {
      console.log("🖥️ Esta é uma aba independente, buscando dados...");
      // Se não for uma aba filha, busca diretamente do servidor
      carregarAnalise();
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const intervalo = setInterval(() => {
      console.log("🔄 Atualização automática...");
      carregarAnalise();
    }, 30000);

    return () => clearInterval(intervalo);
  }, [autoRefresh]);

  const forcarAtualizacao = async () => {
    console.log("🔄 Forçando atualização manual...");
    await carregarAnalise();
  };

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

  const formatarData = (dataString) => {
    if (!dataString) return "N/A";
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (error) {
      return dataString;
    }
  };

  // ✅ CORREÇÃO: Melhor tratamento de estados de loading e erro
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Carregando análise...</p>
          <p className="text-sm text-gray-500 mt-2">
            {window.opener
              ? "Conectando com aba principal..."
              : "Buscando dados do servidor..."}
          </p>
        </div>
      </div>
    );
  }

  if (error && !analise) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={forcarAtualizacao}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => navigate("/home/visualizar-analises")}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Voltar para Visualização
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analise) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Nenhuma análise encontrada</p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={forcarAtualizacao}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={() => navigate("/home/visualizar-analises")}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Voltar para Visualização
            </button>
          </div>
        </div>
      </div>
    );
  }

  const corIcone = getCorIcone(analise.classif);
  const corClassificacao = getCorClassificacao(analise.classif);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Última Análise</h1>
            <p className="text-gray-600">Visualização em tempo real</p>
            <p className="text-sm text-gray-500">
              {window.opener
                ? "🔗 Conectado com aba principal"
                : "📱 Visualização independente"}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded flex items-center gap-2 ${
                autoRefresh
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              } transition-colors`}
            >
              <RefreshCw className="w-4 h-4" />
              Auto: {autoRefresh ? "ON" : "OFF"}
            </button>
            <button
              onClick={forcarAtualizacao}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <button
              onClick={() => navigate("/home/visualizar-analises")}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Voltar
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700">
                Código: {analise.analise}
              </h2>
              <p className="text-gray-500">
                Data da análise: {formatarData(analise.data)}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
              <FlaskConical size={28} color={corIcone} />
              <span className={`text-xl font-bold ${corClassificacao}`}>
                {analise.classif}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-1">
                Umidade
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {analise.umidade}%
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-800 mb-1">
                Partículas
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {analise.particulas}
              </p>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                Pontos Pretos
              </h3>
              <p className="text-2xl font-bold text-amber-600">
                {analise.pontos_pretos}
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="text-sm font-medium text-purple-800 mb-1">Cor</h3>
              <p className="text-2xl font-bold text-purple-600">
                {analise.cor}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Última atualização:{" "}
                  {ultimaAtualizacao.toLocaleTimeString("pt-BR")}
                </p>
                <p className="text-xs text-gray-500">
                  {autoRefresh
                    ? "Atualização automática ativa (30s)"
                    : "Atualização manual via notificação"}
                </p>
              </div>
              <button
                onClick={forcarAtualizacao}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UltimaAnalisePage;
