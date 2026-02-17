import { useEffect, useState } from "react";
import { fetchComToken } from "../../../services/authFetch";  
import { toastApiError } from "../../../utils/toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { UserMinus2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../../components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";

type Monitor = {
  name: string;
  registration: string;
  daysOfWeek: string[];
};

type MonitoresTableProps = {
  disciplinaId: number;
  reloadMonitoresKey: number;
};

function formatarDias(dias: string[]) {
  const mapa: Record<string, string> = {
    MONDAY: "Seg.",
    TUESDAY: "Ter.",
    WEDNESDAY: "Qua.",
    THURSDAY: "Qui.",
    FRIDAY: "Sex.",
    SATURDAY: "Sáb.",
    SUNDAY: "Dom.",
  };

  return dias.map(d => mapa[d] || d).join(", ");
}


export function MonitoresTable({ disciplinaId, reloadMonitoresKey }: MonitoresTableProps) {
  const [monitores, setMonitores] = useState<Monitor[]>([]);

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

  if (!monitores || monitores.length === 0) return null;

  return (
    <>
      <div className="mt-6 overflow-x-auto">
        {/* <table className="w-full border-collapse rounded-xl overflow-hidden bg-white/70 shadow-sm">
          <thead className="bg-primary/10">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-primary">
                Nome do monitor
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-primary">
                Matrícula
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-primary">
                Dias de monitoria
              </th>
            </tr>
          </thead>
          <tbody>
            {monitores.map((monitor, index) => (
              <tr
                key={index}
                className="border-t border-[#b2c9d6] hover:bg-primary/5 transition"
              >
                <td className="px-4 py-3 text-sm text-gray-700">
                  {monitor.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {monitor.registration}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {monitor.daysOfWeek?.length > 0
                    ? formatarDias(monitor.daysOfWeek)
                    : "Nenhuma monitoria agendada"}
                </td>
              </tr>
            ))}
          </tbody>
        </table> */}

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

              </TableRow>
            ))}
          </TableBody>
        </Table>

      </div>
    </>
  );
}
