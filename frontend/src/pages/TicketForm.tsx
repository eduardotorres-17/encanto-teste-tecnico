import { useNavigate, Link, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { api } from "../services/api";
import { useState, useEffect } from "react";
import {
  TrashIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";

const TicketSchema = Yup.object().shape({
  title: Yup.string()
    .min(5, "O título deve ter pelo menos 5 caracteres")
    .required("O título é obrigatório"),
  description: Yup.string()
    .min(10, "Descreva com detalhes (mínimo 10 caracteres)")
    .required("A descrição é obrigatória"),
  priority: Yup.string()
    .oneOf(["LOW", "MEDIUM", "HIGH"])
    .required("A prioridade é obrigatória"),
  status: Yup.string().oneOf(["OPEN", "IN_PROGRESS", "CLOSED"]),
});

export default function TicketForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [initialValues, setInitialValues] = useState({
    title: "",
    description: "",
    priority: "LOW",
    status: "OPEN",
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("@encanto-theme");
    const isDark = savedTheme ? savedTheme === "dark" : true;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    if (isEditing) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setInitialValues({
        title: response.data.title,
        description: response.data.description,
        priority: response.data.priority,
        status: response.data.status,
      });
    } catch (err) {
      setSubmitError("Erro ao carregar os dados do ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: any,
  ) => {
    try {
      setSubmitError(null);
      const payload: any = { ...values };
      if (!isEditing || user?.role !== "support") {
        delete payload.status;
      }

      if (isEditing) {
        await api.patch(`/tickets/${id}`, payload);
      } else {
        await api.post("/tickets", payload);
      }
      navigate("/tickets");
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || "Erro ao salvar o ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/tickets/${id}`);
      navigate("/tickets");
    } catch (err) {
      setSubmitError("Erro ao excluir o ticket.");
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] flex justify-center items-center">
        <p className="text-emerald-600 animate-pulse font-medium text-xl">
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] p-6 flex flex-col items-center pt-12 md:pt-20 transition-colors duration-300 font-sans relative">
      <div className="w-full max-w-3xl mb-8 flex justify-start">
        <Link
          to="/tickets"
          className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded-lg transition-colors font-medium text-sm shadow-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Voltar ao Painel
        </Link>
      </div>

      <div className="w-full max-w-3xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-8 md:p-10 shadow-sm">
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {isEditing ? "Edição de Chamado" : "Abrir Chamado"}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium text-base">
              {isEditing
                ? `Atualizando informações da OS #${id?.slice(0, 6)}`
                : "Detalhe a situação para que possamos ajudar rapidamente."}
            </p>
          </div>
          {isEditing && (
            <button
              onClick={() => setShowDeleteModal(true)}
              type="button"
              className="flex items-center gap-2 text-sm font-medium text-red-600 bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <TrashIcon className="w-4 h-4" /> Excluir
            </button>
          )}
        </div>

        {submitError && (
          <div
            className="mb-8 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg p-4 text-sm font-medium text-red-700 dark:text-red-400 shadow-sm"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <Formik
          initialValues={initialValues}
          enableReinitialize={true}
          validationSchema={TicketSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="title"
                  className="text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Título Principal <span className="text-emerald-500">*</span>
                </label>
                <Field
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Ex: Erro ao carregar página de relatórios"
                  className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-zinc-400 shadow-sm"
                />
                <ErrorMessage
                  name="title"
                  component="span"
                  className="text-red-500 text-sm font-medium mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isEditing && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      Status Atual
                    </label>
                    {user?.role === "support" ? (
                      <Field
                        as="select"
                        name="status"
                        className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="OPEN">Na Fila</option>
                        <option value="IN_PROGRESS">Em Atendimento</option>
                        <option value="CLOSED">Finalizado</option>
                      </Field>
                    ) : (
                      <>
                        <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl px-4 py-3 cursor-not-allowed font-medium text-base">
                          {initialValues.status === "OPEN"
                            ? "Na Fila"
                            : initialValues.status === "IN_PROGRESS"
                              ? "Em Atendimento"
                              : "Finalizado"}
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Exclusivo para equipe de suporte.
                        </p>
                      </>
                    )}
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="priority"
                    className="text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    Nível de Urgência{" "}
                    <span className="text-emerald-500">*</span>
                  </label>
                  <Field
                    as="select"
                    id="priority"
                    name="priority"
                    className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-sm"
                  >
                    <option value="LOW">Baixa (Pode Aguardar)</option>
                    <option value="MEDIUM">Média (Atrasa o trabalho)</option>
                    <option value="HIGH">Alta (Sistema Parado)</option>
                  </Field>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="description"
                  className="text-sm font-semibold text-zinc-800 dark:text-zinc-200"
                >
                  Detalhes Técnicos <span className="text-emerald-500">*</span>
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={6}
                  placeholder="Descreva os passos para reproduzir o problema..."
                  className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-zinc-400 resize-y shadow-sm"
                />
                <ErrorMessage
                  name="description"
                  component="span"
                  className="text-red-500 text-sm font-medium mt-1"
                />
              </div>

              <div className="mt-4 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium text-base transition-colors shadow-sm flex items-center justify-center w-full md:w-auto"
                >
                  {isSubmitting
                    ? "Salvando..."
                    : isEditing
                      ? "Salvar Alterações"
                      : "Enviar Chamado"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-sm w-full shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-5">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Deletar Chamado?
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-normal mb-8 text-sm">
                O histórico do chamado{" "}
                <span className="font-semibold">#{id?.split("-")[0]}</span> será
                perdido. Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
