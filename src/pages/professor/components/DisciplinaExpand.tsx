import { Button } from "../../../components/ui/button";
import { MonitoresTable } from "../components/MonitoresTable";
import { AdicionarMonitorModal } from "../components/AdicionarMonitorModal";
import { Plus } from "lucide-react";

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
      <div className="flex justify-end">
        <Button
            onClick={onOpenModal}
            className="
            bg-primary 
            text-white 
            hover:bg-green-700
            shadow-md
            flex items-center gap-2
            h-10
            px-4
            rounded-md
            "
        >
            <Plus className="w-4 h-4" />
            Adicionar monitor
        </Button>
      </div>

      <AdicionarMonitorModal
        open={openModal}
        onClose={onCloseModal}
        onConfirm={(data) => onAddMonitor(disciplinaId, data)}
      />

      <MonitoresTable monitors={monitors} />
    </div>
  );
}
