import { Product } from "../types";

type ProductListProps = {
  products: Product[];
  deletingId: number | null;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  loading: boolean;
};

export function ProductList({
  products,
  deletingId,
  onEdit,
  onDelete,
  loading
}: ProductListProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">Produtos</h2>
          <p className="mt-1 text-sm text-stone-300">
            Visualize, edite e remova os itens do estoque.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-stone-300">
          {products.length} itens
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_180px] gap-4 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 md:grid">
          <span>Produto</span>
          <span>SKU</span>
          <span>Preco</span>
          <span>Quantidade</span>
          <span>Acoes</span>
        </div>

        {products.length === 0 ? (
          <div className="bg-stone-950/40 p-6 text-sm text-stone-400">
            {loading ? "Carregando produtos..." : "Nenhum produto cadastrado ainda."}
          </div>
        ) : null}

        {products.map((product) => (
          <article
            key={product.id}
            className="border-t border-white/10 bg-stone-950/45 p-4 first:border-t-0"
          >
            <div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_180px] md:items-center">
              <div>
                <h3 className="text-base font-semibold text-white">{product.name}</h3>
              </div>
              <div className="text-sm text-stone-300">{product.sku}</div>
              <div className="text-sm text-brand-200">R$ {product.price.toFixed(2)}</div>
              <div className="text-sm text-stone-300">{product.quantity}</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-200 transition hover:bg-white/10"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  disabled={deletingId === product.id}
                  className="rounded-full border border-red-400/30 px-4 py-2 text-sm text-red-200 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === product.id ? "Excluindo..." : "Excluir"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
