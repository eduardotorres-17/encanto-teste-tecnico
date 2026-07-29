import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  TrashIcon,
  PencilIcon,
  SparklesIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
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

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

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
        authorName: msg.author.name,
      }));

      setMessages(formattedMsgs);
    } catch (err) {
      setError("Não foi possível carregar os detalhes do ticket.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este ticket?")) {
      try {
        await api.delete(`/tickets/${id}`);
        navigate("/tickets");
      } catch (err) {
        alert("Erro ao excluir o ticket.");
      }
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
        authorName: user?.name || "Você",
      };

      setMessages([...messages, newMsgObj]);
      setNewMessage("");
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar a mensagem. Verifique a conexão com o servidor.");
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
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex justify-center items-center transition-colors">
        <p className="text-emerald-600 dark:text-emerald-500 animate-pulse font-medium">
          Carregando detalhes...
        </p>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 flex flex-col items-center pt-10 lg:pt-20 transition-colors duration-300">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Detalhes
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/tickets/${id}/editar`)}
                  className="p-1.5 text-zinc-400 hover:text-emerald-500 bg-zinc-100 dark:bg-zinc-800 rounded-md transition-colors"
                  title="Editar Ticket"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-zinc-400 hover:text-red-500 bg-zinc-100 dark:bg-zinc-800 rounded-md transition-colors"
                  title="Excluir Ticket"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h1 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 leading-tight">
              {ticket.title}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mb-6">
              #{ticket.id.split("-")[0]}
            </p>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 mb-1">Status</p>
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-md font-medium text-xs">
                  {ticket.status}
                </span>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 mb-1">
                  Prioridade
                </p>
                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2.5 py-1 rounded-md font-medium text-xs">
                  {ticket.priority}
                </span>
              </div>
              <div>
                <p className="text-zinc-500 dark:text-zinc-400 mb-1">
                  Solicitante
                </p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                  {ticket.user?.name || "Não identificado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
              Descrição do Problema
            </h2>
            <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
              {ticket.description}
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col shadow-sm flex-1 overflow-hidden min-h-[400px]">
            <div className="flex-1 p-6 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/50 space-y-6">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600">
                  <UserCircleIcon className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma interação ainda.</p>
                  <p className="text-xs">
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
                      className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        msg.sender === "client"
                          ? "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-tl-sm"
                          : "bg-emerald-600 text-white rounded-tr-sm shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold opacity-80">
                          {msg.authorName}
                        </span>
                        <span className="text-[10px] opacity-60">
                          {new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
              <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-3"
              >
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua resposta ao cliente..."
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors resize-none min-h-[100px] text-sm"
                />

                <div className="flex justify-between items-center">
                  {user?.role === "support" && (
                    <button
                      type="button"
                      onClick={handleSuggestAI}
                      disabled={isAiLoading}
                      className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:text-emerald-300 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
                    >
                      <SparklesIcon
                        className={`w-4 h-4 ${isAiLoading ? "animate-spin" : ""}`}
                      />
                      {isAiLoading ? "Gerando..." : "Sugerir resposta com IA"}
                    </button>
                  )}

                  <div className="flex-1"></div>

                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm text-sm"
                  >
                    Enviar Mensagem
                    <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
