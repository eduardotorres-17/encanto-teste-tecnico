import { useNavigate, Link, useParams } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { api } from "../services/api";
import { useState, useEffect } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
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
  const [initialValues, setInitialValues] = useState({
    title: "",
    description: "",
    priority: "LOW",
    status: "OPEN",
  });

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

      if (user?.role !== "support") {
        delete payload.status;
      }

      if (isEditing) {
        await api.patch(`/tickets/${id}`, payload);
      } else {
        await api.post("/tickets", payload);
      }

      navigate("/tickets");
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message ||
          "Erro ao salvar o ticket. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este ticket? Essa ação não pode ser desfeita.",
      )
    ) {
      try {
        await api.delete(`/tickets/${id}`);
        navigate("/tickets");
      } catch (err) {
        setSubmitError("Erro ao excluir o ticket.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 dark:bg-black flex justify-center items-center transition-colors">
        <p className="text-purple-600 dark:text-purple-400 animate-pulse font-medium">
          Carregando dados...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-black p-6 flex flex-col items-center pt-20 transition-colors duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-neutral-800 rounded-xl p-8 shadow-sm transition-colors">
        <div className="mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {isEditing ? "Editar Ticket" : "Novo Ticket"}
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
              {isEditing
                ? `Atualizando informações do ticket #${id?.slice(0, 4)}`
                : "Descreva o problema ou solicitação de suporte"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {isEditing && (
              <button
                onClick={handleDelete}
                type="button"
                className="text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                title="Excluir Ticket"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
            <Link
              to="/tickets"
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors text-sm font-medium"
            >
              Voltar
            </Link>
          </div>
        </div>

        {submitError && (
          <div
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg p-4 text-sm text-red-600 dark:text-red-400"
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
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Título do Chamado
                </label>
                <Field
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Ex: Falha no acesso ao sistema"
                  className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors placeholder-neutral-400 dark:placeholder-neutral-600"
                />
                <ErrorMessage
                  name="title"
                  component="span"
                  className="text-red-500 dark:text-red-400 text-xs font-medium mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isEditing && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                      Status Atual
                    </label>
                    {user?.role === "support" ? (
                      <Field
                        as="select"
                        name="status"
                        className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
                      >
                        <option value="OPEN">Aberto</option>
                        <option value="IN_PROGRESS">Em Andamento</option>
                        <option value="CLOSED">Resolvido</option>
                      </Field>
                    ) : (
                      <>
                        <div className="bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-lg px-4 py-2.5 cursor-not-allowed">
                          {initialValues.status === "OPEN"
                            ? "Aberto"
                            : initialValues.status === "IN_PROGRESS"
                              ? "Em Andamento"
                              : "Resolvido"}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                          Apenas a equipe de suporte pode alterar o status.
                        </p>
                      </>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="priority"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Prioridade
                  </label>
                  <Field
                    as="select"
                    id="priority"
                    name="priority"
                    className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                  </Field>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="description"
                  className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Descrição Detalhada
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={5}
                  placeholder="Descreva o que está acontecendo..."
                  className="bg-neutral-50 dark:bg-black border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors placeholder-neutral-400 dark:placeholder-neutral-600 resize-none"
                />
                <ErrorMessage
                  name="description"
                  component="span"
                  className="text-red-500 dark:text-red-400 text-xs font-medium mt-1"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#3b1d5c] hover:bg-[#2d1646] disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-black shadow-sm flex items-center justify-center min-w-[150px]"
                >
                  {isSubmitting
                    ? "Salvando..."
                    : isEditing
                      ? "Atualizar Ticket"
                      : "Abrir Ticket"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
