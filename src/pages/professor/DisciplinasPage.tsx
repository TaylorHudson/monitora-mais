import { useState, useEffect } from "react";
import { AppSidebarProfessor } from "../../components/ui/app-sidebarprofessor";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Plus } from "lucide-react";
import { Checkbox } from "../../components/ui/checkbox";
import { fetchComToken } from "../../services/authFetch";
import { DisciplinaCard } from "./components/DisciplinaCard";
import { DisciplinaExpand } from "./components/DisciplinaExpand";
import { toastApiError, toastSuccess } from "../../utils/toast";
import { useLoading } from "../../contexts/LoadingContext";

type Disciplina = {
  id: number;
  nome: string;
  permiteMesmoHorario: boolean;
  topicos: string[];
  ultimaRequisicao?: string | null; 
  requisicoesPendentes: number;
};

export default function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [novaDisciplina, setNovaDisciplina] = useState({ nome: "", permiteMesmoHorario: false, topicos: [] as string[] });
  const [topicoInput, setTopicoInput] = useState("");
  const [filtro, setFiltro] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editando, setEditando] = useState<null | number>(null);
  const [editDisciplina, setEditDisciplina] = useState<{ nome: string; permiteMesmoHorario: boolean; topicos: string[] }>({ nome: "", permiteMesmoHorario: false, topicos: [] });
  const [editTopicoInput, setEditTopicoInput] = useState("");
  const [reloadMonitoresKey, setReloadMonitoresKey] = useState(0);

  const [disciplinaSelecionada, setDisciplinaSelecionada] = useState<number | null>(null);
  const { setLoading } = useLoading();

  async function carregarMonitorias() {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/teachers/me`,
        {}, 
        setLoading
      );
      const data = await res.json();
      if (Array.isArray(data)) {
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
            
            const requisicoesPendentes = schedules.filter((s: any) => s.status === "PENDING").length;

            return {
              id: d.id,
              nome: d.name,
              permiteMesmoHorario: d.allowMonitorsSameTime,
              topicos: d.topics || [],
              ultimaRequisicao: ultimaRequisicao ? ultimaRequisicao.requestedAt : null,
              requisicoesPendentes: requisicoesPendentes
            }
          })
        );

      } else {
        setDisciplinas([]);
      } 
    }
    catch {
      setDisciplinas([]);
    }
  }

  useEffect(() => {
    carregarMonitorias();
  }, []);

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    if (type === 'success') {
      window.alert(message);
    } else {
      window.alert(message);
    }
  }

  async function handleCriarDisciplina() {
    try {
      setLoading(true);
      const res = await fetchComToken(`${import.meta.env.VITE_API_URL}/monitoring/teachers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: novaDisciplina.nome,
          allowMonitorsSameTime: novaDisciplina.permiteMesmoHorario,
          topics: novaDisciplina.topicos,
        }),
      })

      const data = await res.json()
          setDisciplinas(prev => [
            ...prev,
            {
              id: data.id,
              nome: data.name,
              monitores: data.monitors?.length || 0,
              professor: data.teacher,
              topicos: data.topics || [],
              permiteMesmoHorario: data.allowMonitorsSameTime || false,
            },
      ]);
      setNovaDisciplina({ nome: "", permiteMesmoHorario: false, topicos: [] });
      setTopicoInput("");
      setModalAberto(false);
      showToast('Disciplina criada com sucesso!', 'success');
    } catch(err: Error | any) {
      if (err.message && (err.message.includes('duplicate key value') || err.message.includes('violates unique constraint'))) {
        showToast('Já existe uma disciplina/monitoria com esse nome ou identificador. Tente outro nome.', 'error');
      } else {
        showToast('Erro ao criar monitoria: ' + (err.message || 'Erro desconhecido'), 'error');
      }
      console.error('Erro ao criar monitoria:', err);
    } finally {
      setLoading(false);
    }
  }

  type NovoMonitor = {
    matricula: string;
  };

  async function handleAddMonitor(discId: number, monitor: NovoMonitor) {
    try {
      if (!monitor.matricula.trim()) return;

      setLoading(true);

      const disciplina = disciplinas.find(d => d.id === discId);
      if (!disciplina) {
        setLoading(false);
        return;
      }

      await fetchComToken(`${import.meta.env.VITE_API_URL}/monitoring/students/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentRegistration: monitor.matricula,
          monitoringName: disciplina.nome,
        }),
      })

      toastSuccess(
        "Monitor adicionado",
        "O monitor foi vinculado com sucesso"
      );
      setReloadMonitoresKey((prev) => prev + 1);
    } catch (err: Error | any) {
      toastApiError(err);
    } finally {
      setLoading(false);
    }
  }

  function handleDeleteDisciplina(id: number) {
    setLoading(true);
    fetchComToken(`${import.meta.env.VITE_API_URL}/monitoring/${id}`, {
      method: "DELETE"
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then(msg => { throw new Error(msg); });
        }
        setDisciplinas(disciplinas => disciplinas.filter(d => d.id !== id));
        showToast('Disciplina removida com sucesso!', 'success');
      })
      .catch(() => {
        showToast("Não é possível remover esta disciplina/monitoria pois existem monitorias agendadas ou dependências associadas a ela.", 'error');
      })
      .finally(() => setLoading(false));
  }

  // Função para abrir modal de edição
  function abrirEdicao(disc: any) {
    setEditando(disc.id);
    setEditDisciplina({
      nome: disc.nome,
      permiteMesmoHorario: disc.permiteMesmoHorario,
      topicos: disc.topicos || [],
    });
    setEditTopicoInput("");
  }

  function handleEditarDisciplina(e: React.FormEvent) {
    e.preventDefault();
    if (editando == null) return;
    setLoading(true);
    fetchComToken(`${import.meta.env.VITE_API_URL}/monitoring/${editando}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editDisciplina.nome,
        allowMonitorsSameTime: editDisciplina.permiteMesmoHorario,
        topics: editDisciplina.topicos,
      }),
    })
      .then(res => res.json())
      .then((data) => {
        setDisciplinas(disciplinas => disciplinas.map(d =>
          d.id === editando
            ? {
                ...d,
                nome: data.name,
                permiteMesmoHorario: data.allowMonitorsSameTime,
                topicos: data.topics || [],
              }
            : d
        ));
        setEditando(null);
      })
      .finally(() => setLoading(false));
  }

  return (
    <>
        <div className="flex h-full w-full bg-[#F1F7FA]">
        <SidebarProvider>
          <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
          <AppSidebarProfessor />
          <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white min-h-screen">
            <div className="mb-8 text-left w-full">
              <h1 className="text-3xl font-semibold mb-1 text-primary drop-shadow-sm">Disciplinas</h1>
              <p className="text-gray-700 text-base text-left">Gerencie as suas disciplinas cadastradas.</p>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mt-6 w-full">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar disciplina..."
                    value={filtro}
                    onChange={e => setFiltro(e.target.value)}
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
            <div className="flex flex-col gap-6 w-full">
              {disciplinas
                .filter(d =>
                  !filtro ||
                  d.nome.toLowerCase().includes(filtro.toLowerCase())
                )
                .length === 0 && (
                <div className="text-center text-gray-400 py-8">Nenhuma disciplina encontrada.</div>
              )}
              {disciplinas
                .filter(d =>
                  !filtro ||
                  d.nome.toLowerCase().includes(filtro.toLowerCase())
                )
                .map((disc) => (
                  <DisciplinaCard
                    key={disc.id}
                    disciplina={disc}
                    expanded={expanded === disc.id}
                    onToggleExpand={() =>
                      setExpanded(expanded === disc.id ? null : disc.id)
                    }
                  >
                    {expanded === disc.id && (
                      <DisciplinaExpand
                        disciplinaId={disc.id}
                        openModal={disciplinaSelecionada === disc.id}
                        onOpenModal={() => setDisciplinaSelecionada(disc.id)}
                        onCloseModal={() => setDisciplinaSelecionada(null)}
                        onAddMonitor={handleAddMonitor}
                        reloadMonitoresKey={reloadMonitoresKey}
                      />
                    )}
                  </DisciplinaCard>

                ))}
            </div>

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

            <Dialog open={!!editando} onOpenChange={v => { if (!v) setEditando(null); }}>
              <DialogContent className="max-w-2xl p-8 bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white border border-[#b2c9d6]">
                <DialogHeader>
                  <DialogTitle className="text-2xl mb-2 text-primary drop-shadow-sm">Editar Disciplina</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditarDisciplina} className="space-y-6 mt-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-nome" className="text-primary">Nome da monitoria</Label>
                    <Input
                      id="edit-nome"
                      value={editDisciplina.nome}
                      onChange={e => setEditDisciplina({ ...editDisciplina, nome: e.target.value })}
                      required
                      className="h-12 text-lg bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id="edit-permiteMesmoHorario"
                      checked={editDisciplina.permiteMesmoHorario}
                      onCheckedChange={checked => setEditDisciplina({ ...editDisciplina, permiteMesmoHorario: !!checked })}
                    />
                    <Label htmlFor="edit-permiteMesmoHorario" className="cursor-pointer text-base text-primary">Permitir monitores no mesmo horário</Label>
                  </div>
                  {/* Campo de tópicos */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="edit-topicos" className="text-primary">Tópicos</Label>
                    <div className="flex gap-2">
                      <Input
                        id="edit-topicos"
                        placeholder="Digite um tópico e pressione Enter"
                        value={editTopicoInput}
                        onChange={e => setEditTopicoInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && editTopicoInput.trim()) {
                            e.preventDefault();
                            if (!editDisciplina.topicos.includes(editTopicoInput.trim())) {
                              setEditDisciplina({ ...editDisciplina, topicos: [...editDisciplina.topicos, editTopicoInput.trim()] });
                            }
                            setEditTopicoInput("");
                          }
                        }}
                        className="h-12 text-lg flex-1 bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {editDisciplina.topicos.map((topico, idx) => (
                        <span key={idx} className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium shadow">
                          {topico}
                          <button
                            type="button"
                            className="ml-2 text-primary hover:text-red-500 focus:outline-none"
                            onClick={() => setEditDisciplina({ ...editDisciplina, topicos: editDisciplina.topicos.filter((_, i) => i !== idx) })}
                            aria-label={`Remover tópico ${topico}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full h-12 text-lg bg-primary text-white hover:bg-green-700">Salvar alterações</Button>
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
