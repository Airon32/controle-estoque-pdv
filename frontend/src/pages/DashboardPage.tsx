import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Clock,
  DollarSign,
  Package,
  ShoppingBag,
  Tag,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { DashboardData } from "../types";

export function DashboardPage() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const result = await api<DashboardData>("/reports/dashboard", {
          token: accessToken
        });
        setData(result);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Erro ao carregar o dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [accessToken]);

  if (loading || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
          <p className="text-sm font-medium text-zinc-400">
            Carregando Visão do Dono...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Cards de Resumo */}
      <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {/* Faturamento Hoje */}
        <article className="relative overflow-hidden rounded-2xl border border-red-900/30 bg-gradient-to-b from-red-950/40 to-zinc-900/80 p-6 shadow-lg shadow-black/40 backdrop-blur-sm transition hover:border-red-700/50">
          <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
            Faturamento Hoje
          </p>
          <strong className="mt-4 block text-3xl font-extrabold tracking-tight text-white">
            R$ {data.todaySalesTotal.toFixed(2)}
          </strong>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-red-500" />
            <span>Atualizado em tempo real</span>
          </div>
        </article>

        {/* Faturamento do Mês */}
        <article className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-900/40 p-6 shadow-lg shadow-black/40 backdrop-blur-sm transition hover:border-zinc-700">
          <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-300 border border-zinc-700">
            <Calendar className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            Faturamento Mensal
          </p>
          <strong className="mt-4 block text-3xl font-extrabold tracking-tight text-white">
            R$ {data.monthSalesTotal.toFixed(2)}
          </strong>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
            <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
            <span>Acumulado do mês atual</span>
          </div>
        </article>

        {/* Número de Vendas */}
        <article className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-900/40 p-6 shadow-lg shadow-black/40 backdrop-blur-sm transition hover:border-zinc-700">
          <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-300 border border-zinc-700">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
            Vendas Concluídas
          </p>
          <strong className="mt-4 block text-3xl font-extrabold tracking-tight text-white">
            {data.totalSalesCount}
          </strong>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
            <Tag className="h-3.5 w-3.5 text-blue-500" />
            <span>Total de pedidos registrados</span>
          </div>
        </article>

        {/* Estoque Baixo */}
        <article className="relative overflow-hidden rounded-2xl border border-amber-900/30 bg-gradient-to-b from-amber-950/30 to-zinc-900/80 p-6 shadow-lg shadow-black/40 backdrop-blur-sm transition hover:border-amber-700/50">
          <div className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
            Alerta de Estoque
          </p>
          <strong className="mt-4 block text-3xl font-extrabold tracking-tight text-white">
            {data.lowStockCount}
          </strong>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
            <Package className="h-3.5 w-3.5 text-amber-500" />
            <span>Itens com 5 unidades ou menos</span>
          </div>
        </article>
      </section>

      {/* Grid de Conteúdo Principal */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Curva ABC - Mais Vendidos */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Produtos Mais Vendidos</h3>
              <p className="text-xs text-zinc-400">Curva ABC de saída de mercadorias</p>
            </div>
            <span className="flex h-8 items-center rounded-lg bg-red-500/10 px-3 text-xs font-bold text-red-400 border border-red-500/20">
              Top 5
            </span>
          </div>

          <div className="mt-6 space-y-5">
            {data.topProducts.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                Nenhuma venda registrada ainda.
              </p>
            ) : (
              data.topProducts.map((product, index) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-950/40 p-4 transition hover:bg-zinc-800/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-800 font-bold text-zinc-200 border border-zinc-700">
                      #{index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{product.name}</h4>
                      <p className="text-xs text-zinc-400">
                        {product.totalQuantity} unidades vendidas
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-emerald-400">
                      R$ {product.totalRevenue.toFixed(2)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                      Faturamento
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Últimas Vendas */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg shadow-black/30 backdrop-blur">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Últimas Vendas Realizadas</h3>
              <p className="text-xs text-zinc-400">Acompanhamento do fluxo de caixa</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/checkout")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              Ir para o Caixa
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {data.recentSales.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                Nenhuma venda recente.
              </p>
            ) : (
              data.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/50 bg-zinc-950/40 p-4 transition hover:bg-zinc-800/30"
                >
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-white">Pedido #{sale.id}</span>
                      <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-300 uppercase tracking-wider border border-zinc-700">
                        {sale.paymentMethod || "Dinheiro"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {sale.itemsCount} {sale.itemsCount === 1 ? "item" : "itens"} •{" "}
                      {new Date(sale.createdAt).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <strong className="text-lg font-bold text-white">
                    R$ {sale.total.toFixed(2)}
                  </strong>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Alerta de Estoque Crítico */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg shadow-black/30 backdrop-blur">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Estoque Crítico ou Esgotado</h3>
              <p className="text-xs text-zinc-400">
                Itens que necessitam de reposição urgente no açougue
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="text-xs font-semibold text-red-400 hover:text-red-300 transition"
          >
            Ver todo o estoque &rarr;
          </button>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="pb-3 font-semibold">Produto</th>
                <th className="pb-3 font-semibold">SKU</th>
                <th className="pb-3 font-semibold">Preço</th>
                <th className="pb-3 font-semibold text-right">Quantidade Atual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 font-medium">
              {data.lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-zinc-500">
                    Nenhum produto com estoque crítico no momento. Excelente gestão!
                  </td>
                </tr>
              ) : (
                data.lowStockProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="group transition hover:bg-zinc-800/20"
                  >
                    <td className="py-4 font-semibold text-white">{product.name}</td>
                    <td className="py-4 text-xs font-mono text-zinc-400">
                      {product.sku}
                    </td>
                    <td className="py-4 text-emerald-400 font-semibold">
                      R$ {product.price.toFixed(2)}
                    </td>
                    <td className="py-4 text-right font-bold">
                      <span
                        className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border ${
                          product.quantity === 0
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {product.quantity} {product.quantity === 1 ? "unidade" : "unidades"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
