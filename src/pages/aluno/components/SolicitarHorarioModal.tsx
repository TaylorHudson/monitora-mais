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

type SolicitarHorarioData = {
  dia: string;
  horaInicio: string;
  horaFim: string;
};

type SolicitarHorarioModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diasDaSemana: string[];
  loading: boolean;
  onSubmit: (data: SolicitarHorarioData) => void;
};

export function SolicitarHorarioModal({
  open,
  onOpenChange,
  diasDaSemana,
  loading,
  onSubmit,
}: SolicitarHorarioModalProps) {
  const [diaSelecionado, setDiaSelecionado] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [erroHora, setErroHora] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!diaSelecionado || !horaInicio || !horaFim) {
      setErroHora("Preencha todos os campos.");
      return;
    }

    if (horaFim <= horaInicio) {
      setErroHora("A hora final deve ser maior que a inicial.");
      return;
    }

    setErroHora(null);

    onSubmit({
      dia: diaSelecionado,
      horaInicio,
      horaFim,
    });
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white border border-[#b2c9d6] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            Solicitar horário de monitoria
          </DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
          {/* Dia da semana */}
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

          {/* Hora inicial */}
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

          {/* Hora final */}
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

          {/* Erro */}
          {erroHora && (
            <div className="text-sm text-red-600">{erroHora}</div>
          )}

          {/* Botão */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="h-12 w-full text-lg bg-primary text-white hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar solicitação"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
