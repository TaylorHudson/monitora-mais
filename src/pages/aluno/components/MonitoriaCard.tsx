import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../../components/ui/card";

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
  const diasSemana: Record<string, string> = {
    MONDAY: "Segunda-feira",
    TUESDAY: "Terça-feira",
    WEDNESDAY: "Quarta-feira",
    THURSDAY: "Quinta-feira",
    FRIDAY: "Sexta-feira",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
  };

  return (
    <Card className="w-full bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white rounded-xl shadow-md border border-[#b2c9d6] transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary drop-shadow-sm">
          {monitoria.discipline}
        </CardTitle>
        <CardDescription className="text-gray-700">
          Matrícula do monitor:{" "}
          <span className="font-medium text-primary">{monitoria.monitor}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 px-6 pb-4">
        <div className="text-sm text-gray-800">
          <span className="font-medium text-primary">Dia:</span>{" "}
          {diasSemana[monitoria.dayOfWeek] || monitoria.dayOfWeek}
        </div>
        <div className="text-sm text-gray-800">
          <span className="font-medium text-primary">Horário:</span>{" "}
          {monitoria.startTime.slice(0, 5)} - {monitoria.endTime.slice(0, 5)}
        </div>
      </CardContent>
    </Card>
  );
}