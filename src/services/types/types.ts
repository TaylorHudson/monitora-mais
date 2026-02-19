export type Monitor = {
  name: string;
  registration: string;
  daysOfWeek: string[];
};

export type Disciplina = {
  id: number;
  nome: string;
  permiteMesmoHorario: boolean;
  topicos: string[];
  ultimaRequisicao?: string | null; 
};

export type Horario = {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export type Agendamento = {
  id: number;
  monitorRegistration: string;
  monitor: string;
  discipline: string;
  dayOfWeek: string;
  startTime: Horario;
  endTime: Horario;
  status: "PENDING" | "APPROVED" | "DENIED";
};

export type MonitoriaDetails = {
  id: number;
  name: string;
  teacher: string | null;
  students: AlunoDetails[];
};

export type AlunoDetails = {
  name: string;
  registration: string;
  daysOfWeek: DayOfWeek[];
};

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";
