import {
  BookOpen,
  BookOpenCheck,
  Calendar,
  PanelLeftIcon,
  LogOut,
  Download,
} from 'lucide-react';
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
} from './ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { clearAuthTokens } from '../services/authStorage';

const items = [
  {
    title: 'Requisitar Horário',
    url: '/requisitar-horario',
    icon: Calendar,
  },
  {
    title: 'Monitorias',
    url: '/minhas-monitorias',
    icon: BookOpen,
  },
  {
    title: 'Iniciar Monitoria',
    url: '/iniciar-monitoria',
    icon: BookOpenCheck,
  },
  {
    title: 'Carga Horária',
    url: '/aluno/pdf-carga-horaria',
    icon: Download,
  },
];

export function AppSidebarAluno() {
  const location = useLocation();
  const { state } = useSidebar(); // "expanded" ou "collapsed"

  function handleLogout() {
    clearAuthTokens();
    window.location.href = '/login';
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-gradient-to-b from-primary/10 to-white shadow-lg min-h-screen">
        {/* Botão para minimizar/expandir */}
        <SidebarRail>
          <PanelLeftIcon className="w-7 h-7 text-primary" />
        </SidebarRail>
        <div className="flex flex-col items-center py-8">
          <span
            className={`font-bold text-primary text-lg tracking-wide transition-all duration-200 ${
              state === 'collapsed' ? 'inline md:hidden' : ''
            }`}
          >
            MONITORA+
          </span>
          <span
            className={`text-xs text-gray-400 mt-1 transition-all duration-200 ${
              state === 'collapsed' ? 'inline md:hidden' : ''
            }`}
          >
            Aluno
          </span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const ativo = location.pathname === item.url;
                let destaqueClasses = '';
                if (ativo && state === 'expanded') {
                  destaqueClasses =
                    'bg-primary/10 text-primary border-l-4 border-black shadow';
                } else if (ativo && state === 'collapsed') {
                  // Destaque especial para mobile (collapsed)
                  destaqueClasses = ativo
                    ? 'bg-primary/10 text-primary border-l-4 border-primary shadow'
                    : 'bg-gray-200';
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
                            state === 'collapsed' ? 'inline md:hidden' : ''
                          }
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <SidebarMenuItem className="">
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-4 px-6 py-4 rounded-xl text-lg font-semibold transition-all duration-200 hover:bg-red-100 hover:text-red-700 hover:shadow"
                >
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-4 w-full text-left"
                  >
                    <LogOut className="w-8 h-8" />
                    <span
                      className={
                        state === 'collapsed' ? 'inline md:hidden' : ''
                      }
                    >
                      Sair
                    </span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
