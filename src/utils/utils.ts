export function converterDiaParaIngles(dia: string) {
    const map: Record<string, string> = {
      "Segunda-feira": "MONDAY",
      "Terça-feira": "TUESDAY",
      "Quarta-feira": "WEDNESDAY",
      "Quinta-feira": "THURSDAY",
      "Sexta-feira": "FRIDAY",
    };
    return map[dia] || "";
}

export function converterDiaParaPortugues(dia: string) {
  const dias: Record<string, string> = {
    MONDAY: "Segunda-feira",
    TUESDAY: "Terça-feira",
    WEDNESDAY: "Quarta-feira",
    THURSDAY: "Quinta-feira",
    FRIDAY: "Sexta-feira",
  };
  return dias[dia] || dia;
}

export function formatarHora(horario: any) {
  if (!horario) return '-';
  if (typeof horario === 'string') return horario.slice(0,5);
  if (typeof horario === 'object' && horario.hour !== undefined && horario.minute !== undefined) 
    return `${String(horario.hour).padStart(2,'0')}:${String(horario.minute).padStart(2,'0')}`;
  return '-';
}

export function formatarTempoRelativo(dataIso: string) {
  const diffMs = Date.now() - new Date(dataIso).getTime();
  const minutos = Math.floor(diffMs / 60000);
  const horas = Math.floor(minutos / 60);
  const dias = Math.floor(horas / 24);

  if (dias > 0) return `há ${dias} dia${dias > 1 ? "s" : ""}`;
  if (horas > 0) return `há ${horas} hora${horas > 1 ? "s" : ""}`;
  if (minutos > 0) return `há ${minutos} minuto${minutos > 1 ? "s" : ""}`;
  return "agora mesmo";
}

export function formatarDias(dias: string[]) {
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