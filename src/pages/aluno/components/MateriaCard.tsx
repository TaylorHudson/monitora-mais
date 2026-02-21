import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useState } from "react";
import { SolicitarHorarioModal } from "./SolicitarHorarioModal";

interface Props {
  id: number;
  nome: string;
  professor: string;
  alreadyRequested: boolean;
  expandido: boolean;
  onExpandir: () => void;
}

export function MateriaCard({ nome, professor }: Props) {
  const [modalAberto, setModalAberto] = useState(false);

  return (
    <Card
      className={`rounded-2xl shadow-lg border border-[#b2c9d6] hover:scale-[1.01] transition-all`}
    >
      <CardHeader className="pb-1">
        <CardTitle className="text-2xl font-bold text-primary">{nome}</CardTitle>
      </CardHeader>
      <CardFooter className="flex flex-col items-start gap-2 pt-0 pb-4 px-6">
        <Button
          size="lg"
          className="w-72 flex items-center gap-2 justify-center bg-green-600 hover:bg-green-700 text-white"
          variant="default"
          onClick={() => setModalAberto(true)}
        >
          Solicitar horário
        </Button>

        <SolicitarHorarioModal
          open={modalAberto}
          onOpenChange={setModalAberto}
          monitoria={nome}
        />
      </CardFooter>

    </Card>
  );
}