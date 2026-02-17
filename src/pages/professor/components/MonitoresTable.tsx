import { useEffect, useState } from "react";
import { fetchComToken } from "../../../services/authFetch";
import { useLoading } from "../../../contexts/LoadingContext";
import { toastApiError } from "../../../utils/toast";

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
  const { setLoading } = useLoading();

  async function carregarDetalhesDeMonitoria() {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/teachers/details/${disciplinaId}`,
        {},
        setLoading
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
        <table className="w-full border-collapse rounded-xl overflow-hidden bg-white/70 shadow-sm">
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
        </table>
      </div>
    </>
  );
}
