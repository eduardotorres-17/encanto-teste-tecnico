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
  UserCircleIcon,
  TicketIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
  user?: { name: string; email?: string };
}

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"LIST" | "KANBAN">("LIST");
  const [searchTitle, setSearchTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("@encanto-theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("@encanto-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("@encanto-theme", "light");
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
      OPEN: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
      IN_PROGRESS:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
      CLOSED:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
    };
    const labels: Record<string, string> = {
      OPEN: "Aberto",
      IN_PROGRESS: "Em Andamento",
      CLOSED: "Resolvido",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full border shadow-sm shrink-0 ${styles[status]}`}
      >
        {labels[status] || status}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      HIGH: "text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-500/10 dark:border-red-500/20",
      MEDIUM:
        "text-orange-700 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-500/10 dark:border-orange-500/20",
      LOW: "text-zinc-600 bg-zinc-100 border-zinc-200 dark:text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700",
    };
    return (
      <span
        className={`px-2.5 py-1 text-xs font-semibold rounded-md border shrink-0 ${styles[priority]}`}
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
    <div className="overflow-x-auto bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
            <th className="px-6 py-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Assunto
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Solicitante
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Status
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Data
            </th>
            <th className="px-6 py-4 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              Prioridade
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {filteredTickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer"
              onClick={() => navigate(`/tickets/${ticket.id}`)}
            >
              <td className="px-6 py-5 min-w-[250px]">
                <p className="text-base font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {ticket.title}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-1 font-normal">
                  {ticket.description}
                </p>
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                  <UserCircleIcon className="w-5 h-5 shrink-0 text-zinc-400" />
                  <span className="font-medium truncate max-w-[120px]">
                    {ticket.user?.name || "Desconhecido"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 min-w-[250px]">
                <div className="flex items-center gap-3">
                  {getStatusBadge(ticket.status)}
                  {user?.role === "support" && ticket.status === "OPEN" && (
                    <button
                      onClick={(e) =>
                        handleStatusUpdate(e, ticket.id, "IN_PROGRESS")
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      <PlayIcon className="w-4 h-4 text-blue-500" /> Iniciar
                    </button>
                  )}
                  {user?.role === "support" &&
                    ticket.status === "IN_PROGRESS" && (
                      <button
                        onClick={(e) =>
                          handleStatusUpdate(e, ticket.id, "CLOSED")
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                      >
                        <CheckIcon className="w-4 h-4 text-emerald-500" />{" "}
                        Resolver
                      </button>
                    )}
                </div>
              </td>
              <td className="px-6 py-5 text-sm font-medium text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                {new Date(ticket.createdAt).toLocaleDateString("pt-BR")}
              </td>
              <td className="px-6 py-5">{getPriorityBadge(ticket.priority)}</td>
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
      <div className="flex flex-col gap-4 min-w-[340px] flex-1 bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800/50">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-semibold text-zinc-800 dark:text-zinc-200">
            {title}
          </h3>
          <span className="bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold py-1 px-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm">
            {columnTickets.length}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {columnTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="cursor-pointer bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/50 group flex flex-col gap-3"
            >
              <div className="flex justify-between items-start gap-3">
                <h4 className="text-base font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2 leading-snug">
                  {ticket.title}
                </h4>
                <span className="text-xs font-medium text-zinc-400 shrink-0">
                  #{ticket.id.slice(0, 4)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                <UserIcon className="w-4 h-4" />
                <span className="truncate">
                  {ticket.user?.name || "Desconhecido"}
                </span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                {getStatusBadge(ticket.status)}
                {getPriorityBadge(ticket.priority)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderKanbanView = () => (
    <div className="flex gap-6 overflow-x-auto pb-6 min-h-[500px] snap-x">
      {renderKanbanColumn("OPEN", "Na Fila")}
      {renderKanbanColumn("IN_PROGRESS", "Em Atendimento")}
      {renderKanbanColumn("CLOSED", "Finalizados")}
    </div>
  );

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-[#09090b] transition-colors duration-300 overflow-hidden font-sans">
      <aside className="w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800/80 flex flex-col justify-between shadow-sm z-10 hidden md:flex">
        <div>
          <div className="p-7 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-sm">
              <TicketIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100 tracking-tight">
              Encanto Desk
            </h2>
          </div>
          <div className="p-5">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 ml-2">
              Menu Principal
            </p>
            <button className="w-full flex items-center gap-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-lg font-medium transition-all border border-emerald-100 dark:border-emerald-500/20">
              <ListBulletIcon className="w-5 h-5" />
              Meus Tickets
            </button>
          </div>
        </div>
        <div className="p-5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-3 mb-5 px-2">
            <div className="bg-zinc-200 dark:bg-zinc-800 p-2 rounded-full">
              <UserIcon className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                {user?.name || "Usuário"}
              </span>
              <span className="text-xs text-zinc-500 truncate">
                {user?.role === "support" ? "Suporte Técnico" : "Cliente"}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-red-200 dark:hover:border-red-900/50 py-2.5 rounded-lg transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Sair do Sistema
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto flex flex-col relative">
        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-5">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Painel de Tickets
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-1 text-base">
                Gerencie suas solicitações com facilidade e rapidez.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
              >
                {isDarkMode ? (
                  <SunIcon className="w-5 h-5" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => navigate("/tickets/novo")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Novo Chamado
              </button>
            </div>
          </header>

          <div className="flex flex-col md:flex-row justify-between items-center bg-transparent mb-6 gap-4">
            <div className="flex bg-zinc-200/50 dark:bg-zinc-900 p-1 rounded-xl w-full md:w-auto border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => setViewMode("LIST")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "LIST" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                <ListBulletIcon className="w-5 h-5" /> Lista
              </button>
              <button
                onClick={() => setViewMode("KANBAN")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === "KANBAN" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                <ViewColumnsIcon className="w-5 h-5" /> Quadros
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <MagnifyingGlassIcon className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar chamado..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 font-medium text-sm rounded-xl pl-11 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-zinc-400 shadow-sm"
                />
              </div>
              <div className="relative w-full sm:w-56">
                <FunnelIcon className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 font-medium text-sm rounded-xl pl-11 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">Todos os Status</option>
                  <option value="OPEN">Abertos</option>
                  <option value="IN_PROGRESS">Em Andamento</option>
                  <option value="CLOSED">Finalizados</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pb-10">
            {loading ? (
              <p className="text-emerald-600 animate-pulse text-center py-20 font-medium text-lg">
                Buscando informações...
              </p>
            ) : error ? (
              <p className="text-red-600 text-center py-20 font-medium bg-red-50 dark:bg-red-500/10 rounded-xl">
                {error}
              </p>
            ) : filteredTickets.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-20 text-center shadow-sm flex flex-col items-center">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-full mb-6">
                  <TicketIcon className="w-12 h-12 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                  Caixa de entrada limpa!
                </h3>
                <p className="text-zinc-500 text-base">
                  Nenhum chamado pendente encontrado com os filtros atuais.
                </p>
              </div>
            ) : viewMode === "LIST" ? (
              renderListView()
            ) : (
              renderKanbanView()
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
