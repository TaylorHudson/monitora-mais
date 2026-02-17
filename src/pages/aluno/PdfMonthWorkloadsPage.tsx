import { AppSidebarAluno } from "../../components/app-sidebaraluno";
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar";
import { Button } from "../../components/ui/button";
import { Download } from "lucide-react";
import { fetchComToken } from "../../services/authFetch";
import { useLoading } from "../../contexts/LoadingContext";
import { toastApiError } from "../../utils/toast";

export default function PdfMonthWorkloadsPage() {
  const { setLoading } = useLoading();

  async function handleDownload() {
    try {
      const res = await fetchComToken(
        `${import.meta.env.VITE_API_URL}/pdf/month-workloads`, 
        {
          method: "POST",
        },
        setLoading
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "carga_horaria_mensal.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: Error | any) {
      toastApiError(e, "Erro ao gerar PDF");
    }
  }

  return (
    <div className="flex h-full w-full bg-[#F1F7FA]">
      <SidebarProvider>
        <AppSidebarAluno />
        <SidebarTrigger className="md:hidden fixed top-4 left-4 z-50" />
        <main className="flex-1 p-8 min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-3xl font-semibold mb-4 text-primary drop-shadow-sm">PDF com Carga Horária Mensal</h1>
          <p className="text-gray-700 mb-8">Baixe o relatório mensal de carga horária em PDF.</p>
          <Button onClick={handleDownload} className="gap-2 px-8 py-4 text-lg">
            <Download className="w-6 h-6" />
            Baixar PDF
          </Button>
        </main>
      </SidebarProvider>
    </div>
  );
}
