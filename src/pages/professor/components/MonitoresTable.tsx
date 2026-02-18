import { useEffect, useState } from "react";
import { fetchComToken } from "../../../services/authFetch";  
import { toastApiError } from "../../../utils/toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Eye, UserMinus2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../components/ui/alert-dialog";
import type { Agendamento, Monitor } from "../../../services/types/types";
import { converterDiaParaPortugues, formatarDias } from "../../../utils/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";

type MonitoresTableProps = {
  disciplinaId: number;
  reloadMonitoresKey: number;
};

export function MonitoresTable({ disciplinaId, reloadMonitoresKey }: MonitoresTableProps) {
  const [verDetalhesAberto, setVerDetalhesAberto] = useState(false);
  const [monitores, setMonitores] = useState<Monitor[]>([]);
  const [agendamentosAprovados, setAgendamentosAprovados] = useState<Agendamento[]>([]);

  async function carregarDetalhesDeMonitoria() {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/teachers/details/${disciplinaId}`,
        {}
      );
      const data = await res.json();
      setMonitores(data.students || []);
    } catch(err: Error | any) {
      setMonitores([]);
      toastApiError(err, "Erro ao buscar detalhes da monitoria");
    }
  }

  useEffect(() => {
    carregarDetalhesDeMonitoria();
  }, [reloadMonitoresKey]);

  async function carregarAgendamentosAprovados(monitor: Monitor) {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/schedules/teachers/filter?status=APPROVED`,
        {}
      );
      const data = await res.json();

      const agendamentosAprovados = data.filter(
        (a: Agendamento) => a.monitorRegistration === monitor.registration
      )

      setAgendamentosAprovados(agendamentosAprovados || []);
    } catch(err: Error | any) {
      setAgendamentosAprovados([]);
      toastApiError(err);
    }
  }

  function abrirDetalhes(monitor: Monitor) {
    carregarAgendamentosAprovados(monitor);
    setVerDetalhesAberto(true);
  }

  if (!monitores || monitores.length === 0) return null;

  return (
    <>
      <Dialog open={verDetalhesAberto} onOpenChange={setVerDetalhesAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Monitorias agendadas</DialogTitle>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dia</TableHead>
                <TableHead>Horário</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {agendamentosAprovados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500">
                    Nenhuma monitoria encontrada
                  </TableCell>
                </TableRow>
              )}

              {agendamentosAprovados.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {converterDiaParaPortugues(item.dayOfWeek)}
                  </TableCell>

                  <TableCell>
                    {String(item.startTime.hour).padStart(2, "0")}:
                    {String(item.startTime.minute).padStart(2, "0")}
                    {" - "}
                    {String(item.endTime.hour).padStart(2, "0")}:
                    {String(item.endTime.minute).padStart(2, "0")}
                  </TableCell>

                  <TableCell>{item.discipline}</TableCell>

                  <TableCell>{item.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <div className="mt-6 overflow-x-auto">
        <Table className="mt-6 bg-white/70 rounded-xl shadow-sm">
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead className="text-primary font-semibold">
                Nome do monitor
              </TableHead>
              <TableHead className="text-primary font-semibold">
                Matrícula
              </TableHead>
              <TableHead className="text-primary font-semibold">
                Dias de monitoria
              </TableHead>
              <TableHead className="text-primary font-semibold">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {monitores.map((monitor, index) => (
              <TableRow
                key={index}
                className="hover:bg-primary/5 transition"
              >
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

                <TableCell>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                     <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <UserMinus2 className="h-8 w-8" />
                      </Button>
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
                          onClick={() => console.log(monitor)}
                        >
                          Sim, cancelar inscrição
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>

                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => abrirDetalhes(monitor)}
                  >
                    <Eye className="h-5 w-5" />
                  </Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>

      </div>
    </>
  );
}
