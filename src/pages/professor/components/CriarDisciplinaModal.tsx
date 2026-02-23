import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { fetchComToken } from '../../../services/authFetch';
import { toastApiError, toastSuccess } from '../../../utils/toast';
import type { Disciplina } from '../../../services/types/types';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../../../components/ui/form';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

export const disciplinaSchema = z.object({
  nome: z
    .string()
    .min(1, 'O nome da disciplina é obrigatório')
    .min(3, 'O nome deve ter pelo menos 3 caracteres')
    .max(50, 'O nome deve ter no máximo 50 caracteres'),

  permiteMesmoHorario: z.boolean(),

  topicos: z
    .array(z.string().min(1))
    .min(3, 'A disciplina deve ter pelo menos 3 tópicos'),
});

export type DisciplinaFormData = z.infer<typeof disciplinaSchema>;

type CriarDisciplinaModalProps = {
  disciplina: Disciplina | null;
  modalAberto: boolean;
  setModalAberto: (aberto: boolean) => void;
  recarregar: () => void;
};

export default function CriarDisciplinaModal({
  disciplina,
  modalAberto,
  setModalAberto,
  recarregar,
}: CriarDisciplinaModalProps) {
  const [topicoInput, setTopicoInput] = useState('');

  const form = useForm<DisciplinaFormData>({
    resolver: zodResolver(disciplinaSchema),
    defaultValues: {
      nome: '',
      permiteMesmoHorario: false,
      topicos: [],
    },
  });

  useEffect(() => {
    if (!modalAberto) return;

    if (disciplina) {
      form.reset({
        nome: disciplina.nome,
        permiteMesmoHorario: disciplina.permiteMesmoHorario,
        topicos: disciplina.topicos ?? [],
      });
    } else {
      form.reset({
        nome: '',
        permiteMesmoHorario: false,
        topicos: [],
      });
    }
  }, [modalAberto, disciplina]);

  async function onSubmit(data: DisciplinaFormData) {
    try {
      if (disciplina) {
        await fetchComToken(
          `${import.meta.env.VITE_API_URL}/monitoring/teachers/${disciplina.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.nome,
              allowMonitorsSameTime: data.permiteMesmoHorario,
              topics: data.topicos,
            }),
          },
        );
      } else {
        await fetchComToken(
          `${import.meta.env.VITE_API_URL}/monitoring/teachers`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: data.nome,
              allowMonitorsSameTime: data.permiteMesmoHorario,
              topics: data.topicos,
            }),
          },
        );
      }

      recarregar();
      toastSuccess(
        `Disciplina ${disciplina ? 'editada' : 'criada'} com sucesso`,
      );
    } catch (err: Error | unknown) {
      toastApiError(err);
    } finally {
      setModalAberto(false);
    }
  }

  return (
    <Dialog
      open={modalAberto}
      onOpenChange={(open) => {
        setModalAberto(open);
        if (!open) {
          form.reset();
          setTopicoInput('');
        }
      }}
    >
      <DialogContent className="max-w-2xl p-8 bg-[#F1F7FA] border border-[#b2c9d6]">
        <DialogHeader>
          <DialogTitle className="text-2xl mb-2 text-primary drop-shadow-sm">
            {disciplina ? 'Editar Disciplina' : 'Criar Disciplina'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            {/* Nome */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-primary">Nome da monitoria</Label>
                  <FormControl>
                    <Input
                      {...field}
                      className="h-12 text-lg bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Checkbox */}
            <FormField
              control={form.control}
              name="permiteMesmoHorario"
              render={({ field }) => (
                <FormItem className="flex items-center gap-4">
                  <FormControl>
                    <Checkbox
                      className="cursor-pointer"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label
                    className="cursor-pointer text-base text-primary"
                    onClick={() => field.onChange(!field.value)}
                  >
                    Permitir monitores no mesmo horário
                  </Label>
                </FormItem>
              )}
            />

            {/* Tópicos */}
            <FormField
              control={form.control}
              name="topicos"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-primary">Tópicos</Label>

                  <FormControl>
                    <Input
                      placeholder="Digite um tópico e pressione Enter"
                      value={topicoInput}
                      onChange={(e) => setTopicoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const valor = topicoInput.trim();
                          if (!valor) return;
                          if (field.value.includes(valor)) return;
                          const novosTopicos = [...field.value, valor];
                          field.onChange(novosTopicos);
                          setTopicoInput('');
                        }
                      }}
                      className="h-12 text-lg bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />

                  {/* Lista de tópicos */}
                  <div className="flex flex-wrap gap-2 ">
                    {field.value.map((topico: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium shadow"
                      >
                        {topico}
                        <button
                          type="button"
                          className="ml-2 hover:text-red-500"
                          onClick={() => {
                            const novosTopicos = field.value.filter(
                              (_: any, i: number) => i !== idx,
                            );
                            field.onChange(novosTopicos);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                className="w-full h-12 text-lg bg-primary text-white hover:bg-green-700"
              >
                Confirmar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
