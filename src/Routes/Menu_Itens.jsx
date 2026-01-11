import { useState, useEffect } from "react";
import {
  Home,
  BarChart,
  FileText,
  Route,
  ChartPie,
  Lollipop,
  TrendingUp,
  LibraryBig,
  Zap,
  Droplets,
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
        const area = userData.area || "";
        setUserArea(area);
      } catch {
        // Erro ao processar dados do usuário
      }
    }
  }, []);

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
        "Caldeira",
        "Destilaria",
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
    {
      id: "Estoque",
      label: "Gestão de Estoque",
      icon: LibraryBig,
      path: "/home/gestao-estoque",
      areas: ["Planejamento e Controle da Produção"],
    },
    {
      id: "FabVap",
      label: "Produção de Vapor",
      icon: Zap,
      path: "/home/producao-vapor",
      areas: ["Caldeira"],
    },
    {
      id: "PrevVap",
      label: "Previsibilidade de Vapor",
      icon: TrendingUp,
      path: "/home/previsibilidade-vapor",
      areas: ["Caldeira"],
    },
    {
      id: "fabDest",
      label: "Produção de Álcool",
      icon: Droplets,
      path: "/home/producao-destilaria",
      areas: ["Destilaria"],
    },
    {
      id: "prevDest",
      label: "Previsibilidade de Álcool",
      icon: TrendingUp,
      path: "/home/previsibilidade-destilaria",
      areas: ["Destilaria"],
    },
  ];

  // Filtra as opções do menu baseado na área do usuário
  const menuOptions = allMenuOptions.filter((option) =>
    option.areas.includes(userArea)
  );

  const handleNavigation = (pageId, path) => {
    navigate(path);
  };

  return (
    <div>
      <nav className="mt-2">
        {menuOptions.map((option) => {
          const IconComponent = option.icon;
          const isActive = location.pathname === option.path;

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
