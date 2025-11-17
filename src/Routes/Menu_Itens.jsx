import { useState, useEffect } from "react";
import {
  Home,
  BarChart,
  FileText,
  Route,
  ChartPie,
  Lollipop,
  TrendingUp,
} from "lucide-react";
import Menu_Button from "../components/Menu_Button";
import { useNavigate, useLocation } from "react-router-dom";

export default function SidebarMenu() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userArea, setUserArea] = useState("");

  // Carrega a área do usuário do sessionStorage ao inicializar
  useEffect(() => {
    const usuarioLogado = sessionStorage.getItem("usuarioLogado");
    if (usuarioLogado) {
      try {
        const userData = JSON.parse(usuarioLogado);
        console.log("Dados do usuário no menu:", userData); // Debug

        // Mapeamento de áreas
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

        const area = areaMap[userData.area] || userData.area || "";
        setUserArea(area);
      } catch (error) {
        console.error("Erro ao processar dados do usuário:", error);
      }
    }
  }, []);

  const getActivePage = () => {
    const path = location.pathname;
    if (path.includes("/nova-analise")) return "documents";
    if (path.includes("/controle-estatistico")) return "cep";
    if (path.includes("/solicitacoes")) return "solicitacao";
    if (path.includes("/visualizar-analises")) return "VisulAnalises";
    return "home";
  };

  const [activePage, setActivePage] = useState(getActivePage());

  // Atualiza o estado ativo quando a location muda
  useEffect(() => {
    setActivePage(getActivePage());
  }, [location]);

  // Menu base com todas as opções
  const allMenuOptions = [
    {
      id: "home",
      label: "Início",
      icon: Home,
      path: "/home/inicio",
      areas: [
        "Laboratório",
        "Armazém",
        "Planejamento e Controle da Produção",
        "Fábrica de Açúcar",
      ],
    },
    {
      id: "documents",
      label: "Registrar Análise",
      icon: FileText,
      path: "/home/nova-analise",
      areas: ["Laboratório"], // Apenas Laboratório
    },
    {
      id: "solicitacao",
      label: "Solicitações",
      icon: Route,
      path: "/home/solicitacoes",
      areas: ["Laboratório"], // Apenas Laboratório
    },
    {
      id: "cep",
      label: "Controle Estatístico de Processo",
      icon: BarChart,
      path: "/home/controle-estatistico",
      areas: ["Planejamento e Controle da Produção"], // Apenas PCP
    },
    {
      id: "VisulAnalises",
      label: "Visualizar Análises",
      icon: ChartPie,
      path: "/home/visualizar-analises",
      areas: ["Armazém"], // Apenas Armazém
    },
    {
      id: "FabAcucar",
      label: "Produção de Açúcar",
      icon: Lollipop,
      path: "/home/producao-acucar",
      areas: ["Fábrica de Açúcar"], // Apenas Fábrica
    },
    {
      id: "PrevAcucar",
      label: "Previsibilidade de Produção",
      icon: TrendingUp,
      path: "/home/previsibilidade-acucar",
      areas: ["Fábrica de Açúcar"], // Apenas Fábrica
    },
  ];

  // Filtra as opções do menu baseado na área do usuário
  const menuOptions = allMenuOptions.filter((option) =>
    option.areas.includes(userArea)
  );

  const handleNavigation = (pageId, path) => {
    setActivePage(pageId);
    navigate(path);
  };

  return (
    <div>
      <nav className="mt-2">
        {menuOptions.map((option) => {
          const IconComponent = option.icon;
          const isActive = activePage === option.id;

          return (
            <Menu_Button
              key={option.id}
              onClick={() => handleNavigation(option.id, option.path)}
              icon={<IconComponent size={20} />}
              className={`mt-2 ${isActive ? "bg-gray-200 text-gray-800" : ""}`}
            >
              {option.label}
            </Menu_Button>
          );
        })}
      </nav>
    </div>
  );
}
