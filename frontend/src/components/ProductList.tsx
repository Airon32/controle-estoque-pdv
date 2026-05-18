import { Pencil, Search, Trash2 } from "lucide-react";
import { Product } from "../types";

type ProductListProps = {
  products: Product[];
  deletingId: number | null;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
};

export function ProductList({
  products,
  deletingId,
  onEdit,
  onDelete,
  loading,
  search,
  onSearchChange
}: ProductListProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm shadow-black/20">
      <div className="flex flex-col gap-4 border-b border-zinc-800 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Produtos</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Visualize, pesquise e gerencie os itens cadastrados no estoque.
          </p>
        </div>
        <span className="rounded-full border border-zinc-800 bg-zinc-800 px-3 py-1 text-sm text-zinc-300">
          {products.length} itens
        </span>
      </div>

      <div className="border-b border-zinc-800 px-6 py-4">
        <label className="relative block max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por nome ou SKU"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-600 focus:bg-zinc-800 focus:ring-4 focus:ring-blue-950"
          />
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-zinc-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Produto
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Preco
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Quantidade
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-zinc-400"
                >
                  {loading
                    ? "Carregando produtos..."
                    : "Nenhum produto encontrado para os filtros atuais."}
                </td>
              </tr>
            ) : null}

            {products.map((product, index) => (
              <tr
                key={product.id}
                className={
                  index % 2 === 0
                    ? "bg-zinc-900"
                    : "bg-zinc-900/60"
                }
              >
                <td className="px-6 py-4 text-sm font-medium text-zinc-100">
                  {product.name}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">{product.sku}</td>
                <td className="px-6 py-4 text-sm text-zinc-200">
                  R$ {product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-200">
                  {product.quantity}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-100"
                      aria-label={`Editar ${product.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product.id)}
                      disabled={deletingId === product.id}
                      className="rounded-lg border border-zinc-700 p-2 text-zinc-400 transition hover:bg-red-950/40 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Excluir ${product.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
