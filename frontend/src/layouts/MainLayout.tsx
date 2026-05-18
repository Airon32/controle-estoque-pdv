import { ReactNode, useEffect, useRef, useState } from "react";
import {
  Boxes,
  ChevronRight,
  CreditCard,
  FileUp,
  Flame,
  LogOut,
  Settings,
  TrendingUp,
  UserCircle2
} from "lucide-react";

type NavItem = {
  key: "dashboard" | "products" | "import" | "cashier" | "settings";
  label: string;
  icon: ReactNode;
};

type MainLayoutProps = {
  activePage: "dashboard" | "products" | "import" | "cashier" | "settings";
  onNavigate: (page: "dashboard" | "products" | "import" | "cashier" | "settings") => void;
  title: string;
  subtitle: string;
  action?: ReactNode;
  children: ReactNode;
  onLogout: () => void;
  userName: string;
  userEmail?: string;
};

const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: "Visão do Dono",
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    key: "products",
    label: "Estoque",
    icon: <Boxes className="h-4 w-4" />
  },
  {
    key: "import",
    label: "Importações",
    icon: <FileUp className="h-4 w-4" />
  },
  {
    key: "cashier",
    label: "Caixa / PDV",
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    key: "settings",
    label: "Configurações",
    icon: <Settings className="h-4 w-4" />
  }
];

export function MainLayout({
  activePage,
  onNavigate,
  title,
  subtitle,
  action,
  children,
  onLogout,
  userName,
  userEmail
}: MainLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 print:bg-white print:text-black">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-zinc-800 bg-zinc-900 lg:flex lg:flex-col print:hidden">
          <div className="border-b border-zinc-800 px-6 py-6 bg-zinc-950/40">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-lg shadow-red-700/30 border border-red-500/20">
                <Flame className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-500">
                  Boutique Premium
                </p>
                <h1 className="text-xl font-black tracking-tight text-white">
                  Zuza Carnes
                </h1>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
              Módulos
            </div>
            <div className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = activePage === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onNavigate(item.key)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3.5 text-left text-sm font-semibold transition ${
                      isActive
                        ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-700/20 border border-red-500/30"
                        : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-zinc-800 bg-zinc-900/95 backdrop-blur">
            <div className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Painel Operacional
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-white">
                  {title}
                </h2>
                <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
              </div>

              <div className="flex items-center gap-4">
                {action}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((current) => !current)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 transition hover:bg-zinc-800"
                    aria-label="Abrir menu de perfil"
                  >
                    <UserCircle2 className="h-5 w-5 text-zinc-300" />
                  </button>

                  <div
                    className={`absolute right-0 top-[calc(100%+12px)] z-30 w-72 origin-top-right rounded-2xl border border-zinc-800 bg-zinc-900 p-3 shadow-2xl shadow-black/35 transition-all duration-200 ${
                      menuOpen
                        ? "pointer-events-auto translate-y-0 opacity-100"
                        : "pointer-events-none -translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-4">
                      <p className="text-sm text-zinc-400">Ola,</p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {userName}
                      </p>
                      {userEmail ? (
                        <p className="mt-1 text-xs text-zinc-500">{userEmail}</p>
                      ) : null}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onLogout();
                      }}
                      className="mt-3 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
                    >
                      <LogOut className="h-4 w-4 text-zinc-400" />
                      Sair da conta
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
