import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useState } from "react";
import { fetchComToken } from "../../../services/authFetch";
import { SolicitarHorarioModal } from "./SolicitarHorarioModal";

interface Props {
  id: number;
  nome: string;
  professor: string;
  alreadyRequested: boolean;
  expandido: boolean;
  onExpandir: () => void;
}

const diasDaSemana = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
];

export function MateriaCard({ id, nome, professor, alreadyRequested, expandido, onExpandir }: Props) {
  const [loading, setLoading] = useState(false);
  const [erroHora, setErroHora] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  // Função para converter o dia da semana para o formato da API
  function traduzirDiaParaApi(dia: string) {
    const map: Record<string, string> = {
      "Segunda-feira": "MONDAY",
      "Terça-feira": "TUESDAY",
      "Quarta-feira": "WEDNESDAY",
      "Quinta-feira": "THURSDAY",
      "Sexta-feira": "FRIDAY",
    };
    return map[dia] || "";
  }

  async function handleSubmit(
  diaSelecionado: string,
  horaInicio: string,
  horaFim: string
  ) {
    setErroHora(null);

    if (!diaSelecionado || !horaInicio || !horaFim) {
      setErroHora("Preencha todos os campos antes de enviar.");
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(horaInicio) || !/^\d{2}:\d{2}$/.test(horaFim)) {
      setErroHora("Horário inválido. Use o formato HH:mm.");
      return;
    }

    if (horaFim <= horaInicio) {
      setErroHora("A hora final deve ser posterior à hora inicial.");
      return;
    }

    const [h1, m1] = horaInicio.split(":").map(Number);
    const [h2, m2] = horaFim.split(":").map(Number);
    if (h2 * 60 + m2 - (h1 * 60 + m1) < 30) {
      setErroHora("O intervalo entre o início e o fim deve ser de pelo menos 30 minutos.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        monitoring: nome,
        dayOfWeek: traduzirDiaParaApi(diaSelecionado),
        startTime: horaInicio + ":00",
        endTime: horaFim + ":00",
      };

      await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/schedules/students`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      onExpandir();
      window.location.reload();

    } catch (err: any) {
      setErroHora(err.message || "Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }


  return (
    <Card
      className={`w-full mb-8 transition-all duration-300 rounded-xl shadow-md border border-[#b2c9d6] p-0 bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white ${alreadyRequested ? 'opacity-80' : ''}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-primary drop-shadow-sm">{nome}</CardTitle>
        <CardDescription className="text-gray-700">Professor: {professor}</CardDescription>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2 pt-0 pb-4 px-6">
        <Button
          size="lg"
          className="w-72 flex items-center gap-2 justify-center bg-green-600 hover:bg-green-700 text-white"
          variant="default"
          onClick={() => setModalAberto(true)}
          disabled={loading}
        >
          Solicitar horário
        </Button>

        <SolicitarHorarioModal
          open={modalAberto}
          onOpenChange={setModalAberto}
          diasDaSemana={diasDaSemana}
          loading={loading}
          onSubmit={({ dia, horaInicio, horaFim }) => {
            handleSubmit(dia, horaInicio, horaFim);
          }}
        />
      </CardFooter>

    </Card>
  );
}