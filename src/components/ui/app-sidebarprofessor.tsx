import { BookOpen, ClipboardList, LogOut, PanelLeftIcon, BarChart3 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "./sidebar";
import { Link, useLocation } from "react-router-dom";
import { clearAuthTokens } from "../../services/authStorage";

// Ícones e rotas do professor
const items = [
  {
    title: "Requisições de Monitoria",
    url: "/professor/requisicoes-monitoria",
    icon: ClipboardList,
  },
  {
    title: "Disciplinas",
    url: "/professor/disciplinas",
    icon: BookOpen,
  },
  {
    title: "Estatísticas das Disciplinas",
    url: "/professor/estatisticas-disciplinas",
    icon: BarChart3,
  },
];

function handleLogout() {
  clearAuthTokens();
  window.location.href = "/login";
}


export function AppSidebarProfessor() {
  const location = useLocation();
  const { state } = useSidebar(); // "expanded" ou "collapsed"

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-primary/10 to-white shadow-lg min-h-screen">
        {/* Botão para minimizar/expandir */}
        <SidebarRail>
          <PanelLeftIcon className="w-7 h-7 text-primary" />
        </SidebarRail>
        <div className="flex flex-col items-center py-8">
          <span className={`font-bold text-primary text-lg tracking-wide transition-all duration-200 ${
            state === "collapsed" ? "inline md:hidden" : ""
          }`}>
            MONITORA+
          </span>
          <span className={`text-xs text-gray-400 mt-1 transition-all duration-200 ${
            state === "collapsed" ? "inline md:hidden" : ""
          }`}>
            Professor
          </span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const ativo = location.pathname === item.url;
                let destaqueClasses = "";
                if (ativo && state === "expanded") {
                  destaqueClasses = "bg-primary/10 text-primary border-l-4 border-black shadow";
                } else if (ativo && state === "collapsed") {
                  destaqueClasses = ativo
                    ? "bg-primary/10 text-primary border-l-4 border-primary shadow"
                    : "bg-gray-200";
                }
                return (
                  <SidebarMenuItem key={item.title} className="mb-6">
                    <SidebarMenuButton
                      asChild
                      className={`flex items-center gap-4 px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-200
                        hover:bg-primary/20 hover:shadow
                        ${destaqueClasses}
                      `}
                    >
                      <Link to={item.url}>
                        <item.icon className="w-8 h-8" />
                        <span
                          className={
                            state === "collapsed"
                              ? "inline md:hidden"
                              : ""
                          }
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            {/* Botão de logoff logo após os itens do menu */}
            <SidebarMenuItem className="mt-auto mb-6">
  <SidebarMenuButton
    asChild
    className="
      flex items-center gap-4 px-6 py-4
      rounded-xl text-lg font-semibold
      transition-all duration-200
      hover:bg-red-100 hover:text-red-700 hover:shadow
    "
  >
    <button
      type="button"
      onClick={handleLogout}
      className="flex items-center gap-4 w-full text-left"
      aria-label="Sair do sistema"
    >
      <LogOut className="w-8 h-8" />
      <span className={state === "collapsed" ? "inline md:hidden" : ""}>
        Sair
      </span>
    </button>
  </SidebarMenuButton>
</SidebarMenuItem>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

