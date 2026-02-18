import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatarTempoRelativo } from "../../../utils/utils";

type Disciplina = {
  id: number;
  nome: string;
  permiteMesmoHorario: boolean;
  topicos: string[];
  ultimaRequisicao?: string | null; 
  requisicoesPendentes: number;
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
      <div className="flex flex-col gap-3">
        
          <div className="font-bold text-2xl text-primary drop-shadow-sm">
            {disciplina.nome}
          </div>

          <div className="flex flex-wrap gap-3 mt-2">

            <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
              {disciplina.permiteMesmoHorario
                ? "Permite monitorias no mesmo horário"
                : "Não permite monitorias no mesmo horário"}
            </span>

            <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
              Requisições pendentes: {disciplina.requisicoesPendentes}
            </span>

            <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
              Tópicos: {
                disciplina.topicos.length > 0
                  ? disciplina.topicos.length > 3
                    ? disciplina.topicos.slice(0, 3).join(", ") +
                      ` +${disciplina.topicos.length - 3}`
                    : disciplina.topicos.join(", ")
                  : "Nenhum tópico disponível"
              }
            </span>

            <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold border border-primary/20">
              Última requisição: {
                disciplina.ultimaRequisicao
                  ? formatarTempoRelativo(disciplina.ultimaRequisicao)
                  : "Nenhuma requisição feita"
              }
            </span>

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
