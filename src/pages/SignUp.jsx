import React from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const submitLockRef = React.useRef(false);
  const formRef = React.useRef(null);

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Digite um e-mail válido")
      .required("E-mail é obrigatório"),
    emailConf: Yup.string()
      .email("Digite um e-mail válido")
      .required("Confirmação de e-mail é obrigatória")
      .oneOf([Yup.ref("email")], "Os e-mails não são iguais"),
    senha: Yup.string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .required("Senha é obrigatória"),
    area: Yup.string().required("Área é obrigatória"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      emailConf: "",
      senha: "",
      area: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      // 🔒 Múltiplas camadas de proteção contra envios duplicados
      if (isSubmitting || submitLockRef.current) {
        console.log("🚫 Envio bloqueado - já em progresso");
        return;
      }

      try {
        // 🔒 Ativa todos os locks
        submitLockRef.current = true;
        setIsSubmitting(true);
        formik.setSubmitting(true);
        formik.setStatus("");

        console.log("📝 Tentando cadastrar usuário:", values);

        // ✅ Chamada para a API
        const response = await axios.post("http://localhost:3001/cadastrar", {
          email: values.email,
          senha: values.senha,
          area: values.area,
        });

        console.log("✅ Resposta do servidor:", response.data);

        if (response.data.success) {
          console.log("🎉 Usuário cadastrado com sucesso!");
          formik.setStatus(
            "✅ Usuário cadastrado com sucesso! Redirecionando..."
          );

          // 🔒 Previne qualquer outro envio durante o redirecionamento
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          formik.setStatus(
            response.data.message || "Erro ao cadastrar usuário"
          );
        }
      } catch (error) {
        console.error("🔴 Erro completo no cadastro:", error);

        if (error.response) {
          const errorMessage =
            error.response.data?.message || "Erro no servidor";
          formik.setStatus(errorMessage);
        } else if (error.request) {
          formik.setStatus(
            "Servidor não respondeu. Verifique se o backend está rodando."
          );
        } else {
          formik.setStatus("Erro ao processar cadastro: " + error.message);
        }
      } finally {
        // 🔓 Libera todos os locks após um delay para garantir
        setTimeout(() => {
          submitLockRef.current = false;
          setIsSubmitting(false);
          formik.setSubmitting(false);
          console.log("🔓 Locks liberados");
        }, 1000);
      }
    },
  });

  // Handler customizado para o formulário
  const handleFormSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("🖱️ Formulário submetido, verificando locks...");

    // 🔒 Verificação final antes de prosseguir
    if (isSubmitting || formik.isSubmitting || submitLockRef.current) {
      console.log("❌ Formulário bloqueado - envio em progresso");
      return;
    }

    console.log("✅ Formulário liberado para envio");
    formik.handleSubmit(e);
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
            <p>Crie sua conta</p>

            <form ref={formRef} onSubmit={handleFormSubmit} noValidate>
              <p className="mt-4">E-mail</p>
              <Input
                type="email"
                name="email"
                placeholder="Digite seu e-mail"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmitting || formik.isSubmitting}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.email}
                </div>
              )}

              <p className="mt-4">Confirme seu E-mail</p>
              <Input
                type="email"
                name="emailConf"
                placeholder="Confirme seu e-mail"
                value={formik.values.emailConf}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmitting || formik.isSubmitting}
              />
              {formik.touched.emailConf && formik.errors.emailConf && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.emailConf}
                </div>
              )}

              <p className="mt-4">Senha</p>
              <Input
                type="password"
                name="senha"
                placeholder="Digite sua senha"
                value={formik.values.senha}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmitting || formik.isSubmitting}
              />
              {formik.touched.senha && formik.errors.senha && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.senha}
                </div>
              )}

              <p className="mt-4">Área</p>
              <Input
                type="text"
                name="area"
                placeholder="Digite sua área"
                value={formik.values.area}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isSubmitting || formik.isSubmitting}
              />
              {formik.touched.area && formik.errors.area && (
                <div className="text-red-500 text-sm mt-1">
                  {formik.errors.area}
                </div>
              )}

              {formik.status && (
                <div
                  className={`text-sm mt-2 text-center ${
                    formik.status.includes("✅") ||
                    formik.status.includes("sucesso")
                      ? "text-green-600 font-medium"
                      : "text-red-500"
                  }`}
                >
                  {formik.status}
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  isSubmitting || formik.isSubmitting || submitLockRef.current
                }
                onClick={(e) => {
                  if (
                    isSubmitting ||
                    formik.isSubmitting ||
                    submitLockRef.current
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("🖱️ Clique no botão bloqueado");
                  }
                }}
              >
                {isSubmitting || formik.isSubmitting
                  ? "Cadastrando..."
                  : "Registre-se"}
              </Button>
            </form>

            <label className="block mt-4 text-center">
              Já tem uma conta?
              <strong>
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    if (isSubmitting || formik.isSubmitting) {
                      e.preventDefault();
                    }
                  }}
                >
                  &nbsp;Entre aqui
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

export default SignUp;
