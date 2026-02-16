import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { useState } from "react";

type AdicionarMonitorModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { matricula: string }) => void;
};

export function AdicionarMonitorModal({
  open,
  onClose,
  onConfirm,
}: AdicionarMonitorModalProps) {
  const [matricula, setMatricula] = useState("");

  function handleConfirm() {
    if (!matricula) return;

    onConfirm({ matricula });

    setMatricula("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-8 bg-gradient-to-br from-[#bddae2] via-[#e6f4ec] to-white border border-[#b2c9d6]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary drop-shadow-sm">
            Adicionar Monitor
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-4">
          <Input
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            className="h-12 text-lg bg-white/80 border border-[#b2c9d6] focus:border-primary focus:ring-primary"
          />
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            className="w-full h-12 text-lg bg-primary text-white hover:bg-green-700"
            onClick={handleConfirm}
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
