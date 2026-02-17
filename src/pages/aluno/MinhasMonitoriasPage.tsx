import { useEffect, useState } from "react";
import { AppSidebarAluno } from "../../components/app-sidebaraluno";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { MonitoriaCard } from "./components/MonitoriaCard";
import { Calendar } from "lucide-react";
import { fetchComToken } from "../../services/authFetch";
import { useLoading } from "../../contexts/LoadingContext";
import { toastApiError } from "../../utils/toast";

type Monitoria = {
  id: number;
  monitor: string;
  discipline: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

export default function MinhasMonitoriasPage() {
  const [monitorias, setMonitorias] = useState<Monitoria[]>([]);
  const { setLoading } = useLoading();

  async function carregarMonitorias() {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/schedules/students/me`,
        {},
        setLoading
      );
      const data = await res.json();
      setMonitorias(data);
    } catch (err: Error | any) {
      toastApiError(err, "Erro ao buscar monitorias");
    }
  }

  useEffect(() => {
    carregarMonitorias();
  }, []);

  return (
    <div className="flex h-full w-full bg-[#F1F7FA]">
      <SidebarProvider>
        <AppSidebarAluno />
        <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
        <main className="flex-1 p-8">
          {/* Título e descrição no mesmo padrão da tela de requisitar horário */}
          <div className="mb-12">
            <div className="flex items-center gap-4">
              <Calendar className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-extrabold text-primary drop-shadow-sm">
                Minhas Monitorias
              </h1>
            </div>
            <p className="text-gray-500 mt-2 ml-12">
              Veja os horários de monitoria que você já possui.
            </p>
            <div className="h-1 w-24 bg-primary/20 rounded mt-4 ml-12" />
          </div>
          {/* Cards das monitorias */}
          <div className="flex flex-col w-full px-4 py-8 gap-4">
            {monitorias.length === 0 ? (
              <div className="text-gray-500 text-center">Nenhuma monitoria encontrada.</div>
            ) : (
              monitorias.map((m) => (
                <MonitoriaCard key={m.id} monitoria={m} />
              ))
            )}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}