import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/card";
import { converterDiaParaPortugues } from "../../../utils/utils";

type Monitoria = {
  id: number;
  monitor: string;
  discipline: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

interface MonitoriaCardProps {
  monitoria: Monitoria;
}

export function MonitoriaCard({ monitoria }: MonitoriaCardProps) {

  return (
  <Card className="rounded-2xl shadow-lg border border-[#b2c9d6] hover:scale-[1.01] transition-all">
    <CardHeader>
      <CardTitle className="text-2xl font-bold text-primary">
        {monitoria.discipline}
      </CardTitle>
    </CardHeader>

    <CardContent className="px-4 pb-4">
      <div className="flex flex-wrap gap-3">
        {/* Dia */}
        <span className="inline-flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
          Dia: {converterDiaParaPortugues(monitoria.dayOfWeek)}
        </span>

        {/* Horário */}
        <span className="inline-flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
          Horário: {monitoria.startTime.slice(0, 5)} -{" "}
          {monitoria.endTime.slice(0, 5)}
        </span>
      </div>
    </CardContent>
  </Card>
);
}