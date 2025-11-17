import { X } from "lucide-react";

/**
 * Modal para exibir detalhes de forma organizada e responsiva
 *
 * @param {Object} props
 * @param {string} props.titulo - Título do modal
 * @param {Object} props.dados - Dados a serem exibidos no modal
 * @param {Function} props.onClose - Função para fechar o modal
 * @param {string} props.size - Tamanho do modal (sm, md, lg, xl)
 * @param {boolean} props.mostrarVazios - Se deve mostrar campos com valores vazios
 */
const ModalDetalhes = ({
  titulo,
  dados,
  onClose,
  size = "lg",
  mostrarVazios = false,
}) => {
  if (!dados) return null;

  // Tamanhos do modal
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  /**
   * Formata o valor para exibição
   */
  const formatarValor = (valor) => {
    if (valor === null || valor === undefined || valor === "") {
      return "N/A";
    }

    // Se for array, junta com seta
    if (Array.isArray(valor)) {
      return valor.map((item) => formatarValor(item)).join(" → ");
    }

    // Se for objeto, formata como string
    if (typeof valor === "object") {
      return JSON.stringify(valor, null, 2);
    }

    // Se for número, formata com casas decimais apropriadas
    if (typeof valor === "number") {
      // Para valores muito pequenos, mostra mais casas decimais
      if (Math.abs(valor) < 0.001) {
        return valor.toExponential(4);
      }
      // Para valores comuns, 2-4 casas decimais
      if (Math.abs(valor) < 10) {
        return valor.toFixed(4);
      }
      if (Math.abs(valor) < 100) {
        return valor.toFixed(2);
      }
      return valor.toFixed(1);
    }

    // Se for string, tenta converter para número se possível
    if (typeof valor === "string") {
      const num = parseFloat(valor);
      if (!isNaN(num)) {
        return formatarValor(num);
      }
    }

    return valor.toString();
  };

  /**
   * Formata a chave para um label mais legível
   */
  const formatarChave = (chave) => {
    return chave
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
  };

  /**
   * Determina a cor da badge baseada no tipo de dado
   */
  const getTipoBadge = (valor, chave) => {
    if (Array.isArray(valor)) {
      return "bg-blue-100 text-blue-800";
    }

    if (typeof valor === "number") {
      if (
        chave.toLowerCase().includes("temperatura") ||
        chave.toLowerCase().includes("temp")
      ) {
        return "bg-red-100 text-red-800";
      }
      if (
        chave.toLowerCase().includes("vazao") ||
        chave.toLowerCase().includes("vazão")
      ) {
        return "bg-green-100 text-green-800";
      }
      if (
        chave.toLowerCase().includes("brix") ||
        chave.toLowerCase().includes("pol")
      ) {
        return "bg-yellow-100 text-yellow-800";
      }
      if (
        chave.toLowerCase().includes("pressao") ||
        chave.toLowerCase().includes("pressão")
      ) {
        return "bg-purple-100 text-purple-800";
      }
      return "bg-gray-100 text-gray-800";
    }

    return "bg-gray-100 text-gray-800";
  };

  /**
   * Filtra os dados para remover valores vazios se necessário
   */
  const dadosFiltrados = mostrarVazios
    ? Object.entries(dados)
    : Object.entries(dados).filter(([_, valor]) => {
        if (valor === null || valor === undefined || valor === "") return false;
        if (Array.isArray(valor) && valor.length === 0) return false;
        if (typeof valor === "object" && Object.keys(valor).length === 0)
          return false;
        return true;
      });

  // Agrupa dados por categoria baseado nas chaves
  const dadosAgrupados = {
    "Informações Principais": dadosFiltrados.filter(
      ([chave]) =>
        chave.toLowerCase().includes("vazão") ||
        chave.toLowerCase().includes("vazao") ||
        chave.toLowerCase().includes("brix") ||
        chave.toLowerCase().includes("pol") ||
        chave.toLowerCase().includes("principal")
    ),
    Temperaturas: dadosFiltrados.filter(
      ([chave]) =>
        chave.toLowerCase().includes("temperatura") ||
        chave.toLowerCase().includes("temp")
    ),
    "Pressões e Perdas": dadosFiltrados.filter(
      ([chave]) =>
        chave.toLowerCase().includes("pressão") ||
        chave.toLowerCase().includes("pressao") ||
        chave.toLowerCase().includes("perda") ||
        chave.toLowerCase().includes("sangria")
    ),
    "Vapor e Calor": dadosFiltrados.filter(
      ([chave]) =>
        chave.toLowerCase().includes("vapor") ||
        chave.toLowerCase().includes("calor") ||
        chave.toLowerCase().includes("injeção") ||
        chave.toLowerCase().includes("injecao")
    ),
    "Listas e Arrays": dadosFiltrados.filter(
      ([chave, valor]) =>
        Array.isArray(valor) &&
        !chave.toLowerCase().includes("temperatura") &&
        !chave.toLowerCase().includes("pressão") &&
        !chave.toLowerCase().includes("pressao")
    ),
    "Outras Informações": dadosFiltrados.filter(
      ([chave]) =>
        !chave.toLowerCase().includes("vazão") &&
        !chave.toLowerCase().includes("vazao") &&
        !chave.toLowerCase().includes("brix") &&
        !chave.toLowerCase().includes("pol") &&
        !chave.toLowerCase().includes("temperatura") &&
        !chave.toLowerCase().includes("temp") &&
        !chave.toLowerCase().includes("pressão") &&
        !chave.toLowerCase().includes("pressao") &&
        !chave.toLowerCase().includes("perda") &&
        !chave.toLowerCase().includes("sangria") &&
        !chave.toLowerCase().includes("vapor") &&
        !chave.toLowerCase().includes("calor") &&
        !chave.toLowerCase().includes("injeção") &&
        !chave.toLowerCase().includes("injecao")
    ),
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{titulo}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {dadosFiltrados.length}{" "}
              {dadosFiltrados.length === 1 ? "item" : "itens"} encontrados
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-200 flex-shrink-0"
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {Object.entries(dadosAgrupados).map(([categoria, itens]) => {
              if (itens.length === 0) return null;

              return (
                <div key={categoria} className="mb-8 last:mb-0">
                  <h4 className="text-lg font-medium text-gray-700 mb-4 pb-2 border-b border-gray-200">
                    {categoria}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {itens.map(([chave, valor]) => (
                      <div
                        key={chave}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-700 text-sm">
                            {formatarChave(chave)}
                          </h5>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getTipoBadge(
                              valor,
                              chave
                            )}`}
                          >
                            {Array.isArray(valor)
                              ? `Array (${valor.length})`
                              : typeof valor}
                          </span>
                        </div>

                        <div className="mt-2">
                          {Array.isArray(valor) ? (
                            <div>
                              <p className="text-lg font-semibold text-gray-900 break-all">
                                {formatarValor(valor)}
                              </p>
                              {valor.length > 0 && (
                                <div className="mt-2 text-xs text-gray-500">
                                  <span className="font-medium">Itens: </span>
                                  {valor.slice(0, 3).map((item, index) => (
                                    <span key={index}>
                                      {formatarValor(item)}
                                      {index < Math.min(valor.length - 1, 2)
                                        ? ", "
                                        : ""}
                                    </span>
                                  ))}
                                  {valor.length > 3 && (
                                    <span>... (+{valor.length - 3})</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-lg font-semibold text-gray-900 break-all">
                              {formatarValor(valor)}
                            </p>
                          )}
                        </div>

                        {/* Informações adicionais para arrays */}
                        {Array.isArray(valor) && valor.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>
                                Mín:{" "}
                                <strong>
                                  {formatarValor(Math.min(...valor))}
                                </strong>
                              </span>
                              <span>
                                Máx:{" "}
                                <strong>
                                  {formatarValor(Math.max(...valor))}
                                </strong>
                              </span>
                              <span>
                                Média:{" "}
                                <strong>
                                  {formatarValor(
                                    valor.reduce((a, b) => a + b, 0) /
                                      valor.length
                                  )}
                                </strong>
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Mensagem quando não há dados */}
            {dadosFiltrados.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📊</div>
                <h4 className="text-lg font-medium text-gray-600 mb-2">
                  Nenhum dado disponível
                </h4>
                <p className="text-gray-500">
                  Não há informações para exibir nesta seção.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalhes;
