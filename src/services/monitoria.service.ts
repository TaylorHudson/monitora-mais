import { fetchComToken } from "@/utils/fetchComToken";

export type MonitoringSchedule = {
  id: number;
  discipline: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  topics?: string[];
};

export async function carregarMonitoriasDoAluno(): Promise<MonitoringSchedule[]> {
  const res = await fetchComToken(
    `${import.meta.env.VITE_API_URL}/monitoring/schedules/students/me`
  );

  return res.json();
}
