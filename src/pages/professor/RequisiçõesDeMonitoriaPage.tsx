import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AppSidebarProfessor } from "../../components/ui/app-sidebarprofessor";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { fetchComToken } from "../../services/authFetch";
import { Badge } from "../../components/ui/badge";
import { converterDiaParaPortugues, formatarHora } from "../../utils/utils";
import { toastApiError, toastSuccess } from "../../utils/toast";
import { useLoading } from "../../contexts/LoadingContext";

type Horario = {
  hour: number;
  minute: number;
  second: number;
  nano: number;
};

type Requisicao = {
  id: number;
  monitor: string;
  discipline: string;
  dayOfWeek: string;
  startTime: Horario;
  endTime: Horario;
  status: string;
  topics: string[];
};

export default function RequisicoesDeMonitoraPage() {
  const [requisicao, setRequisicao] = useState<Requisicao[]>([]);
  const [statusFiltro, setStatusFiltro] = useState<"PENDING" | "APPROVED" | "DENIED">("PENDING");
  const { setLoading } = useLoading();

  async function buscarRequisicoesDeMonitoria(status: string) {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/schedules/teachers/filter?status=${status}`,
        {},
        setLoading
      );
      const data = await res.json();

      setRequisicao([]);
      if (Array.isArray(data) && data.length > 0) {
        setRequisicao(data);
      }
    } catch (error) {
      toastApiError(error);
    }
  }

  useEffect(() => {
    buscarRequisicoesDeMonitoria(statusFiltro);
  }, [statusFiltro]);

  async function handleAcao(id: number, acao: "approve" | "deny") {
    try {
      const url = `${import.meta.env.VITE_API_URL}/monitoring/schedules/teachers/${id}/${acao}`;
      await fetchComToken(url, { method: "PATCH" });
      setRequisicao(req => req.filter(p => p.id !== id));
      toastSuccess("Requisição atualizada", `A requisição foi ${acao === "approve" ? "aprovada" : "recusada"} com sucesso`);
    } catch (err: Error | any) {
      toastApiError(err);
    }
  }

  return (
    <div className="flex h-full w-full bg-[#F1F7FA]">
      <SidebarProvider>
        <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
        <AppSidebarProfessor />
        <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white min-h-screen">
          <div className="mb-8 text-left w-full">
            <h1 className="text-3xl font-semibold mb-1 text-primary drop-shadow-sm">Requisições de Monitoria</h1>
            <p className="text-gray-700 text-base text-left">Gerencie as solicitações de horários de monitoria pendentes.</p>
            <div className="flex gap-4 mt-6">
              <Badge
                variant={statusFiltro === "PENDING" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-base"
                onClick={() => setStatusFiltro("PENDING")}
              >Pendentes</Badge>
              <Badge
                variant={statusFiltro === "APPROVED" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-base"
                onClick={() => setStatusFiltro("APPROVED")}
              >Aprovados</Badge>
              <Badge
                variant={statusFiltro === "DENIED" ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-base"
                onClick={() => setStatusFiltro("DENIED")}
              >Negados</Badge>
            </div>
          </div>
          <div className="flex flex-col gap-6 w-full">
            {requisicao.map((item) => {
              const aluno = (item as any).monitor || '-';
              const dia = converterDiaParaPortugues(item.dayOfWeek);
              const horario = `${formatarHora(item.startTime)} - ${formatarHora(item.endTime)}`;
              const status = item.status ? item.status.toLowerCase() : statusFiltro.toLowerCase();
              if (status === 'pending' && statusFiltro !== 'PENDING') return null;
              return (
                <Card key={item.id} className="bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white w-full rounded-2xl shadow-lg p-7 flex flex-col border border-[#b2c9d6] transition-all hover:scale-[1.01]">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 flex-1">
                    <div>
                      <div className="font-bold text-2xl text-primary drop-shadow-sm mb-1">{item.discipline}</div>
                      <div className="flex gap-4 items-center mb-2 mt-2">
                        <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
                          Aluno: {aluno}
                        </span>
                        <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
                          Dia: {dia}
                        </span>
                        <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
                          Horário: {horario}
                        </span>
                      </div>
                    </div>
                    {statusFiltro === "PENDING" && (
                      <div className="flex gap-4 mt-4 md:mt-0 items-center md:ml-auto">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-600 text-green-700 font-semibold hover:bg-green-50"
                          onClick={() => handleAcao(item.id, "approve")}
                        > Aprovar </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-400 text-red-600 font-semibold hover:bg-red-50"
                          onClick={() => handleAcao(item.id, "deny")}
                        > Recusar </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
            {requisicao.length === 0 && (
              <div className="text-center text-gray-400 py-8">Nenhuma requisição encontrada.</div>
            )}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}
