type Monitor = {
  monitor: string;
  registration: string;
  days?: string[];
};

type MonitoresTableProps = {
  monitors: Monitor[];
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

export function MonitoresTable({ monitors }: MonitoresTableProps) {
  if (!monitors || monitors.length === 0) return null;

  return (
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
          {monitors.map((schedule, index) => (
            <tr
              key={index}
              className="border-t border-[#b2c9d6] hover:bg-primary/5 transition"
            >
              <td className="px-4 py-3 text-sm text-gray-700">
                {schedule.monitor}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {schedule.registration}
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">
                {schedule.days
                  ? formatarDias(schedule.days)
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
