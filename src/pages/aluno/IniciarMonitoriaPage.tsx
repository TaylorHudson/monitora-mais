import { useEffect, useState } from "react";
import { AppSidebarAluno } from "../../components/app-sidebaraluno";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { PlayCircle, Clock } from "lucide-react";
import { fetchComToken } from "../../utils/fetchComToken";

// Função utilitária para traduzir o dia da semana
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

// Função utilitária para formatar horário (08:00:00 -> 08:00)
function formatarHora(hora: string) {
  if (!hora) return "";
  return hora.slice(0, 5);
}

export default function IniciarMonitoriaPage() {
  const [monitoriaAtiva, setMonitoriaAtiva] = useState(false);
  const [inicio, setInicio] = useState<Date | null>(null);
  const [monitorias, setMonitorias] = useState<any[]>([]);
  const [monitoriaSelecionada, setMonitoriaSelecionada] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [monitoriaNome, setMonitoriaNome] = useState<string>("");
  const [erro, setErro] = useState<string | null>(null);
  const [topicosSelecionados, setTopicosSelecionados] = useState<string[]>([]);
  const [topicosDaMonitoria, setTopicosDaMonitoria] = useState<string[]>([]);

  // Adiciona monitoria mock automaticamente para testes
  useEffect(() => {
    // Corrigido: buscar monitorias do dia do aluno
    fetchComToken(`${import.meta.env.VITE_API_URL}/monitoring/schedules/students/me`)
      .then(async (res) => {
        if (!res.ok) {
          const msg = await res.text();
          setMonitorias([]);
          setErro(msg || "Erro ao buscar monitorias do dia");
          return;
        }
        const data = await res.json();
        setMonitorias(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        setMonitorias([]);
        setErro(err.message || "Erro ao buscar monitorias do dia");
      });
  }, []);

  function handleStart() {
    if (!monitoriaSelecionada) return;
    setLoading(true);
    setErro(null);
    fetchComToken(`${import.meta.env.VITE_API_URL}/monitoring/sessions/students/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ monitoringScheduleId: monitoriaSelecionada }),
    })
      .then(async (res) => {
        if (res.ok) {
          setMonitoriaAtiva(true);
          setInicio(new Date());
        } else {
          // Tenta extrair mensagem detalhada do backend
          let msg = "Erro ao iniciar monitoria. Tente novamente.";
          try {
            const data = await res.json();
            if (data && data.message) msg = data.message;
            else if (typeof data === 'string') msg = data;
          } catch (e) {
            // fallback para texto puro
            try {
              const text = await res.text();
              if (text) msg = text;
            } catch {}
          }
          setErro(msg);
        }
      })
      .catch(() => {
        setErro("Erro de conexão ao iniciar monitoria. Tente novamente.");
      })
      .finally(() => setLoading(false));
  }

  function handleFinish() {
    if (!monitoriaSelecionada) return;

    setLoading(true);
    setErro(null);

    fetchComToken(`${import.meta.env.VITE_API_URL}/monitoring/sessions/students/finish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        monitoringScheduleId: Number(monitoriaSelecionada),
        topics: topicosSelecionados,
      }),
    })
      .then(async (res) => {
        if (res.ok) {
          // Finalizou com sucesso
          setMonitoriaAtiva(false);
          setInicio(null);
          setMonitoriaSelecionada("");
          setMonitoriaNome("");
          setTopicosSelecionados([]);
          setTopicosDaMonitoria([]);
        } else {
          let msg = "Erro ao finalizar monitoria. Tente novamente.";
          try {
            const data = await res.json();
            if (data?.message) msg = data.message;
            else if (typeof data === "string") msg = data;
          } catch {
            try {
              const text = await res.text();
              if (text) msg = text;
            } catch {}
          }
          setErro(msg);
        }
      })
      .catch(() => {
        setErro("Erro de conexão ao finalizar monitoria. Tente novamente.");
      })
      .finally(() => setLoading(false));
  }


  // Busca a monitoria selecionada garantindo comparação correta de tipos
  const monitoria = monitorias.find((m) => String(m.id) === String(monitoriaSelecionada));

  // Alerta o usuário ao tentar fechar/recarregar a página com monitoria ativa
  useEffect(() => {
    if (!monitoriaAtiva) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Você tem uma monitoria em andamento. Tem certeza que deseja sair?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [monitoriaAtiva]);

  // Busca sessão de monitoria ativa ao montar
  useEffect(() => {
    fetchComToken(`${import.meta.env.VITE_API_URL}/monitoring/sessions/students/started`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.monitoringScheduleId && data.startTime) {
          setMonitoriaAtiva(true);
          setMonitoriaSelecionada(String(data.monitoringScheduleId));
          setInicio(new Date(data.startTime));
          setMonitoriaNome(data.monitoring || "");
        } else {
          setMonitoriaAtiva(false);
          setInicio(null);
          setMonitoriaSelecionada("");
          setMonitoriaNome("");
        }
      })
      .catch(() => {
        setMonitoriaAtiva(false);
        setInicio(null);
        setMonitoriaSelecionada("");
        setMonitoriaNome("");
      });
  }, []);

  // Atualiza tópicos disponíveis ao selecionar monitoria
  useEffect(() => {
    if (!monitoriaSelecionada) {
      setTopicosDaMonitoria([]);
      setTopicosSelecionados([]);
      return;
    }
    const m = monitorias.find((m) => String(m.id) === String(monitoriaSelecionada));
    if (m && Array.isArray(m.topics) && m.topics.length > 0) {
      setTopicosDaMonitoria(m.topics);
    } else {
      // Tópicos padrão caso não venha do backend
      setTopicosDaMonitoria(["Aritmética", "Álgebra"]);
    }
    setTopicosSelecionados([]);
  }, [monitoriaSelecionada, monitorias]);

  return (
    <div className="flex h-full w-full bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white">
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
          {/* Exibe erro, se houver */}
          {erro && (
            <Alert variant="destructive" className="w-full mb-4">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
          )}
          {/* Card lateral minimalista alinhado à esquerda */}
          <div className="flex flex-col gap-6 bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white rounded-xl shadow-md border border-[#b2c9d6] w-full p-8 items-start">
            <Badge variant={monitoriaAtiva ? "secondary" : "secondary"} className="mb-2">
              {monitoriaAtiva ? "Monitoria em andamento" : "Monitoria não iniciada"}
            </Badge>
            {/* Nome da monitoria selecionada, dia e horário */}
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
                  onClick={handleStart}
                  disabled={loading || !monitoriaSelecionada}
                >
                  <PlayCircle className="w-5 h-5" /> Iniciar Monitoria
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-72 flex items-center gap-2 justify-center bg-red-600 hover:bg-red-700 text-white"
                  variant="default"
                  onClick={handleFinish}
                  disabled={loading}
                >
                  Finalizar Monitoria
                </Button>
              )}
            </div>

          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}