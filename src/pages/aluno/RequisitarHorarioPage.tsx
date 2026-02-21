import { AppSidebarAluno } from "../../components/app-sidebaraluno"
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar"
import { MateriaCard } from "./components/MateriaCard";
import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { fetchComToken } from "../../services/authFetch";
import { toastApiError } from "../../utils/toast";
import { useLoading } from "../../contexts/LoadingContext";

export default function RequisitarHorarioPage() {
  const [cardExpandido, setCardExpandido] = useState<number | null>(null);
  const [monitorias, setMonitorias] = useState<any[]>([]);
  const { setLoading } = useLoading();

  async function carregarMonitorias() {
    try {
      setLoading(true);
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/students/me`,
        {},
        setLoading
      );
      const data = await res.json();
      setMonitorias(data);
    } catch (err: Error | any) {
      setMonitorias([]);
      toastApiError(err);
    }
  }

  useEffect(() => {
    carregarMonitorias();
  }, []);

  return (
    <>
      <div className="flex h-full w-full bg-[#F1F7FA]">
        <SidebarProvider>
          <AppSidebarAluno />
          <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
          <main className="flex-1 p-8">
            <div className="mb-12">
              <div className="flex items-center gap-4">
                <Calendar className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-extrabold text-primary drop-shadow-sm">
                  Requisitar Horário
                </h1>
              </div>
              <p className="text-gray-500 mt-2 ml-12">
                Solicite um horário de monitoria ao professor.
              </p>
              <div className="h-1 w-24 bg-primary/20 rounded mt-4 ml-12" />
            </div>
            <div className="flex flex-col w-full px-4 py-8 gap-4">
              {monitorias.map((monitoria) => (
                <MateriaCard
                  key={monitoria.id}
                  id={monitoria.id}
                  nome={monitoria.name}
                  professor={monitoria.teacher}
                  alreadyRequested={monitoria.alreadyRequested}
                  expandido={cardExpandido === monitoria.id}
                  onExpandir={() =>
                    setCardExpandido(cardExpandido === monitoria.id ? null : monitoria.id)
                  }
                />
              ))}
            </div>
          </main>
        </SidebarProvider>
      </div>
    </>
  )
}