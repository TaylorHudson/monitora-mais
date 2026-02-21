import { useEffect, useState } from "react";
import { AppSidebarProfessor } from "../../components/ui/app-sidebarprofessor";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { Card } from "../../components/ui/card";
import { fetchComToken } from "../../services/authFetch";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import { toastApiError } from "../../utils/toast";

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

  async function buscarDisciplinas() {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/teachers/me`,
        {},
      );
      const data = await res.json();
      setDisciplinas(Array.isArray(data) ? data : []);
    } catch (err: Error | any) {
      toastApiError(err, "Erro ao buscar estatísticas");
      setDisciplinas([]);
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
        <h1 className="text-3xl font-semibold mb-4 text-primary drop-shadow-sm">
          Estatísticas das Disciplinas
        </h1>

        <p className="text-gray-700 mb-8">
          Veja a quantidade de vezes que cada tópico foi relacionado a monitorias
        </p>

        <div className="flex flex-col gap-10">
          {disciplinas.map((disc) => {
            const chartData = disc.topics.map((topico) => ({
              name: topico,
              monitorias: disc.countTopicsInSession[topico] ?? 0,
            }))
            const chartHeight = Math.max(320, chartData.length * 45)

            return (
              <Card
                key={disc.id}
                className="
                  p-8
                  rounded-2xl
                  shadow-lg
                  border
                  border-[#b2c9d6]
                  
                  flex
                  flex-col
                  gap-6
                "
              >
                <div className="flex flex-col gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {disc.name}
                  </span>

                  <span className="text-sm text-gray-600">
                    Total de tópicos: {disc.topics.length}
                  </span>
                </div>

                <div className="w-full" style={{ height: chartHeight }}>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 20, right: 40, left: 100, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis
                          type="number"
                          allowDecimals={false}
                          tick={{ fontSize: 14, fill: "#0e7490" }}
                        />

                        <YAxis
                          type="category"
                          dataKey="name"
                          width={160}
                          tick={{ fontSize: 14, fill: "#0e7490" }}
                        />

                        <Tooltip
                          formatter={(value: number) =>
                            `${value} ${value === 1 ? "vez" : "vezes"}`
                          }
                        />

                        <Bar
                          dataKey="monitorias"
                          fill="#0e7490"
                          radius={[0, 8, 8, 0]}
                        >
                          <LabelList
                            dataKey="monitorias"
                            position="right"
                            style={{
                              fill: "#0e7490",
                              fontWeight: "bold",
                            }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-gray-400 text-center mt-16">
                      Sem dados para gráfico.
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </main>
    </SidebarProvider>
  </div>
)

}
