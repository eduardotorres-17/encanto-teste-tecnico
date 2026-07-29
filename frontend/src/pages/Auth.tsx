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
    <main className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <section className="max-w-md w-full bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
            </h1>
            <p className="text-gray-400 mt-2">
              {isLogin
                ? "Insira suas credenciais para acessar seus tickets."
                : "Preencha os dados abaixo para começar a usar o sistema."}
            </p>
          </div>

          {apiError && (
            <div
              role="alert"
              className="mb-6 p-4 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center"
            >
              {apiError}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5" noValidate>
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Nome Completo
                </label>
                <input
                  id="name"
                  type="text"
                  {...formik.getFieldProps("name")}
                  className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                    formik.touched.name && formik.errors.name
                      ? "border-red-500"
                      : "border-gray-700"
                  }`}
                  placeholder="João da Silva"
                  aria-invalid={formik.touched.name && !!formik.errors.name}
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="mt-1 text-sm text-red-400">
                    {formik.errors.name}
                  </p>
                ) : null}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                {...formik.getFieldProps("email")}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  formik.touched.email && formik.errors.email
                    ? "border-red-500"
                    : "border-gray-700"
                }`}
                placeholder="voce@exemplo.com.br"
                aria-invalid={formik.touched.email && !!formik.errors.email}
              />
              {formik.touched.email && formik.errors.email ? (
                <p className="mt-1 text-sm text-red-400">
                  {formik.errors.email}
                </p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                {...formik.getFieldProps("password")}
                className={`w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                  formik.touched.password && formik.errors.password
                    ? "border-red-500"
                    : "border-gray-700"
                }`}
                placeholder="••••••••"
                aria-invalid={
                  formik.touched.password && !!formik.errors.password
                }
              />
              {formik.touched.password && formik.errors.password ? (
                <p className="mt-1 text-sm text-red-400">
                  {formik.errors.password}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting
                ? "Processando..."
                : isLogin
                  ? "Entrar"
                  : "Cadastrar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                formik.resetForm();
                setApiError(null);
              }}
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors focus:outline-none focus:underline"
            >
              {isLogin
                ? "Não tem uma conta? Cadastre-se"
                : "Já tem uma conta? Faça login"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
