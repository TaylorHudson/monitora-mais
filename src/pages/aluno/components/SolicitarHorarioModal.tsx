import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import { Label } from "../../../components/ui/label";
import { Form, FormField, FormItem, FormControl, FormMessage } from "../../../components/ui/form";
import { toastApiError, toastSuccess } from "../../../utils/toast";
import { fetchComToken } from "../../../services/authFetch";
import { converterDiaParaIngles } from "../../../utils/utils";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const solicitarHorarioSchema = z
  .object({
    dia: z.string().min(1, "O dia da semana é obrigatório"),
    horaInicio: z.string().min(1, "A hora inicial é obrigatória"),
    horaFim: z.string().min(1, "A hora final é obrigatória"),
  })
  .refine(
    (data) => data.horaFim > data.horaInicio,
    {
      message: "A hora final deve ser maior que a inicial",
      path: ["horaFim"],
    }
  )
  .refine(
    (data) => {
      const [h1, m1] = data.horaInicio.split(":").map(Number);
      const [h2, m2] = data.horaFim.split(":").map(Number);
      return h2 * 60 + m2 - (h1 * 60 + m1) >= 30;
    },
    {
      message: "O intervalo mínimo deve ser de 30 minutos",
      path: ["horaFim"],
    }
  );

export type SolicitarHorarioForm = z.infer<typeof solicitarHorarioSchema>;

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
  const form = useForm<SolicitarHorarioForm>({
    resolver: zodResolver(solicitarHorarioSchema),
    defaultValues: {
      dia: "",
      horaInicio: "",
      horaFim: "",
    },
  });

  async function onSubmit(data: SolicitarHorarioForm) {
    try {
      await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/schedules/students`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            monitoring: monitoria,
            dayOfWeek: converterDiaParaIngles(data.dia),
            startTime: data.horaInicio + ":00",
            endTime: data.horaFim + ":00",
          }),
        }
      );

      toastSuccess(
        "Solicitação enviada",
        "Seu horário de monitoria foi solicitado. Aguarde a aprovação do professor"
      );

      onOpenChange(false);
      form.reset();
    } catch (err) {
      toastApiError(err);
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
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) form.reset();
      }}
    >
      <DialogContent className="max-w-lg bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white border border-[#b2c9d6] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">
            Solicitar horário de monitoria
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-4">

            {/* Dia */}
            <FormField
              control={form.control}
              name="dia"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-primary">Dia da semana</Label>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary">
                        <SelectValue placeholder="Selecione o dia da semana" />
                      </SelectTrigger>
                      <SelectContent>
                        {diasDaSemana.map((dia) => (
                          <SelectItem key={dia} value={dia}>
                            {dia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hora inicial */}
            <FormField
              control={form.control}
              name="horaInicio"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-primary">Hora inicial</Label>
                  <FormControl>
                    <input
                      type="time"
                      {...field}
                      className="w-full bg-white/80 border border-[#b2c9d6] rounded px-3 py-2 focus:border-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Hora final */}
            <FormField
              control={form.control}
              name="horaFim"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-primary">Hora final</Label>
                  <FormControl>
                    <input
                      type="time"
                      {...field}
                      className="w-full bg-white/80 border border-[#b2c9d6] rounded px-3 py-2 focus:border-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="h-12 w-full text-lg bg-primary text-white hover:bg-green-700"
            >
              Enviar solicitação
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}