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
  <Card className="w-full bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white rounded-xl shadow-md border border-[#b2c9d6] transition-all duration-300">
    <CardHeader>
      <CardTitle className="text-lg font-semibold text-primary drop-shadow-sm">
        {monitoria.discipline}
      </CardTitle>
    </CardHeader>

    <CardContent className="px-6 pb-4">
      <div className="flex flex-wrap gap-3 mt-2">
        {/* Disciplina */}
        <span className="inline-flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
          Disciplina: {monitoria.discipline}
        </span>

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