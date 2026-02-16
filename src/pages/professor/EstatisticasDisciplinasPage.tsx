import { useEffect, useState } from "react";
import { AppSidebarProfessor } from "../../components/ui/app-sidebarprofessor";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { fetchComToken } from "../../services/authFetch";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";

// Tipagem do modelo retornado
interface Schedule {
  id: number;
  monitor: string;
  monitoring: string;
  dayOfWeek: string;
  startTime: { hour: number; minute: number; };
  endTime: { hour: number; minute: number; };
  status: string;
  requestedAt: string;
}
interface Disciplina {
  id: number;
  name: string;
  allowMonitorsSameTime: boolean;
  teacher: string;
  schedules: Schedule[];
  topics: string[];
  countTopicsInSession: Record<string, number>;
}

export default function EstatisticasDisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  async function buscarDisciplinas() {
    try {
      const res = await fetchComToken(`${import.meta.env.VITE_API_URL}/monitoring/teachers/me`)
      const data = await res.json();
      setDisciplinas(Array.isArray(data) ? data : []);
    } catch (err: Error | any) {
      setErro(err.message || "Erro ao buscar estatísticas");
      setDisciplinas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    buscarDisciplinas();
  }, []);

  return (
    <div className="flex h-full w-full bg-[#F1F7FA]">
      <SidebarProvider>
        <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
        <AppSidebarProfessor />
        <main className="flex-1 p-8 min-h-screen">
          <h1 className="text-3xl font-semibold mb-4 text-primary drop-shadow-sm">Estatísticas das Disciplinas</h1>
          <p className="text-gray-700 mb-8">Veja a quantidade de vezes que cada tópico foi relacionado a monitorias.</p>
          {erro && <div className="text-red-600 mb-4">{erro}</div>}
          {loading ? (
            <div className="text-center text-gray-400 py-8">Carregando estatísticas...</div>
          ) : (
            <div className="flex flex-col gap-8">
              {disciplinas.map((disc) => {
                const chartData = disc.topics.map((topico) => ({
                  name: topico,
                  monitorias: disc.countTopicsInSession[topico] ?? 0,
                }));
                return (
                  <Card key={disc.id} className="p-8 rounded-2xl shadow-lg border border-[#b2c9d6] bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 min-w-[220px] flex flex-col gap-4">
                      <div className="mb-2">
                        <span className="text-2xl font-bold text-primary">{disc.name}</span>
                        <Badge className="ml-4">Professor: {disc.teacher}</Badge>
                      </div>
                      <div className="mb-2 text-lg font-semibold text-primary">Tópicos</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {disc.topics.length === 0 && <span className="text-gray-500">Nenhum tópico cadastrado.</span>}
                        {disc.topics.map((topico) => (
                          <div key={topico} className="flex flex-row items-center bg-primary/5 rounded-xl px-4 py-2 shadow">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-base font-medium mr-3">{topico}</span>
                            <span className="text-sm text-gray-700">Monitorias: <span className="font-bold text-primary">{disc.countTopicsInSession[topico] ?? 0}</span></span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 w-full min-w-[320px] max-w-[500px] h-[260px]">
                      {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 14, fill: '#0e7490' }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 14, fill: '#0e7490' }} />
                            <Tooltip formatter={(value) => `${value} monitorias`} />
                            <Bar dataKey="monitorias" fill="#0e7490" radius={[8,8,0,0]}>
                              <LabelList dataKey="monitorias" position="top" style={{ fill: '#0e7490', fontWeight: 'bold' }} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-gray-400 text-center mt-12">Sem dados para gráfico.</div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </SidebarProvider>
    </div>
  );
}
