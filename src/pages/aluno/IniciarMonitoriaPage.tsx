import { useEffect, useState } from "react";
import { AppSidebarAluno } from "../../components/app-sidebaraluno";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { PlayCircle, Clock } from "lucide-react";
import { fetchComToken } from "../../services/authFetch";
import { toastApiError } from "../../utils/toast";
import { useLoading } from "../../contexts/LoadingContext";

function traduzirDia(dayOfWeek: string) {
  const dias: Record<string, string> = {
    MONDAY: "Segunda-feira",
    TUESDAY: "Terça-feira",
    WEDNESDAY: "Quarta-feira",
    THURSDAY: "Quinta-feira",
    FRIDAY: "Sexta-feira",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
  };
  return dias[dayOfWeek] || dayOfWeek;
}

function formatarHora(hora: string) {
  if (!hora) return "";
  return hora.slice(0, 5);
}

export default function IniciarMonitoriaPage() {
  const [monitoriaAtiva, setMonitoriaAtiva] = useState(false);
  const [inicio, setInicio] = useState<Date | null>(null);
  const [monitorias, setMonitorias] = useState<any[]>([]);
  const [monitoriaSelecionada, setMonitoriaSelecionada] = useState<string>("");
  const [monitoriaNome, setMonitoriaNome] = useState<string>("");
  const [topicosSelecionados, setTopicosSelecionados] = useState<string[]>([]);
  const [topicosDaMonitoria, setTopicosDaMonitoria] = useState<string[]>([]);
  const { setLoading } = useLoading();

  async function carregarAgendamentosDeMonitoria() {
    try {
      const res = await fetchComToken(
          `${import.meta.env.VITE_API_URL}/monitoring/schedules/students/me`,
          {},
          setLoading
      );

      const data = await res.json();
      setMonitorias(Array.isArray(data) ? data : []);
    } catch (err: Error | any) {
      setMonitorias([]);
      toastApiError(err, "Erro ao buscar monitorias");
    }
  }

  useEffect(() => {
    carregarAgendamentosDeMonitoria();
  }, []);

  async function iniciarMonitoria() {
    try {
      if (!monitoriaSelecionada) return;
      await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/sessions/students/start`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ monitoringScheduleId: monitoriaSelecionada }),
        },
        setLoading
      );
      setMonitoriaAtiva(true);
      setInicio(new Date());
    } catch (err: Error | any) {
      toastApiError(err, "Erro ao iniciar monitoria");
    }
  }

  async function finalizarMonitoria() {
    try {
      if (!monitoriaSelecionada) return;

      await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/sessions/students/finish`, 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            { 
              monitoringScheduleId: Number(monitoriaSelecionada),
              topics: topicosSelecionados,
            }
          ),
        },
        setLoading
      );
    
      setMonitoriaAtiva(false);
      setInicio(null);
      setMonitoriaSelecionada("");
      setMonitoriaNome("");
      setTopicosSelecionados([]);
      setTopicosDaMonitoria([]);
    } catch (err: Error | any) {
      toastApiError(err, "Erro ao finalizar monitoria");
    }
  }

  const monitoria = monitorias.find((m) => String(m.id) === String(monitoriaSelecionada));

  async function buscarMonitoriaAtiva() {
    try {
      setMonitoriaAtiva(false);
      setInicio(null);
      setMonitoriaSelecionada("");
      setMonitoriaNome("");

      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/sessions/students/started`,
        {},
        setLoading
      );

      const data = await res.json();
      if (data && data.monitoringScheduleId && data.startTime) {
          setMonitoriaAtiva(true);
          setMonitoriaSelecionada(String(data.monitoringScheduleId));
          setInicio(new Date(data.startTime));
          setMonitoriaNome(data.monitoring || "");
        }
    } catch (err: Error | any) {
      if (!err.message.includes("Nenhuma sessão de monitoria iniciada foi encontrada")) {
        toastApiError(err, "Erro ao buscar monitorias");
      }
    }
  }

  useEffect(() => {
    buscarMonitoriaAtiva();
  }, []);

  useEffect(() => {
    if (!monitoriaSelecionada) {
      setTopicosDaMonitoria([]);
      setTopicosSelecionados([]);
      return;
    }
    const m = monitorias.find((m) => String(m.id) === String(monitoriaSelecionada));
    if (m && Array.isArray(m.topics) && m.topics.length > 0) {
      setTopicosDaMonitoria(m.topics);
    }
    setTopicosSelecionados([]);
  }, [monitoriaSelecionada, monitorias]);

  return (
    <>
      <div className="flex h-full w-full bg-[#F1F7FA]">
        <SidebarProvider>
          <AppSidebarAluno />
          <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
          <main className="flex-1 p-8 flex flex-col items-start">
            {/* Título e descrição */}
            <div className="mb-12 w-full">
              <div className="flex items-center gap-4">
                <Clock className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-extrabold text-primary drop-shadow-sm">
                  Iniciar Monitoria
                </h1>
              </div>
              <p className="text-gray-500 mt-2 ml-12">
                Inicie ou finalize sua sessão de monitoria.
              </p>
              <div className="h-1 w-24 bg-primary/20 rounded mt-4 ml-12" />
            </div>
           
            <div className="flex flex-col gap-6 bg-white rounded-2xl shadow-lg border border-[#b2c9d6] w-full p-8 items-start">
              <Badge variant={monitoriaAtiva ? "secondary" : "secondary"} className="mb-2">
                {monitoriaAtiva ? "Monitoria em andamento" : "Monitoria não iniciada"}
              </Badge>
          
              {monitoriaAtiva && monitoriaNome && (
                <div className="text-lg font-semibold text-primary w-full">
                  {monitoriaNome}
                </div>
              )}
              {!monitoriaAtiva && monitoriaSelecionada && monitoria && (
                <div className="text-lg font-semibold text-primary w-full">
                  {monitoria.discipline}
                  <div className="text-base text-gray-700 font-normal">
                    {traduzirDia(monitoria.dayOfWeek)}
                    <br />
                    {monitoria.startTime ? formatarHora(monitoria.startTime) : "-"} às {monitoria.endTime ? formatarHora(monitoria.endTime) : "-"}
                  </div>
                </div>
              )}
              {!monitoriaAtiva && (
                <div className="w-full flex">
                  <select
                    className="w-72 border border-[#b2c9d6] rounded p-2 bg-white/80 focus:border-primary focus:ring-primary"
                    value={monitoriaSelecionada}
                    onChange={(e) => setMonitoriaSelecionada(e.target.value)}
                  >
                    <option value="">Selecione uma monitoria</option>
                    {monitorias.map((m) => (
                      <option key={m.id} value={String(m.id)}>
                        {m.discipline +
                          " - " +
                          traduzirDia(m.dayOfWeek) +
                          " " +
                          formatarHora(m.startTime) +
                          " às " +
                          formatarHora(m.endTime)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {monitoriaAtiva && inicio && (
                <Alert className="w-full">
                  <AlertTitle>Monitoria iniciada</AlertTitle>
                  <AlertDescription>
                    Início: {inicio.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </AlertDescription>
                </Alert>
              )}
              {monitoriaAtiva && topicosDaMonitoria.length > 0 && (
                <div className="flex flex-col gap-2 w-full">
                  <span className="font-semibold text-primary">Tópicos abordados nesta sessão:</span>
                  <div className="flex flex-wrap gap-3">
                    {topicosDaMonitoria.map((topico) => (
                      <label key={topico} className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full cursor-pointer">
                        <input
                          type="checkbox"
                          checked={topicosSelecionados.includes(topico)}
                          onChange={e => {
                            if (e.target.checked) setTopicosSelecionados([...topicosSelecionados, topico]);
                            else setTopicosSelecionados(topicosSelecionados.filter(t => t !== topico));
                          }}
                          disabled={false}
                        />
                        <span>{topico}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex w-full">
                {!monitoriaAtiva ? (
                  <Button
                    size="lg"
                    className="w-72 flex items-center gap-2 justify-center bg-green-600 hover:bg-green-700 text-white"
                    variant="default"
                    onClick={iniciarMonitoria}
                    disabled={!monitoriaSelecionada}
                  >
                    <PlayCircle className="w-5 h-5" /> Iniciar Monitoria
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-72 flex items-center gap-2 justify-center bg-red-600 hover:bg-red-700 text-white"
                    variant="default"
                    onClick={finalizarMonitoria}
                  >
                    Finalizar Monitoria
                  </Button>
                )}
              </div>

            </div>
          </main>
        </SidebarProvider>
      </div>
    </>
  );
}