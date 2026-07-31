import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  TrashIcon,
  PencilIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface TicketDetails {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  user?: { name: string };
}
interface Message {
  id: string;
  text: string;
  sender: "client" | "support";
  createdAt: string;
  authorName: string;
}

export default function TicketDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    fetchTicketDetails();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchTicketDetails = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
      const msgsResponse = await api.get(`/tickets/${id}/messages`);
      const formattedMsgs = msgsResponse.data.map((msg: any) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.author.role === "support" ? "support" : "client",
        createdAt: msg.createdAt,
        authorName: msg.author.name || msg.author.email,
      }));
      setMessages(formattedMsgs);
    } catch (err) {
      setError("Não foi possível carregar os detalhes do ticket.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/tickets/${id}`);
      navigate("/tickets");
    } catch (err) {
      alert("Erro ao excluir o ticket.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const response = await api.post(`/tickets/${id}/messages`, {
        text: newMessage,
      });
      const savedMsg = response.data;
      const newMsgObj: Message = {
        id: savedMsg.id,
        text: savedMsg.text,
        sender: user?.role === "support" ? "support" : "client",
        createdAt: savedMsg.createdAt,
        authorName:
          savedMsg.author?.name ||
          user?.name ||
          savedMsg.author?.email ||
          user?.email ||
          "Você",
      };
      setMessages([...messages, newMsgObj]);
      setNewMessage("");
    } catch (error) {
      alert("Erro ao enviar a mensagem. Verifique a conexão.");
    }
  };

  const handleSuggestAI = async () => {
    if (!ticket) return;
    setIsAiLoading(true);
    try {
      const response = await api.post(`/tickets/${id}/ai-suggestion`, {
        description: ticket.description,
      });
      setNewMessage(response.data.suggestion);
    } catch (error) {
      alert("Erro ao gerar sugestão da IA.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] flex justify-center items-center">
        <p className="text-emerald-600 animate-pulse font-medium text-xl">
          Preparando Detalhes...
        </p>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] p-6 flex flex-col items-center pt-10 lg:pt-16 transition-colors duration-300 font-sans relative">
      <div className="w-full max-w-5xl mb-6 flex justify-start">
        <button
          onClick={() => navigate("/tickets")}
          className="text-sm font-medium text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-2"
        >
          &larr; Voltar para listagem
        </button>
      </div>

      {error && (
        <div className="w-full max-w-5xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl mb-6 font-medium text-sm shadow-sm">
          {error}
        </div>
      )}

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Resumo da OS
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/tickets/${id}/editar`)}
                  className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-emerald-200 dark:hover:border-zinc-700"
                  title="Editar"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-zinc-700"
                  title="Excluir"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-snug tracking-tight">
              {ticket.title}
            </h1>
            <p className="text-sm text-zinc-500 font-medium mb-8">
              Ticket{" "}
              <span className="text-zinc-700 dark:text-zinc-300">
                #{ticket.id.split("-")[0]}
              </span>
            </p>

            <div className="space-y-5 text-sm">
              <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
                <p className="text-zinc-500 mb-1.5 font-medium">Status</p>
                <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1 rounded-lg font-semibold inline-block">
                  {ticket.status === "OPEN"
                    ? "Na Fila"
                    : ticket.status === "IN_PROGRESS"
                      ? "Em Atendimento"
                      : "Finalizado"}
                </span>
              </div>
              <div className="border-b border-zinc-100 dark:border-zinc-800/60 pb-4">
                <p className="text-zinc-500 mb-1.5 font-medium">Urgência</p>
                <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 px-3 py-1 rounded-lg font-semibold inline-block">
                  {ticket.priority === "HIGH"
                    ? "Alta"
                    : ticket.priority === "MEDIUM"
                      ? "Média"
                      : "Baixa"}
                </span>
              </div>
              <div>
                <p className="text-zinc-500 mb-2 font-medium">Solicitante</p>
                <div className="flex items-center gap-2.5">
                  <UserCircleIcon className="w-6 h-6 text-zinc-400" />
                  <p className="text-zinc-800 dark:text-zinc-200 font-medium">
                    {ticket.user?.name || "Desconhecido"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Descrição Original
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap text-base font-normal leading-relaxed">
              {ticket.description}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl flex flex-col shadow-sm h-[500px] lg:h-[550px]">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800/80 p-4 px-6 shrink-0 rounded-t-2xl">
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-100">
                Histórico de Interações
              </h3>
            </div>

            <div className="flex-1 p-6 overflow-y-auto bg-zinc-50/50 dark:bg-[#09090b] space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                  <UserCircleIcon className="w-16 h-16 mb-4 opacity-40" />
                  <p className="text-lg font-medium text-zinc-600 dark:text-zinc-400">
                    Nenhuma interação registrada
                  </p>
                  <p className="text-sm font-normal mt-1 text-zinc-500">
                    Envie uma mensagem para iniciar o atendimento.
                  </p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "client" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
                        msg.sender === "client"
                          ? "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-tl-sm"
                          : "bg-emerald-600 text-white rounded-tr-sm"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 mb-2 pb-2 border-b ${
                          msg.sender === "client"
                            ? "border-zinc-100 dark:border-zinc-700"
                            : "border-emerald-500"
                        }`}
                      >
                        <span className="text-xs font-semibold">
                          {msg.authorName}
                        </span>
                        <span className="text-[11px] font-medium opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-base font-normal whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-5 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 shrink-0 rounded-b-2xl">
              <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-4"
              >
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none min-h-[80px] max-h-[120px] placeholder-zinc-400 shadow-sm"
                />
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  {user?.role === "support" ? (
                    <button
                      type="button"
                      onClick={handleSuggestAI}
                      disabled={isAiLoading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-medium px-5 py-2.5 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20 transition-colors disabled:opacity-50 shadow-sm"
                    >
                      <SparklesIcon
                        className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`}
                      />
                      {isAiLoading ? "Pensando..." : "Sugerir com IA"}
                    </button>
                  ) : (
                    <div></div>
                  )}
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm"
                  >
                    Enviar Mensagem{" "}
                    <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
