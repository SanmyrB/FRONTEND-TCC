import { useNavigate } from "react-router-dom";
import Menu_Itens from "../Routes/Menu_Itens";
import Button from "./Button";
import { LogOut } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // ✅ Limpa sessionStorage
    sessionStorage.removeItem("usuarioLogado");
    sessionStorage.removeItem("userEmail");

    // ✅ Limpa qualquer resquício de localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    console.log("🚪 Usuário deslogado com sucesso");

    // ✅ Redireciona para a página de login
    navigate("/");
  };

  return (
    <aside className="flex flex-col bg-white h-screen w-[20%] p-6 shadow-md sticky top-0">
      {/* Header - fixo no topo */}
      <div className="shrink-0">
        <img
          src="../public/img/Logo_Usina.png"
          alt="Logo Usina"
          className="mb-4"
        />
        <div className="linha-horizontal w-full h-px bg-gray-300 my-4"></div>
      </div>

      {/* Informações do usuário */}
      <div className="shrink-0 mb-6">
        <div className="info-login text-sm text-gray-700 w-full bg-gray-200 rounded-2xl shadow p-4 font-bold">
          <div>Usuário:</div>
          <div>ID:</div>
          <div>Função:</div>
        </div>
      </div>

      {/* Área do menu com altura flexível e scroll se necessário */}
      <div className="flex-1 overflow-y-auto">
        <Menu_Itens />
      </div>

      {/* Logout - sempre fixo no final */}
      <div className="shrink-0 mt-auto pt-4 text-[14px]">
        <Button icon={<LogOut size={20} />} onClick={handleLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
