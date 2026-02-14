import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";

type Disciplina = {
  id: number;
  nome: string;
};

type Props = {
  disciplina: Disciplina;
  expanded: boolean;
  onToggleExpand: () => void;
  children: React.ReactNode;
};

export function DisciplinaCard({
  disciplina,
  expanded,
  onToggleExpand,
  children,
}: Props) {
  return (
    <Card className="bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white w-full rounded-2xl shadow-lg p-7 flex flex-col border border-[#b2c9d6] transition-all hover:scale-[1.01]">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 flex-1">
        <div className="font-bold text-2xl text-primary drop-shadow-sm mb-1">
          {disciplina.nome}
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpand}
          className="rounded-full border-2 border-primary bg-white shadow p-2 hover:bg-primary/10 transition-all"
        >
          {expanded ? (
            <ChevronUp className="w-7 h-7 text-primary" />
          ) : (
            <ChevronDown className="w-7 h-7 text-primary" />
          )}
        </Button>
      </div>

      {expanded && children}
    </Card>
  );
}
