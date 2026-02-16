import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { toastApiError, toastError, toastSuccess } from "../../../utils/toast";
import { fetchComToken } from "../../../services/authFetch";
import { converterDiaParaIngles } from "../../../utils/utils";

type SolicitarHorarioModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  monitoria: string;
};

export function SolicitarHorarioModal({
  open,
  onOpenChange,
  monitoria,
}: SolicitarHorarioModalProps) {
  const [diaSelecionado, setDiaSelecionado] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [erroHora, setErroHora] = useState<string | null>(null);

  async function solicitarHorario(
      diaSelecionado: string,
      horaInicio: string,
      horaFim: string
  ) {
      if (horaFim <= horaInicio) {
        toastError("Erro de validação", "A hora final deve ser maior que a inicial");
        return;
      }

      if (!diaSelecionado || !horaInicio || !horaFim) {
        toastError("Erro de validação", "Preencha todos os campos antes de enviar");
        return;
      }
  
      if (!/^\d{2}:\d{2}$/.test(horaInicio) || !/^\d{2}:\d{2}$/.test(horaFim)) {
        toastError("Erro de validação", "Horário inválido. Use o formato HH:mm");
        return;
      }
  
      if (horaFim <= horaInicio) {
        toastError("Erro de validação", "A hora final deve ser posterior à hora inicial");
        return;
      }
  
      const [h1, m1] = horaInicio.split(":").map(Number);
      const [h2, m2] = horaFim.split(":").map(Number);
      if (h2 * 60 + m2 - (h1 * 60 + m1) < 30) {
        toastError("Erro de validação", "O intervalo entre o início e o fim deve ser de pelo menos 30 minutos");
        return;
      }
  
      try {
        await fetchComToken(
          `${import.meta.env.VITE_API_URL}/monitoring/schedules/students`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              {
                monitoring: monitoria,
                dayOfWeek: converterDiaParaIngles(diaSelecionado),
                startTime: horaInicio + ":00",
                endTime: horaFim + ":00",
              }
            ),
          }
        );
        onOpenChange(false);
        toastSuccess("Solicitação enviada", "Seu horário de monitoria foi solicitado. Aguarde a aprovação do professor");
      } catch (err: any) {
        toastApiError(err);
      }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    solicitarHorario(diaSelecionado, horaInicio, horaFim);
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open);

    if (!open) {
      setDiaSelecionado("");
      setHoraInicio("");
      setHoraFim("");
      setErroHora(null);
    }
  }

  const diasDaSemana = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
  ];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white border border-[#b2c9d6] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            Solicitar horário de monitoria
          </DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-primary">
              Dia da semana
            </label>
            <Select value={diaSelecionado} onValueChange={setDiaSelecionado}>
              <SelectTrigger className="w-full bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary">
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {diasDaSemana.map((dia) => (
                  <SelectItem key={dia} value={dia}>
                    {dia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-primary">
              Hora inicial
            </label>
            <input
              type="time"
              className="w-full bg-white/80 border border-[#b2c9d6] rounded px-3 py-2 focus:border-primary focus:ring-primary"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-primary">
              Hora final
            </label>
            <input
              type="time"
              className="w-full bg-white/80 border border-[#b2c9d6] rounded px-3 py-2 focus:border-primary focus:ring-primary"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
            />
          </div>

          {erroHora && (
            <div className="text-sm text-red-600">{erroHora}</div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-12 w-full text-lg bg-primary text-white hover:bg-green-700"
            >
              Enviar solicitação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
