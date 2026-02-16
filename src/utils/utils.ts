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