import { useState, useEffect } from 'react';
import { AppSidebarProfessor } from '../../components/ui/app-sidebarprofessor';
import { SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Pencil, Plus, Trash2, UserPlus2, Users2 } from 'lucide-react';
import { fetchComToken } from '../../services/authFetch';
import { toastApiError, toastSuccess } from '../../utils/toast';
import { useLoading } from '../../contexts/LoadingContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { formatarTempoRelativo } from '../../utils/utils';
import { AdicionarMonitorModal } from './components/AdicionarMonitorModal';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CriarDisciplinaModal from './components/CriarDisciplinaModal';
import type { Disciplina } from '../../services/types/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';

export default function DisciplinasPage() {
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [disciplina, setDisciplina] = useState<Disciplina | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [disciplinaId, setDisciplinaId] = useState<number | null>(null);
  const [recarregar, setRecarregar] = useState(0);

  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const [searchParams, setSearchParams] = useSearchParams();
  const filtro = searchParams.get('filtro') ?? '';

  function filtroMudou(value: string) {
    if (value) {
      setSearchParams({ filtro: value });
    } else {
      setSearchParams({});
    }
  }

  async function carregarDisciplinas() {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/teachers/me`,
        {},
        setLoading,
      );
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 100));

      const data = await res.json();
      setDisciplinas(
        data.map((d: any) => {
          const schedules = d.schedules || [];
          const ultimaRequisicao = schedules.length
            ? schedules.reduce((maisRecente: any, atual: any) =>
                new Date(atual.requestedAt) > new Date(maisRecente.requestedAt)
                  ? atual
                  : maisRecente,
              )
            : null;

          return {
            id: d.id,
            nome: d.name,
            permiteMesmoHorario: d.allowMonitorsSameTime,
            topicos: d.topics || [],
            ultimaRequisicao: ultimaRequisicao
              ? ultimaRequisicao.requestedAt
              : null,
          };
        }),
      );
    } catch {
      setDisciplinas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDisciplinas();
  }, [recarregar]);

  async function deletarDisciplina(disciplinaId: number) {
    try {
      await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/teachers/${disciplinaId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        },
        setLoading,
      );

      setRecarregar((prev) => prev + 1);
      toastSuccess('Disciplina deletada com sucesso');
    } catch (err: Error | unknown) {
      toastApiError(err);
    }
  }

  async function handleAddMonitor(matricula: string) {
    try {
      if (!matricula.trim()) return;

      const disciplina = disciplinas.find((d) => d.id === disciplinaId);
      if (!disciplina) {
        setLoading(false);
        return;
      }

      await fetchComToken(
        `${import.meta.env.VITE_API_URL}/monitoring/students/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentRegistration: matricula,
            monitoringName: disciplina.nome,
          }),
        },
        setLoading,
      );

      toastSuccess('Monitor adicionado', 'O monitor foi vinculado com sucesso');
    } catch (err: Error | any) {
      toastApiError(err);
    }
  }

  return (
    <>
      <AdicionarMonitorModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={(matricula) => handleAddMonitor(matricula)}
      />

      <div className="flex h-full w-full bg-[#F1F7FA]">
        <SidebarProvider>
          <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
          <AppSidebarProfessor />
          <main className="flex-1 p-4 md:p-8 min-h-screen">
            <div className="mb-8 text-left w-full">
              <h1 className="text-3xl font-semibold mb-1 text-primary drop-shadow-sm">
                Disciplinas
              </h1>
              <p className="text-gray-700 text-base text-left">
                Gerencie as suas disciplinas cadastradas
              </p>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mt-6 w-full">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar disciplina..."
                    value={filtro}
                    onChange={(e) => filtroMudou(e.target.value)}
                    className="w-full max-w-md bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="flex justify-end w-full md:w-auto">
                  <Button
                    onClick={() => {
                      setDisciplina(null);
                      setModalAberto(true);
                    }}
                    aria-label="Nova disciplina"
                    className="w-full text-white bg-primary hover:bg-green-700 flex items-center gap-2 px-4 h-10"
                  >
                    <Plus className="w-5 h-5" />
                    Criar disciplina
                  </Button>
                </div>
              </div>
            </div>

            <Table className="mt-6 bg-white/70 rounded-xl shadow-sm">
              <TableHeader className="bg-primary/10">
                <TableRow>
                  <TableHead className="text-primary font-semibold">
                    Nome
                  </TableHead>
                  <TableHead className="text-primary font-semibold">
                    Tópicos
                  </TableHead>
                  <TableHead className="text-primary font-semibold">
                    Permite monitorias no mesmo horário
                  </TableHead>
                  <TableHead className="text-primary font-semibold">
                    Última requisição
                  </TableHead>
                  <TableHead className="text-primary font-semibold text-center">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {disciplinas.length === 0 && (
                  <TableRow className="hover:bg-primary/5 transition">
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-700"
                    >
                      Nenhuma disciplina cadastrada
                    </TableCell>
                  </TableRow>
                )}

                {disciplinas.map((item, _) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-primary/3 transition"
                  >
                    <TableCell className="max-w-[280px] truncate text-gray-700">
                      <span title={item.nome}>{item.nome}</span>
                    </TableCell>
                    <TableCell className="max-w-[280px] truncate text-gray-700">
                      <span title={item.topicos.join(', ')}>
                        {item.topicos.length > 0
                          ? item.topicos.length > 3
                            ? item.topicos.slice(0, 3).join(', ') +
                              ` +${item.topicos.length - 3}`
                            : item.topicos.join(', ')
                          : 'Nenhum tópico cadastrado'}
                      </span>
                    </TableCell>

                    <TableCell className="max-w-[100px] truncate text-gray-700">
                      {item.permiteMesmoHorario ? 'Sim' : 'Não'}
                    </TableCell>

                    <TableCell className="text-gray-700">
                      {item.ultimaRequisicao
                        ? formatarTempoRelativo(item.ultimaRequisicao)
                        : 'Nenhuma requisição feita'}
                    </TableCell>

                    <TableCell className="text-center text-gray-700">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-primary/8 transition"
                          onClick={() => {
                            setOpenModal(true);
                            setDisciplinaId(item.id);
                          }}
                        >
                          <span title="Adicionar Monitor">
                            <UserPlus2 className="h-5 w-5" />
                          </span>
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-primary/8 transition"
                          onClick={() => {
                            navigate(
                              `/professor/monitores?filtro=${item.nome}`,
                            );
                          }}
                        >
                          <span title="Ver Monitores">
                            <Users2 className="h-5 w-5" />
                          </span>
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          className="hover:bg-primary/8 transition"
                          onClick={() => {
                            setDisciplina(item);
                            setModalAberto(true);
                          }}
                        >
                          <span title="Editar Disciplina">
                            <Pencil className="h-5 w-5" />
                          </span>
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="hover:text-red-700 hover:bg-red-100 transition"
                            >
                              <span title="Deletar Disciplina">
                                <Trash2 className="h-5 w-5" />
                              </span>
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Tem certeza que deseja deletar a disciplina?
                              </AlertDialogTitle>

                              <AlertDialogDescription className="text-gray-600">
                                Ao deletar a disciplina todos os dados
                                relacionados a ela serão perdidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel
                                variant="outline"
                                size="default"
                              >
                                Cancelar
                              </AlertDialogCancel>

                              <AlertDialogAction
                                variant="destructive"
                                size="default"
                                onClick={() => deletarDisciplina(item.id)}
                              >
                                Sim, deletar disciplina
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </main>
        </SidebarProvider>
      </div>

      <CriarDisciplinaModal
        recarregar={() => setRecarregar((prev) => prev + 1)}
        disciplina={disciplina}
        modalAberto={modalAberto}
        setModalAberto={(open) => {
          setModalAberto(open);
          if (!open) {
            setDisciplina(null);
          }
        }}
      />
    </>
  );
}
