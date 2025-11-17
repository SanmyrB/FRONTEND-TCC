import { useState, useEffect, useRef } from "react";
import { FlaskConical, Bell, X, ExternalLink, RefreshCw } from "lucide-react";

const VisualizAnalise = () => {
  const [ultimaAnalise, setUltimaAnalise] = useState(null);
  const [analisesDia, setAnalisesDia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAnalisesDia, setLoadingAnalisesDia] = useState(true);
  const [error, setError] = useState(null);

  const [notificacao, setNotificacao] = useState(null);
  const [ultimoIdVerificado, setUltimoIdVerificado] = useState(null);
  const [ultimosValoresVerificados, setUltimosValoresVerificados] =
    useState(null);
  const [verificando, setVerificando] = useState(false);
  const [jaCarregouInicialmente, setJaCarregouInicialmente] = useState(false);

  const intervaloRef = useRef(null);

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

  // ✅ FUNÇÃO: Comparar se os valores da análise mudaram
  const valoresMudaram = (novaAnalise, analiseAnterior) => {
    if (!analiseAnterior || !novaAnalise) return true;

    const camposParaComparar = [
      "umidade",
      "particulas",
      "pontos_pretos",
      "cor",
      "classif",
    ];

    return camposParaComparar.some((campo) => {
      const valorAntigo = analiseAnterior[campo];
      const valorNovo = novaAnalise[campo];

      return valorAntigo !== valorNovo;
    });
  };

  // ✅ FUNÇÃO: Mostrar notificação (centralizada)
  const mostrarNotificacao = (mensagem = "Novos dados disponíveis!") => {
    // Só mostra notificação se já carregou inicialmente
    if (jaCarregouInicialmente && !notificacao) {
      setNotificacao({
        mensagem: mensagem,
        quantidade: 1,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const buscarUltimaAnalise = async (silencioso = false) => {
    try {
      if (!silencioso) {
        setLoading(true);
      }

      const response = await fetch("http://localhost:3001/api/ultima-analise");

      if (!response.ok) {
        if (response.status === 404) {
          setUltimaAnalise(null);
          if (!silencioso) {
            setError("Nenhuma análise encontrada no banco de dados");
          }
          return;
        }
        throw new Error(`Erro ${response.status} ao buscar análise`);
      }

      const data = await response.json();

      if (data.success) {
        // ✅ VERIFICA SE HOUVE MUDANÇA NOS VALORES (SEM NOTIFICAR AQUI)
        const houveMudanca = valoresMudaram(data, ultimaAnalise);

        setUltimaAnalise(data);

        if (data.id && data.id !== ultimoIdVerificado) {
          setUltimoIdVerificado(data.id);
        }

        // ✅ ATUALIZA OS VALORES VERIFICADOS
        if (data.id) {
          setUltimosValoresVerificados({
            id: data.id,
            umidade: data.umidade,
            particulas: data.particulas,
            pontos_pretos: data.pontos_pretos,
            cor: data.cor,
            classif: data.classif,
            analise: data.analise,
          });
        }

        if (!silencioso) {
          setError(null);
        }

        // ✅ REMOVIDO: Não mostra notificação aqui para evitar duplicação
      } else {
        setUltimaAnalise(null);
        if (!silencioso) {
          setError(data.message || "Erro ao carregar dados");
        }
      }
    } catch (err) {
      setUltimaAnalise(null);
      if (!silencioso) {
        setError("Erro de conexão com o servidor.");
      }
    } finally {
      if (!silencioso) {
        setLoading(false);
      }
    }
  };

  const buscarAnalisesDia = async () => {
    try {
      setLoadingAnalisesDia(true);

      const response = await fetch("http://localhost:3001/api/analises-dia");

      if (!response.ok) {
        if (response.status === 404) {
          setAnalisesDia([]);
          return;
        }
        throw new Error(`Erro ${response.status} ao buscar análises do dia`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalisesDia(data.analises || []);
      } else {
        setAnalisesDia([]);
      }
    } catch (err) {
      setAnalisesDia([]);
    } finally {
      setLoadingAnalisesDia(false);
    }
  };

  // ✅ FUNÇÃO ÚNICA: Verifica mudanças e mostra notificação (apenas aqui)
  const verificarNovasAnalises = async () => {
    if (verificando) return;

    try {
      setVerificando(true);

      const response = await fetch("http://localhost:3001/api/ultima-analise");

      if (!response.ok) {
        throw new Error(`Erro ${response.status} ao verificar análises`);
      }

      const data = await response.json();

      if (data.success && data.id) {
        // ✅ COMPARA OS VALORES ATUAIS COM OS ÚLTIMOS VERIFICADOS
        const houveMudanca = valoresMudaram(data, ultimosValoresVerificados);

        if (houveMudanca && jaCarregouInicialmente) {
          console.log("🔔 Mudança detectada - Mostrando notificação");

          // ✅ ÚNICO LOCAL ONDE A NOTIFICAÇÃO É MOSTRADA
          mostrarNotificacao("Novos dados disponíveis!");

          // ✅ ATUALIZA OS DADOS LOCALMENTE (silenciosamente)
          setUltimaAnalise(data);
          setUltimoIdVerificado(data.id);
          setUltimosValoresVerificados({
            id: data.id,
            umidade: data.umidade,
            particulas: data.particulas,
            pontos_pretos: data.pontos_pretos,
            cor: data.cor,
            classif: data.classif,
            analise: data.analise,
          });
        }
      }
    } catch (err) {
      console.error("Erro ao verificar análises:", err);
    } finally {
      setVerificando(false);
    }
  };

  const atualizarDados = async () => {
    setNotificacao(null);

    try {
      await Promise.all([buscarUltimaAnalise(), buscarAnalisesDia()]);

      // Notifica abas abertas da última análise
      if (ultimaAnalise) {
        if (window.opener) {
          window.opener.postMessage(
            {
              type: "ATUALIZAR_ULTIMA_ANALISE",
              dados: ultimaAnalise,
            },
            window.location.origin
          );
        }

        if (window.opener) {
          window.opener.postMessage(
            {
              type: "FORCAR_ATUALIZACAO",
            },
            window.location.origin
          );
        }

        window.postMessage(
          {
            type: "FORCAR_ATUALIZACAO",
          },
          window.location.origin
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    }
  };

  const abrirUltimaAnalise = () => {
    if (!ultimaAnalise) return;

    const dados = encodeURIComponent(JSON.stringify(ultimaAnalise));
    const url = `/ultima-analise?dados=${dados}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // ✅ LISTENER SIMPLIFICADO: Apenas dispara verificação
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === "SOLICITAR_DADOS_ATUALIZADOS") {
        if (ultimaAnalise && event.source) {
          event.source.postMessage(
            {
              type: "ATUALIZAR_ULTIMA_ANALISE",
              dados: ultimaAnalise,
            },
            event.origin
          );
        }
      }

      // ✅ Quando recebe notificação de alteração, verifica mudanças
      if (event.data && event.data.type === "ANALISE_ALTERADA") {
        console.log("📢 Notificação recebida - Verificando mudanças...");
        verificarNovasAnalises();
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [ultimaAnalise]);

  // ✅ CARREGAMENTO INICIAL
  useEffect(() => {
    const carregarInicial = async () => {
      await buscarUltimaAnalise();
      await buscarAnalisesDia();
      setJaCarregouInicialmente(true);
    };

    carregarInicial();
  }, []);

  // ✅ CONFIGURA VERIFICAÇÃO PERIÓDICA (após carregamento inicial)
  useEffect(() => {
    if (!jaCarregouInicialmente) return;

    console.log("⏰ Configurando verificação automática...");

    intervaloRef.current = setInterval(() => {
      verificarNovasAnalises();
    }, 30000);

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current);
      }
    };
  }, [jaCarregouInicialmente, ultimosValoresVerificados]);

  // ✅ INICIALIZA OS VALORES VERIFICADOS
  useEffect(() => {
    if (ultimaAnalise && !ultimosValoresVerificados) {
      setUltimosValoresVerificados({
        id: ultimaAnalise.id,
        umidade: ultimaAnalise.umidade,
        particulas: ultimaAnalise.particulas,
        pontos_pretos: ultimaAnalise.pontos_pretos,
        cor: ultimaAnalise.cor,
        classif: ultimaAnalise.classif,
        analise: ultimaAnalise.analise,
      });
    }
  }, [ultimaAnalise, ultimosValoresVerificados]);

  const exibirValor = (campo) => {
    if (loading) return "Carregando...";
    if (!ultimaAnalise) return "N/A";
    return ultimaAnalise[campo] || "N/A";
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
      });
    } catch (error) {
      return dataString;
    }
  };

  const corClassificacao = ultimaAnalise
    ? getCorClassificacao(ultimaAnalise.classif)
    : "text-gray-600";

  const corIcone = ultimaAnalise
    ? getCorIcone(ultimaAnalise.classif)
    : "#6b7280";

  return (
    <div className="p-6 relative">
      {notificacao && (
        <div className="fixed top-4 right-4 z-50 bg-red-700 text-gray-50 p-4 rounded-lg shadow-lg max-w-sm animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span className="font-semibold">Novos Dados!</span>
            </div>
            <button
              onClick={() => setNotificacao(null)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mb-3">{notificacao.mensagem}</p>
          <div className="flex gap-2">
            <button
              onClick={atualizarDados}
              className="flex-1 bg-white text-blue-600 py-2 px-3 rounded font-medium hover:bg-gray-100 transition-colors text-sm flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar Dados
            </button>
            <button
              onClick={abrirUltimaAnalise}
              className="flex-1 bg-green-500 text-white py-2 px-3 rounded font-medium hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-1"
              disabled={!ultimaAnalise}
            >
              <ExternalLink className="w-4 h-4" />
              Ver Detalhes
            </button>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Visualizador de Análises</h1>
      <h2 className="text-xl mb-6 text-gray-600">
        Visualize todas as análises registradas
      </h2>

      <div className="space-y-6">
        <div className="bg-white w-full rounded-md shadow p-6">
          <div className="flex w-full justify-between">
            <h2 className="text-xl font-bold mb-4">Última Análise</h2>
            <div className="flex items-center gap-2">
              <FlaskConical size={24} color={corIcone} />
              <p className={`text-right font-bold ${corClassificacao}`}>
                {ultimaAnalise ? ultimaAnalise.classif : "Nenhuma análise"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

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

          {ultimaAnalise && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Data da análise: {formatarData(ultimaAnalise.data)}
              <br />
              <button
                onClick={abrirUltimaAnalise}
                className="mt-2 text-blue-600 hover:text-blue-800 flex items-center gap-1 justify-center mx-auto"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir em nova janela
              </button>
            </div>
          )}
        </div>

        <div className="bg-white w-full rounded-md shadow p-6">
          <h2 className="text-xl font-bold mb-4">Análises do Dia</h2>
          {loadingAnalisesDia ? (
            <div className="text-center py-4">
              <p>Carregando análises do dia...</p>
            </div>
          ) : analisesDia.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">
                Nenhuma análise encontrada para o dia de hoje.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Código
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Umidade
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Partículas
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Pontos Pretos
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Cor
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Classificação
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">
                      Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analisesDia.map((analise, index) => (
                    <tr
                      key={analise.id_analise || index}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {analise.analise || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {analise.umidade}%
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {analise.particulas}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {analise.pontos_pretos}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{analise.cor}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-medium ${getCorClassificacao(
                            analise.classif
                          )}`}
                        >
                          {analise.classif || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatarData(analise.data)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualizAnalise;
