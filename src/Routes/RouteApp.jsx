// Routes/RouteApp.jsx
import { Fragment } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";

// Importando as páginas específicas
import Inicio from "../pages/Inicio";
import NovaAnalise from "../pages/NovaAnalise";
import ControleEstatisticoProcesso from "../pages/ControleEstatisticoProcesso";
import Solicitacoes from "../pages/Solicitacoes";
import VisualizAnalise from "../pages/VisulizAnalise";
import UltimaAnalisePage from "../pages/UltimaAnalisePage";
import FabAcucar from "../pages/FabAcucar";
import PrevAcucar from "../pages/PrevAcucar";

const Private = ({ Item, allowedAreas }) => {
  // ✅ Verifica sessionStorage para manter o login durante a sessão
  const usuarioLogado = sessionStorage.getItem("usuarioLogado");

  if (!usuarioLogado) return <SignIn />;

  try {
    const userData = JSON.parse(usuarioLogado);
    console.log("Dados do usuário na rota:", userData); // Debug

    // Mapeamento de áreas para casos de valores diferentes
    const areaMap = {
      0: "Laboratório",
      1: "Armazém",
      2: "Planejamento e Controle da Produção",
      Laboratório: "Laboratório",
      Armazém: "Armazém",
      "Planejamento e Controle da Produção":
        "Planejamento e Controle da Produção",
      PCP: "Planejamento e Controle da Produção",
    };

    const userArea = areaMap[userData.area] || userData.area;

    // Se áreas específicas forem definidas e o usuário não tiver acesso
    if (allowedAreas && !allowedAreas.includes(userArea)) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-red-600">Acesso Negado</h1>
          <p className="text-gray-700">
            Você não tem permissão para acessar esta página. Sua área (
            {userArea || "Não definida"}) não possui acesso a este recurso.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Áreas permitidas: {allowedAreas.join(", ")}
          </p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      );
    }

    return <Item />;
  } catch (error) {
    console.error("Erro ao processar dados do usuário:", error);
    return <SignIn />;
  }
};

const RoutesApp = () => {
  return (
    <BrowserRouter>
      <Fragment>
        <Routes>
          {/* Rota principal Home com layout e sub-rotas */}
          <Route path="/home" element={<Private Item={Home} />}>
            {/* Início - Disponível para todas as áreas */}
            <Route
              index
              element={
                <Private
                  Item={Inicio}
                  allowedAreas={[
                    "Laboratório",
                    "Armazém",
                    "Planejamento e Controle da Produção",
                    "Fábrica de Açúcar",
                  ]}
                />
              }
            />
            <Route
              path="inicio"
              element={
                <Private
                  Item={Inicio}
                  allowedAreas={[
                    "Laboratório",
                    "Armazém",
                    "Planejamento e Controle da Produção",
                    "Fábrica de Açúcar",
                  ]}
                />
              }
            />

            {/* Nova Análise - Apenas Laboratório */}
            <Route
              path="nova-analise"
              element={
                <Private Item={NovaAnalise} allowedAreas={["Laboratório"]} />
              }
            />

            {/* Controle Estatístico - Apenas PCP */}
            <Route
              path="controle-estatistico"
              element={
                <Private
                  Item={ControleEstatisticoProcesso}
                  allowedAreas={["Planejamento e Controle da Produção"]}
                />
              }
            />

            {/* Solicitações - Apenas Laboratório */}
            <Route
              path="solicitacoes"
              element={
                <Private Item={Solicitacoes} allowedAreas={["Laboratório"]} />
              }
            />

            {/* Visualizar Análises - Apenas Armazém */}
            <Route
              path="visualizar-analises"
              element={
                <Private Item={VisualizAnalise} allowedAreas={["Armazém"]} />
              }
            />
            <Route
              path="producao-acucar"
              element={
                <Private
                  Item={FabAcucar}
                  allowedAreas={["Fábrica de Açúcar"]}
                />
              }
            />
            <Route
              path="previsibilidade-acucar"
              element={
                <Private
                  Item={PrevAcucar}
                  allowedAreas={["Fábrica de Açúcar"]}
                />
              }
            />
          </Route>

          {/* Rota independente para Última Análise (não está dentro de /home) */}
          <Route path="/ultima-analise" element={<UltimaAnalisePage />} />

          {/* Rotas públicas */}
          <Route path="/" element={<SignIn />} />
          <Route exact path="/signup" element={<SignUp />} />
          <Route path="*" element={<SignIn />} />
        </Routes>
      </Fragment>
    </BrowserRouter>
  );
};

export default RoutesApp;
