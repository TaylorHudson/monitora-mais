import { useEffect, useState } from "react";
import { AppSidebarProfessor } from "../../components/ui/app-sidebarprofessor";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { fetchComToken } from "../../services/authFetch";
import type { Agendamento, Monitor, MonitoriaDetails } from "../../services/types/types";
import { toastApiError, toastSuccess } from "../../utils/toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/alert-dialog";
import { Eye, UserMinus2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { converterDiaParaPortugues, formatarDias, formatarHora } from "../../utils/utils";
import { useLoading } from "../../contexts/LoadingContext";
import { Input } from "../../components/ui/input";
import { useSearchParams } from "react-router-dom";

export default function MonitoresPage() {
    const [verDetalhesAberto, setVerDetalhesAberto] = useState(false);
    const [monitorias, setMonitorias] = useState<MonitoriaDetails[]>([]);
    const [agendamentosAprovados, setAgendamentosAprovados] = useState<Agendamento[]>([]);
    const [recarregar, setRecarregar] = useState(0);
    const { setLoading } = useLoading();
    const [searchParams, setSearchParams] = useSearchParams()
    const filtro = searchParams.get("filtro") ?? ""

    function filtroMudou(value: string) {
        if (value) {
        setSearchParams({ filtro: value })
        } else {
        setSearchParams({})
        }
    }

    async function carregarAgendamentosAprovados(monitor: Monitor, monitoria: MonitoriaDetails) {
        try {
          const res = await fetchComToken(
            `${import.meta.env.VITE_API_URL}/monitoring/schedules/teachers/filter?status=APPROVED`,
            {},
            setLoading
          );
          setLoading(true);
          await new Promise(resolve => setTimeout(resolve, 100));

          const data = await res.json();
    
          const agendamentosAprovados = data.filter(
            (a: Agendamento) => 
                a.monitorRegistration === monitor.registration &&
                a.discipline === monitoria.name
          )
    
          setAgendamentosAprovados(agendamentosAprovados || []);
        } catch(err: Error | any) {
          setAgendamentosAprovados([]);
          toastApiError(err);
        } finally {
          setLoading(false);
        }
      }

    function abrirDetalhes(monitor: Monitor, monitoria: MonitoriaDetails) {
        carregarAgendamentosAprovados(monitor, monitoria);
        setVerDetalhesAberto(true);
    }

    async function cancelarInscricao(id: number, registration: string) {
        try {
            await fetchComToken(
                `${import.meta.env.VITE_API_URL}/monitoring/${id}/students/${registration}`,
                {
                    method: "DELETE"
                },
                setLoading
            );
            
            toastSuccess("Inscrição cancelada com sucesso");
            setRecarregar(prev => prev + 1);
        } catch (err: Error | any) {
            toastApiError(err);
        }
    }

    async function carregarDetalhesDeMonitoria() {
      try {
        const res = await fetchComToken(
          `${import.meta.env.VITE_API_URL}/monitoring/teachers/details`,
          {}
        );
        const data = await res.json();
        setMonitorias(data || []);
      } catch(err: Error | any) {
        setMonitorias([]);
        toastApiError(err, "Erro ao buscar detalhes da monitoria");
      }
    }
  
    useEffect(() => {
      carregarDetalhesDeMonitoria();
    }, [recarregar]);

  return (
    <>
         <Dialog open={verDetalhesAberto} onOpenChange={setVerDetalhesAberto}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Monitorias agendadas</DialogTitle>
                    <DialogDescription>Monitorias aprovadas para este monitor nesta disciplina</DialogDescription>
                </DialogHeader>

                <Table className="rounded-xl">
                    <TableHeader className="bg-primary/10">
                        <TableRow>
                            <TableHead className="text-primary font-semibold">Disciplina</TableHead>
                            <TableHead className="text-primary font-semibold">Dia</TableHead>
                            <TableHead className="text-primary font-semibold">Horário</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                    {agendamentosAprovados.length === 0 && (
                        <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-700">
                            Nenhuma monitoria agendada
                        </TableCell>
                        </TableRow>
                    )}

                    {agendamentosAprovados.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell  className="max-w-[180px] truncate text-gray-700">
                                <span title={item.discipline}>
                                    {item.discipline}
                                </span>
                            </TableCell>
                            <TableCell className="text-gray-700">
                                {converterDiaParaPortugues(item.dayOfWeek)}
                            </TableCell>

                            <TableCell className="text-gray-700">
                                {`${formatarHora(item.startTime)} - ${formatarHora(item.endTime)}`}
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </DialogContent>
        </Dialog>

        <div className="flex h-full w-full bg-[#F1F7FA]">
        <SidebarProvider>
          <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
          <AppSidebarProfessor />
          <main className="flex-1 p-4 md:p-8 min-h-screen">
            <div className="mb-8 text-left w-full">
              <h1 className="text-3xl font-semibold mb-1 text-primary drop-shadow-sm">Monitores</h1>
              <p className="text-gray-700 text-base text-left">Gerencie os monitores de suas disciplinas</p>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mt-6 w-full">
                <div className="flex-1">
                  <Input
                    placeholder="Filtrar por disciplina..."
                    value={filtro}
                    onChange={e => filtroMudou(e.target.value)}
                    className="w-full max-w-md bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <Table className="mt-6 bg-white/70 rounded-xl shadow-sm">
            <TableHeader>
                <TableRow className="bg-primary/10">
                    <TableHead className="text-primary font-semibold">
                        Disciplina
                    </TableHead>
                    <TableHead className="text-primary font-semibold">
                        Nome do monitor
                    </TableHead>
                    <TableHead className="text-primary font-semibold">
                        Matrícula do monitor
                    </TableHead>
                    <TableHead className="text-primary font-semibold">
                        Dias de monitoria
                    </TableHead>
                    <TableHead className="text-primary font-semibold text-center">
                        Ações
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {
                    monitorias
                    .filter(m => {
                        if (!filtro) return true;
                        return (
                            m.name.toLowerCase().includes(filtro.toLowerCase())
                        )
                    })
                    .map((monitoria) => (
                        monitoria.students
                        .map((monitor) => (
                            <TableRow
                                key={monitor.registration}
                                className="hover:bg-primary/5 transition"
                            >   
                                <TableCell  className="max-w-[200px] truncate text-gray-700">
                                    <span title={monitoria.name}>
                                        {monitoria.name}
                                    </span>
                                </TableCell>

                                <TableCell className="text-gray-700">
                                {monitor.name}
                                </TableCell>

                                <TableCell className="text-gray-700">
                                {monitor.registration}
                                </TableCell>

                                <TableCell className="text-gray-700">
                                {monitor.daysOfWeek?.length > 0
                                    ? formatarDias(monitor.daysOfWeek)
                                    : "Nenhuma monitoria agendada"}
                                </TableCell>

                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <span title="Ver horários de monitoria">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="hover:bg-primary/8 transition"
                                                onClick={() => abrirDetalhes(monitor, monitoria)}
                                            >
                                                <Eye className="h-5 w-5" />
                                            </Button>
                                        </span>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <span title="Cancelar inscrição do monitor">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="hover:text-red-700 hover:bg-red-100"
                                                    >
                                                        <UserMinus2 className="h-8 w-8" />
                                                    </Button>
                                                </span>
                                            </AlertDialogTrigger>

                                            <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                Tem certeza que deseja cancelar a inscrição?
                                                </AlertDialogTitle>

                                                <AlertDialogDescription className="text-gray-600">
                                                Ao cancelar a inscrição deste monitor, ele perderá
                                                imediatamente o acesso ao sistema.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>

                                            <AlertDialogFooter>
                                                <AlertDialogCancel variant="outline" size="default">
                                                Cancelar
                                                </AlertDialogCancel>

                                                <AlertDialogAction variant="destructive" size="default"
                                                onClick={() => cancelarInscricao(monitoria.id, monitor.registration)}
                                                >
                                                Sim, cancelar inscrição
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </TableCell>

                            </TableRow>
                        ))
                    ))
                }
            </TableBody>
            </Table>
          </main>
        </SidebarProvider>
      </div>
    </>
  );
}
