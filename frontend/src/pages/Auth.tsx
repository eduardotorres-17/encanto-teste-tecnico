import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { api } from "../services/api";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    email: Yup.string()
      .email("Digite um e-mail válido")
      .required("O e-mail é obrigatório"),
    password: Yup.string()
      .min(6, "A senha deve ter pelo menos 6 caracteres")
      .required("A senha é obrigatória"),
    name: Yup.string().when([], {
      is: () => !isLogin,
      then: (schema) => schema.required("O nome é obrigatório para o cadastro"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setApiError(null);
      try {
        if (isLogin) {
          const response = await api.post("/auth/login", {
            email: values.email,
            password: values.password,
          });
          login(response.data.access_token);
        } else {
          await api.post("/users", {
            name: values.name,
            email: values.email,
            password: values.password,
          });
          const loginResponse = await api.post("/auth/login", {
            email: values.email,
            password: values.password,
          });
          login(loginResponse.data.access_token);
        }
        navigate("/tickets");
      } catch (error: any) {
        setApiError(
          error.response?.data?.message ||
            "Ocorreu um erro ao processar sua solicitação.",
        );
      }
    },
  });

  return (
    <main className="min-h-screen flex bg-zinc-950 selection:bg-emerald-500/30">
      <section className="hidden lg:flex w-1/2 bg-zinc-900 border-r border-zinc-800 flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 to-emerald-400"></div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="bg-emerald-500/10 p-5 rounded-2xl mb-8 border border-emerald-500/20 shadow-lg shadow-emerald-900/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-zinc-50 tracking-tight mb-4">
            Portal de Tickets da Encanto
          </h1>
          <p className="text-zinc-400 max-w-md text-lg">
            Abra chamados, acompanhe o status em tempo real e gerencie o suporte
            técnico com eficiência.
          </p>
        </div>
      </section>

      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold text-zinc-50 tracking-tight">
              {isLogin ? "Acessar Portal" : "Criar Conta"}
            </h2>
            <p className="text-zinc-400 mt-2 text-sm">
              {isLogin
                ? "Insira suas credenciais para gerenciar seus chamados."
                : "Preencha os dados abaixo para iniciar seu atendimento."}
            </p>
          </div>

          {apiError && (
            <div
              role="alert"
              className="mb-6 p-4 bg-red-950/40 border border-red-900/50 rounded-xl text-red-400 text-sm flex items-center gap-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-6" noValidate>
            {!isLogin && (
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Nome Completo
                </label>
                <input
                  id="name"
                  type="text"
                  {...formik.getFieldProps("name")}
                  className={`w-full px-4 py-3 bg-zinc-900/50 border rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                    formik.touched.name && formik.errors.name
                      ? "border-red-500/50 focus:ring-red-500 focus:border-red-500"
                      : "border-zinc-800"
                  }`}
                  placeholder="Seu nome"
                  aria-invalid={formik.touched.name && !!formik.errors.name}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-xs text-red-400 mt-1.5">
                    {formik.errors.name}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300"
              >
                E-mail Profissional
              </label>
              <input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                className={`w-full px-4 py-3 bg-zinc-900/50 border rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500/50 focus:ring-red-500 focus:border-red-500"
                    : "border-zinc-800"
                }`}
                placeholder="voce@empresa.com.br"
                aria-invalid={formik.touched.email && !!formik.errors.email}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-red-400 mt-1.5">
                  {formik.errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300"
              >
                Senha de Acesso
              </label>
              <input
                id="password"
                type="password"
                {...formik.getFieldProps("password")}
                className={`w-full px-4 py-3 bg-zinc-900/50 border rounded-xl text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500/50 focus:ring-red-500 focus:border-red-500"
                    : "border-zinc-800"
                }`}
                placeholder="••••••••"
                aria-invalid={
                  formik.touched.password && !!formik.errors.password
                }
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-red-400 mt-1.5">
                  {formik.errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3.5 px-4 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20 mt-4"
            >
              {formik.isSubmitting
                ? "Autenticando..."
                : isLogin
                  ? "Entrar no Sistema"
                  : "Concluir Cadastro"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                formik.resetForm();
                setApiError(null);
              }}
              className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
            >
              {isLogin ? (
                <span>
                  Não possui acesso?{" "}
                  <strong className="text-emerald-500 font-medium">
                    Solicite sua conta
                  </strong>
                </span>
              ) : (
                <span>
                  Já é cadastrado?{" "}
                  <strong className="text-emerald-500 font-medium">
                    Faça login
                  </strong>
                </span>
              )}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
