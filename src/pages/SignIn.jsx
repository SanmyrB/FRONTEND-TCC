import Button from "../components/Button";
import Input from "../components/Input";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import axios from "axios";

const SignIn = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Digite um e-mail válido")
      .required("E-mail é obrigatório"),
    senha: Yup.string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .required("Senha é obrigatória"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      senha: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        formik.setSubmitting(true);
        formik.setStatus(""); // Limpa erros anteriores

        console.log("🔐 Enviando login...");

        // ✅ Chamada direta para a API de login
        const response = await axios.post("http://localhost:3001/login", {
          email: values.email,
          senha: values.senha,
        });

        // ✅ LOGS SEGUROS - sem mostrar dados sensíveis
        console.log("✅ Login bem-sucedido!");
        console.log("📋 Status da resposta:", response.status);

        if (response.data && response.data.success) {
          const apiResponse = response.data;
          const userData = apiResponse.data;

          // ✅ Log seguro - apenas informações não sensíveis
          console.log("👤 Usuário autenticado com área:", userData.area);

          // ✅ Prepara os dados para salvar
          const userInfo = {
            id: userData.id || "unknown",
            email: userData.email,
            area: userData.area || "Laboratório",
            nome: userData.email.split("@")[0],
          };

          console.log("💾 Salvando dados do usuário na sessão");

          // ✅ Salva no sessionStorage
          sessionStorage.setItem("usuarioLogado", JSON.stringify(userInfo));

          console.log("🎉 Redirecionando para página inicial...");
          formik.setStatus("✅ Login bem-sucedido! Redirecionando...");

          // Pequeno delay para mostrar a mensagem de sucesso
          setTimeout(() => {
            navigate("/home/inicio");
          }, 1000);
        } else {
          const errorMessage =
            response.data?.message || "Credenciais inválidas";
          formik.setStatus(`❌ ${errorMessage}`);
        }
      } catch (error) {
        console.error("🔴 Erro no login");

        if (error.response) {
          // ✅ Log seguro de erro
          const errorMessage =
            error.response.data?.message || "Erro no servidor";
          console.log("📋 Status do erro:", error.response.status);
          formik.setStatus(`❌ ${errorMessage}`);
        } else if (error.request) {
          formik.setStatus(
            "❌ Servidor não respondeu. Verifique se o backend está rodando."
          );
        } else {
          formik.setStatus(`❌ Erro: ${error.message}`);
        }
      } finally {
        formik.setSubmitting(false);
      }
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-[40%] bg-gray-200 p-[50px] flex flex-col justify-center align-center">
        <div>
          <div className="bg-white rounded-md shadow p-4 items-center w-[90%]">
            <img
              src="./public/img/Logo_Usina.png"
              alt="Logo Usina"
              className="mb-4"
            />
            <p>Entre com sua conta</p>
            <form onSubmit={formik.handleSubmit}>
              <p className="mt-4">E-mail</p>
              <Input
                type="email"
                name="email"
                placeholder="Digite seu e-mail"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </div>
              )}

              <p className="mt-4">Senha</p>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="senha"
                  placeholder="Digite sua senha"
                  value={formik.values.senha}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m9.02 9.02l3.411 3.411M9.88 9.88l-3.41-3.41m9.02 9.02l-3.41 3.41"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.senha && formik.errors.senha && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.senha}
                </div>
              )}

              {formik.status && (
                <div
                  className={`text-sm mt-2 text-center ${
                    formik.status.includes("✅") ||
                    formik.status.includes("bem-sucedido")
                      ? "text-green-600 font-medium"
                      : "text-red-500"
                  }`}
                >
                  {formik.status}
                </div>
              )}

              <Button
                className="mt-5"
                type="submit"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Entrando..." : "Entrar"}
              </Button>
            </form>
            <label className="block mt-4 text-center">
              Não tem uma conta?
              <strong>
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-800"
                >
                  &nbsp;Registre-se
                </Link>
              </strong>
            </label>
          </div>
        </div>
      </aside>
      <main className="flex-1 bg-gray-400">
        <img
          src="./public/img/imagem_fundo.jpg"
          alt="Usina"
          className="w-full h-full object-cover"
        />
      </main>
    </div>
  );
};

export default SignIn;
