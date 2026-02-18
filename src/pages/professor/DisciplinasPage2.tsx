import { useState, useEffect } from "react";
import { AppSidebarProfessor } from "../../components/ui/app-sidebarprofessor";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Plus, Trash2, UserPlus2, Users2 } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { fetchComToken } from "../../services/authFetch";
import { toastApiError, toastError, toastSuccess } from "../../utils/toast";
import { useLoading } from "../../contexts/LoadingContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { formatarTempoRelativo } from "../../utils/utils";
import { AdicionarMonitorModal } from "./components/AdicionarMonitorModal";
import { useNavigate, useSearchParams } from "react-router-dom";


type Disciplina = {
  id: number;
  nome: string;
  permiteMesmoHorario: boolean;
  topicos: string[];
  ultimaRequisicao?: string | null; 
};

export default function DisciplinasPage2() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaDisciplina, setNovaDisciplina] = useState({ nome: "", permiteMesmoHorario: false, topicos: [] as string[] });
  const [topicoInput, setTopicoInput] = useState("");
  const { setLoading } = useLoading();
  const [openModal, setOpenModal] = useState(false);
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const filtro = searchParams.get("filtro") ?? "";
  const [recarregar, setRecarregar] = useState(0);

  function filtroMudou(value: string) {
            if (value) {
            setSearchParams({ filtro: value })
            } else {
            setSearchParams({})
            }
        }

  async function carregarDisciplinas() {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/teachers/me`,
        {}, 
        setLoading
      );
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100));
     
      const data = await res.json();
      setDisciplinas(
        data.map((d: any) => {
          const schedules = d.schedules || [];
          const ultimaRequisicao = schedules.length
            ? schedules.reduce((maisRecente: any, atual: any) =>
                new Date(atual.requestedAt) > new Date(maisRecente.requestedAt)
                  ? atual
                  : maisRecente
              )
            : null;

          return {
            id: d.id,
            nome: d.name,
            permiteMesmoHorario: d.allowMonitorsSameTime,
            topicos: d.topics || [],
            ultimaRequisicao: ultimaRequisicao ? ultimaRequisicao.requestedAt : null
          }
        })
      );
    }
    catch {
      setDisciplinas([]);
    } finally{
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDisciplinas();
  }, [recarregar]);

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
      setLoading
    );

      setNovaDisciplina({ nome: "", permiteMesmoHorario: false, topicos: [] });
      setTopicoInput("");
      setModalAberto(false);
      toastSuccess('Disciplina criada', 'Disciplina criada com sucesso');
      setRecarregar(prev => prev + 1);
    } catch(err: Error | any) {
      if (err.message && (err.message.includes('duplicate key value') || err.message.includes('violates unique constraint'))) {
        toastError('Nome inválido', 'Já existe uma disciplina com esse nome');
      } else {
        toastApiError(err);
      }
    }
  }

  type NovoMonitor = {
    matricula: string;
  };

  async function handleAddMonitor(monitor: NovoMonitor) {
    try {
      if (!monitor.matricula.trim()) return;

      const disciplina = disciplinas.find(d => d.id === disciplinaId);
      if (!disciplina) {
        setLoading(false);
        return;
      }

      await fetchComToken(`${import.meta.env.VITE_API_URL}/monitoring/students/subscribe`, 
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentRegistration: monitor.matricula,
          monitoringName: disciplina.nome,
        }),
      });

      toastSuccess(
        "Monitor adicionado",
        "O monitor foi vinculado com sucesso"
      );
    } catch (err: Error | any) {
      toastApiError(err);
    }
  }

  return (
    <>
        <AdicionarMonitorModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onConfirm={(data) => handleAddMonitor(data)}
        />

        <div className="flex h-full w-full bg-[#F1F7FA]">
        <SidebarProvider>
          <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
          <AppSidebarProfessor />
          <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white min-h-screen">
            <div className="mb-8 text-left w-full">
              <h1 className="text-3xl font-semibold mb-1 text-primary drop-shadow-sm">Disciplinas</h1>
              <p className="text-gray-700 text-base text-left">Gerencie as suas disciplinas cadastradas</p>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mt-6 w-full">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar disciplina..."
                    value={filtro}
                    onChange={e => filtroMudou(e.target.value)}
                    className="w-full max-w-md bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end w-full md:w-auto">
                  <Button
                    variant="ghost"
                    onClick={() => setModalAberto(true)}
                    aria-label="Nova disciplina"
                    className="
                      bg-primary 
                      text-white 
                      hover:bg-green-700
                      flex items-center gap-2
                      px-4
                      h-10
                    "
                  >
                    <Plus className="w-5 h-5" />
                    Nova disciplina
                  </Button>

                </div>
            </div>
            </div>

            <Table className="mt-6 bg-white/70 rounded-xl shadow-sm">
                <TableHeader className="bg-primary/10">
                    <TableRow>
                        <TableHead className="text-primary font-semibold">Nome</TableHead>
                        <TableHead className="text-primary font-semibold">Tópicos</TableHead>
                        <TableHead className="text-primary font-semibold">Permite monitorias no mesmo horário</TableHead>
                        <TableHead className="text-primary font-semibold">Última requisição</TableHead>
                        <TableHead className="text-primary font-semibold text-center">Ações</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                {disciplinas.length === 0 && (
                    <TableRow className="hover:bg-primary/5 transition">
                    <TableCell colSpan={4} className="text-center text-gray-700">
                        Nenhuma disciplina cadastrada
                    </TableCell>
                    </TableRow>
                )}

                {disciplinas.map((item, index) => (
                    <TableRow key={index} className="hover:bg-primary/5 transition">
                        <TableCell className="max-w-[280px] truncate text-gray-700">
                            <span title={item.nome}>
                                {item.nome}
                            </span>
                        </TableCell>
                        <TableCell className="max-w-[280px] truncate text-gray-700">
                          <span title={item.topicos.join(", ")}>
                            {
                              item.topicos.length > 0
                                ? item.topicos.length > 3 ? 
                                  item.topicos.slice(0, 3).join(", ") + ` +${item.topicos.length - 3}`
                                  : item.topicos.join(", ")
                                : "Nenhum tópico cadastrado"
                            }
                          </span>
                            
                        </TableCell>

                        <TableCell className="max-w-[100px] truncate text-gray-700">
                            {
                              item.permiteMesmoHorario
                                ? "Sim"
                                : "Não"
                            }
                        </TableCell>

                        <TableCell className="text-gray-700">
                            {
                              item.ultimaRequisicao
                                ? formatarTempoRelativo(item.ultimaRequisicao)
                                : "Nenhuma requisição feita"
                            }
                        </TableCell>

                        <TableCell className="text-center text-gray-700">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setOpenModal(true);
                                setDisciplinaId(item.id);
                              }}
                            >
                              <UserPlus2 className="h-5 w-5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                navigate(`/professor/monitores?filtro=${item.nome}`);
                              }}
                            >
                              <Users2 className="h-5 w-5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                navigate(`/professor/monitores?filtro=${item.nome}`);
                              }}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>

            {/* Modal de criação de disciplina */}
            <Dialog open={modalAberto} onOpenChange={setModalAberto}>
              <DialogContent className="max-w-2xl p-8 bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white border border-[#b2c9d6]">
                <DialogHeader>
                  <DialogTitle className="text-2xl mb-2 text-primary drop-shadow-sm">Nova Disciplina</DialogTitle>
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
                  {/* Campo de tópicos */}
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
                    <Button type="submit" className="w-full h-12 text-lg bg-primary text-white hover:bg-green-700">Criar disciplina</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </main>
        </SidebarProvider>
      </div>
    </>
  );
}
