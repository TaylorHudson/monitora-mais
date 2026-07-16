import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '../../../components/ui/form';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export const adicionarMonitorSchema = z.object({
  matricula: z
    .string()
    .min(1, 'Matrícula é obrigatória')
    .min(12, 'Matrícula deve ter no mínimo 12 caracteres'),
});

export type AdicionarMonitorFormData = z.infer<typeof adicionarMonitorSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (matricula: string) => void;
}

export function AdicionarMonitorModal({ open, onClose, onConfirm }: Props) {
  const form = useForm<AdicionarMonitorFormData>({
    resolver: zodResolver(adicionarMonitorSchema),
    defaultValues: {
      matricula: '',
    },
  });

  function onSubmit(data: AdicionarMonitorFormData) {
    onConfirm(data.matricula);
    form.reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-8 bg-[#F1F7FA] border border-[#b2c9d6]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary drop-shadow-sm">
            Adicionar Monitor
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 mt-4"
          >
            <FormField
              control={form.control}
              name="matricula"
              render={({ field }) => (
                <FormItem>
                  <Label className="text-primary">Matrícula</Label>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Digite a matrícula do monitor"
                      className="h-12 text-lg bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                className="w-full h-12 text-lg bg-primary text-white hover:bg-green-700"
                disabled={form.formState.isSubmitting}
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
