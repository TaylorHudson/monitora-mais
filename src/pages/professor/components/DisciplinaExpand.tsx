import { Button } from "../../../components/ui/button";
import { MonitoresTable } from "../components/MonitoresTable";
import { AdicionarMonitorModal } from "../components/AdicionarMonitorModal";

type Props = {
  disciplinaId: number;
  openModal: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onAddMonitor: (discId: number, data: { nome: string; matricula: string }) => void;
  monitors: any[];
};

export function DisciplinaExpand({
  disciplinaId,
  openModal,
  onOpenModal,
  onCloseModal,
  onAddMonitor,
  monitors,
}: Props) {
  return (
    <div className="w-full mt-6 border-t pt-4 flex flex-col gap-4">
      <Button
        type="button"
        variant="outline"
        className="w-fit border-primary text-primary font-semibold hover:bg-primary/10"
        onClick={onOpenModal}
      >
        Adicionar Monitor
      </Button>

      <AdicionarMonitorModal
        open={openModal}
        onClose={onCloseModal}
        onConfirm={(data) => onAddMonitor(disciplinaId, data)}
      />

      <MonitoresTable monitors={monitors} />
    </div>
  );
}
