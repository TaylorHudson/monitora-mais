import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { fetchComToken } from "../../../services/authFetch";
import { toastApiError, toastError } from "../../../utils/toast";
import { useNavigate } from "react-router-dom";
import type { Disciplina } from "../../../services/types/types";

type CriarDisciplinaModalProps = {
    disciplina: Disciplina | null;
    modalAberto: boolean;
    setModalAberto: (aberto: boolean) => void;
}

export default function CriarDisciplinaModal({ disciplina, modalAberto, setModalAberto }: CriarDisciplinaModalProps) {
    const [topicoInput, setTopicoInput] = useState("");
    const [novaDisciplina, setNovaDisciplina] = useState({ nome: "", permiteMesmoHorario: false, topicos: [] as string[] });
    const navigate = useNavigate();

    useEffect(() => {
        if (modalAberto && disciplina) {
            setNovaDisciplina({
            nome: disciplina.nome,
            permiteMesmoHorario: disciplina.permiteMesmoHorario,
            topicos: disciplina.topicos ?? []
            });
        }

        if (!modalAberto) {
            setNovaDisciplina({ nome: "", permiteMesmoHorario: false, topicos: [] });
            setTopicoInput("");
        }
    }, [modalAberto, disciplina]);


    async function handleCriarDisciplina(e: React.FormEvent) {
         e.preventDefault();
    
        try {
          await fetchComToken(
            `${import.meta.env.VITE_API_URL}/monitoring/teachers`, 
            {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: novaDisciplina.nome,
              allowMonitorsSameTime: novaDisciplina.permiteMesmoHorario,
              topics: novaDisciplina.topicos,
            }),
          },
        );
    
          setNovaDisciplina({ nome: "", permiteMesmoHorario: false, topicos: [] });
          setTopicoInput("");
          setModalAberto(false);
          navigate(0);
        } catch(err: Error | any) {
          if (err.message && (err.message.includes('duplicate key value') || err.message.includes('violates unique constraint'))) {
            toastError('Nome inválido', 'Já existe uma disciplina com esse nome');
          } else {
            toastApiError(err);
          }
        }
      }

    return (
        <Dialog 
            open={modalAberto} 
            onOpenChange={(open) => {
            setModalAberto(open);
            if (!open) {
                setNovaDisciplina({ nome: "", permiteMesmoHorario: false, topicos: [] });
                setTopicoInput("");
            }}}
        >
            <DialogContent className="max-w-2xl p-8 bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white border border-[#b2c9d6]">
            <DialogHeader>
                <DialogTitle className="text-2xl mb-2 text-primary drop-shadow-sm">
                    {disciplina ? "Editar Disciplina" : "Criar Disciplina"}
                </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCriarDisciplina} className="space-y-6 mt-4">
                <div className="flex flex-col gap-2">
                <Label htmlFor="nome" className="text-primary">Nome da monitoria</Label>
                <Input
                    id="nome"
                    value={novaDisciplina.nome}
                    onChange={e => setNovaDisciplina({ ...novaDisciplina, nome: e.target.value })}
                    required
                    className="h-12 text-lg bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
                />
                </div>
                <div className="flex items-center gap-4">
                <Checkbox
                    id="permiteMesmoHorario"
                    checked={novaDisciplina.permiteMesmoHorario}
                    onCheckedChange={checked => setNovaDisciplina({ ...novaDisciplina, permiteMesmoHorario: !!checked })}
                />
                <Label htmlFor="permiteMesmoHorario" className="cursor-pointer text-base text-primary">Permitir monitores no mesmo horário</Label>
                </div>
                
                <div className="flex flex-col gap-2">
                <Label htmlFor="topicos" className="text-primary">Tópicos</Label>
                <div className="flex gap-2">
                    <Input
                    id="topicos"
                    placeholder="Digite um tópico e pressione Enter"
                    value={topicoInput}
                    onChange={e => setTopicoInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === "Enter" && topicoInput.trim()) {
                        e.preventDefault();
                        if (!novaDisciplina.topicos.includes(topicoInput.trim())) {
                            setNovaDisciplina({ ...novaDisciplina, topicos: [...novaDisciplina.topicos, topicoInput.trim()] });
                        }
                        setTopicoInput("");
                        }
                    }}
                    className="h-12 text-lg flex-1 bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
                    />
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    {novaDisciplina.topicos.map((topico, idx) => (
                    <span key={idx} className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium shadow">
                        {topico}
                        <button
                        type="button"
                        className="ml-2 text-primary hover:text-red-500 focus:outline-none"
                        onClick={() => setNovaDisciplina({ ...novaDisciplina, topicos: novaDisciplina.topicos.filter((_, i) => i !== idx) })}
                        aria-label={`Remover tópico ${topico}`}
                        >
                        ×
                        </button>
                    </span>
                    ))}
                </div>
                </div>
                <DialogFooter>
                <Button type="submit" className="w-full h-12 text-lg bg-primary text-white hover:bg-green-700">
                     Confirmar
                </Button>
                </DialogFooter>
            </form>
            </DialogContent>
        </Dialog>
    );
}