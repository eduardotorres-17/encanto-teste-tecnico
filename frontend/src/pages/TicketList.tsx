import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  MagnifyingGlassIcon,
  ListBulletIcon,
  ViewColumnsIcon,
  PlusIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  PlayIcon,
  CheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  user?: {
    name: string;
  };
}

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<"LIST" | "KANBAN">("LIST");
  const [searchTitle, setSearchTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const [isDarkMode, setIsDarkMode] = useState(true);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await api.get("/tickets");
      setTickets(response.data);
    } catch (err) {
      setError("Não foi possível carregar seus tickets.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStatusUpdate = async (
    e: React.MouseEvent,
    ticketId: string,
    newStatus: string,
  ) => {
    e.stopPropagation();
    try {
      await api.patch(`/tickets/${ticketId}`, { status: newStatus });
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: newStatus as any } : t,
        ),
      );
    } catch (err) {
      console.error("Erro ao atualizar status", err);
      alert("Não foi possível atualizar o status.");
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesTitle = ticket.title
      .toLowerCase()
      .includes(searchTitle.toLowerCase());
    const matchesStatus =
      filterStatus === "ALL" || ticket.status === filterStatus;
    return matchesTitle && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      OPEN: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50",
      IN_PROGRESS:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/50",
      CLOSED:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50",
    };
    const labels: Record<string, string> = {
      OPEN: "Aberto",
      IN_PROGRESS: "Em Andamento",
      CLOSED: "Resolvido",
    };
    return (
      <span
        className={`px-2.5 py-1 text-xs font-medium rounded-full border shrink-0 ${styles[status] || "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      HIGH: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-400/10",
      MEDIUM:
        "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-400/10",
      LOW: "text-zinc-600 bg-zinc-100 dark:text-zinc-400 dark:bg-zinc-800",
    };
    return (
      <span
        className={`px-2 py-0.5 text-xs font-semibold rounded shrink-0 ${styles[priority]}`}
      >
        {priority === "HIGH"
          ? "Alta"
          : priority === "MEDIUM"
            ? "Média"
            : "Baixa"}
      </span>
    );
  };

  const renderListView = () => (
    <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 transition-colors">
            <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Assunto
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Solicitante
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Status
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Data
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-zinc-600 dark:text-zinc-400">
              Prioridade
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {filteredTickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group cursor-pointer"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <td className="px-6 py-4 min-w-[200px]">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                  {ticket.title}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1 line-clamp-1">
                  {ticket.description}
                </p>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <UserIcon className="w-4 h-4 shrink-0" />
                  <span className="font-medium truncate max-w-[120px]">
                    {ticket.user?.name || "Não identificado"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 min-w-[250px]">
                <div className="flex items-center gap-3">
                  {getStatusBadge(ticket.status)}
                  {user?.role === "support" && ticket.status === "OPEN" && (
                    <button
                      onClick={(e) =>
                        handleStatusUpdate(e, ticket.id, "IN_PROGRESS")
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-md transition-colors shadow-sm"
                    >
                      <PlayIcon className="w-3.5 h-3.5" /> Iniciar
                    </button>
                  )}
                  {user?.role === "support" &&
                    ticket.status === "IN_PROGRESS" && (
                      <button
                        onClick={(e) =>
                          handleStatusUpdate(e, ticket.id, "CLOSED")
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-md transition-colors shadow-sm"
                      >
                        <CheckIcon className="w-3.5 h-3.5" /> Resolver
                      </button>
                    )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
              </td>
              <td className="px-6 py-4">{getPriorityBadge(ticket.priority)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderKanbanColumn = (
    status: "OPEN" | "IN_PROGRESS" | "CLOSED",
    title: string,
  ) => {
    const columnTickets = filteredTickets.filter((t) => t.status === status);

    return (
      <div className="flex flex-col gap-4 min-w-[320px] flex-1">
        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
            {title}
          </h3>
          <span className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs py-1 px-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm">
            {columnTickets.length}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {columnTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all hover:shadow-md group flex flex-col gap-3"
            >
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 line-clamp-2">
                  {ticket.title}
                </h4>
                <span className="text-xs text-zinc-400 dark:text-zinc-600 font-mono shrink-0">
                  #{ticket.id.slice(0, 4)}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <UserIcon className="w-4 h-4 text-zinc-400" />
                <span className="truncate font-medium">
                  {ticket.user?.name || "Não identificado"}
                </span>
              </div>

              <div className="flex justify-between items-center mt-1">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>

              {user?.role === "support" && ticket.status !== "CLOSED" && (
                <div className="flex justify-end mt-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                  {ticket.status === "OPEN" && (
                    <button
                      onClick={(e) =>
                        handleStatusUpdate(e, ticket.id, "IN_PROGRESS")
                      }
                      className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-2 rounded-lg transition-all w-full"
                    >
                      <PlayIcon className="w-4 h-4" /> Iniciar Atendimento
                    </button>
                  )}
                  {ticket.status === "IN_PROGRESS" && (
                    <button
                      onClick={(e) =>
                        handleStatusUpdate(e, ticket.id, "CLOSED")
                      }
                      className="flex items-center justify-center gap-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm px-4 py-2 rounded-lg transition-all w-full"
                    >
                      <CheckIcon className="w-4 h-4" /> Marcar como Resolvido
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKanbanView = () => (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {renderKanbanColumn("OPEN", "Abertos")}
      {renderKanbanColumn("IN_PROGRESS", "Em Andamento")}
      {renderKanbanColumn("CLOSED", "Resolvidos")}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Tickets de Suporte
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors shadow-sm"
              title="Alternar Tema"
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 p-2 transition-colors"
              title="Sair"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate("/tickets/novo")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Novo Ticket
            </button>
          </div>
        </header>

        <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-zinc-900 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 mb-6 gap-4 transition-colors shadow-sm">
          <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 w-full md:w-auto">
            <button
              onClick={() => setViewMode("LIST")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "LIST" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-800" : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              <ListBulletIcon className="w-5 h-5" /> Lista
            </button>
            <button
              onClick={() => setViewMode("KANBAN")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "KANBAN" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-800" : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
            >
              <ViewColumnsIcon className="w-5 h-5" /> Kanban
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto px-2 md:px-0">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 text-zinc-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar por título..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
                className="w-full sm:w-64 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none transition-colors placeholder-zinc-400 dark:placeholder-zinc-600"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full sm:w-40 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-sm rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none transition-colors"
            >
              <option value="ALL">Todos os Status</option>
              <option value="OPEN">Abertos</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="CLOSED">Resolvidos</option>
            </select>
          </div>
        </div>

        <main>
          {loading ? (
            <p className="text-emerald-600 dark:text-emerald-500 animate-pulse text-center py-20 font-medium">
              Carregando seus tickets...
            </p>
          ) : error ? (
            <p className="text-red-600 dark:text-red-400 text-center py-20 font-medium">
              {error}
            </p>
          ) : filteredTickets.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center transition-colors shadow-sm">
              <p className="text-zinc-500 dark:text-zinc-400">
                Nenhum ticket encontrado com esses filtros.
              </p>
            </div>
          ) : viewMode === "LIST" ? (
            renderListView()
          ) : (
            renderKanbanView()
          )}
        </main>
      </div>
    </div>
  );
}
