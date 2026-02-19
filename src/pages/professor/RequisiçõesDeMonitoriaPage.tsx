import { useEffect, useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { AppSidebarProfessor } from "../../components/ui/app-sidebarprofessor";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { fetchComToken } from "../../services/authFetch";
import { Badge } from "../../components/ui/badge";
import { converterDiaParaPortugues, formatarHora } from "../../utils/utils";
import { toastApiError, toastSuccess } from "../../utils/toast";
import type { Horario } from "../../services/types/types";

type Requisicao = {
  id: number;
  monitor: string;
  discipline: string;
  dayOfWeek: string;
  startTime: Horario;
  endTime: Horario;
  status: string;
  topics: string[];
  requestedAt: Date;
};

export default function RequisicoesDeMonitoriaPage() {
  const [requisicao, setRequisicao] = useState<Requisicao[]>([]);
  const [statusFiltro, setStatusFiltro] = useState<"PENDING" | "APPROVED" | "DENIED" | null>(null);
  const [carregar, setCarregar] = useState(0);

  async function buscarRequisicoesDeMonitoria(status: string | null) {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/schedules/teachers/filter${status ? `?status=${status}` : ""}`,
        {}
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
  }, [statusFiltro, carregar]);

  async function handleAcao(id: number, acao: "approve" | "deny") {
    try {
      const url = `${import.meta.env.VITE_API_URL}/monitoring/schedules/teachers/${id}/${acao}`;
      await fetchComToken(url, { method: "PATCH" });
      toastSuccess("Requisição atualizada", `A requisição foi ${acao === "approve" ? "aprovada" : "recusada"} com sucesso`);
      setCarregar(prev => prev + 1);
    } catch (err: Error | any) {
      toastApiError(err);
    }
  }

return (
  <div className="flex h-full w-full bg-[#F1F7FA]">
    <SidebarProvider>
      <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
      <AppSidebarProfessor />

      <main className="flex-1 p-4 md:p-8 min-h-screen">
        <div className="mb-8 text-left w-full">
          <h1 className="text-3xl font-semibold mb-1 text-primary drop-shadow-sm">
            Requisições de Monitoria
          </h1>
          <p className="text-gray-700">
            Gerencie as solicitações de horários de monitoria.
          </p>

          <div className="flex gap-4 mt-6 flex-wrap">
            <Badge
              variant={statusFiltro === null ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-base"
              onClick={() => setStatusFiltro(null)}
            >
              Todos
            </Badge>

            <Badge
              variant={statusFiltro === "PENDING" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-base"
              onClick={() => setStatusFiltro("PENDING")}
            >
              Pendentes
            </Badge>

            <Badge
              variant={statusFiltro === "APPROVED" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-base"
              onClick={() => setStatusFiltro("APPROVED")}
            >
              Aprovados
            </Badge>

            <Badge
              variant={statusFiltro === "DENIED" ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-base"
              onClick={() => setStatusFiltro("DENIED")}
            >
              Negados
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {requisicao.map((item) => {
            const aluno = (item as any).monitor || "-";
            const dia = converterDiaParaPortugues(item.dayOfWeek);
            const horario = `${formatarHora(item.startTime)} - ${formatarHora(
              item.endTime
            )}`;

            return (
              <Card
                key={item.id}
                className="bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white rounded-2xl shadow-lg p-7 border border-[#b2c9d6] hover:scale-[1.01] transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {item.discipline}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <span className="inline-flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
                        Aluno: {aluno}
                      </span>

                      <span className="inline-flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
                        Dia: {dia}
                      </span>

                      <span className="inline-flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
                        Horário: {horario}
                      </span>

                      <span className="inline-flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
                        Data de Solicitação: {item.requestedAt.toLocaleDateString("pt-BR")}
                      </span>

                      {/* Badge de status (apenas na aba TODOS) */}
                      {statusFiltro === null && (
                        <>
                          {item.status === "PENDING" && (
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-semibold border border-yellow-300">
                              Pendente
                            </span>
                          )}
                          {item.status === "APPROVED" && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-300">
                              Aprovado
                            </span>
                          )}
                          {item.status === "DENIED" && (
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold border border-red-300">
                              Negado
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* BOTÕES SEMPRE QUE FOR PENDENTE */}
                  {item.status === "PENDING" && (
                    <div className="flex gap-4 md:ml-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-700 font-semibold hover:bg-green-50"
                        onClick={() => handleAcao(item.id, "approve")}
                      >
                        Aprovar
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-400 text-red-600 font-semibold hover:bg-red-50"
                        onClick={() => handleAcao(item.id, "deny")}
                      >
                        Recusar
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}

          {requisicao.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Nenhuma requisição encontrada.
            </div>
          )}
        </div>
      </main>
    </SidebarProvider>
  </div>
);


}
