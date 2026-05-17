import { FormEvent } from "react";
import { Product, ProductFormData } from "../types";

type ProductFormProps = {
  form: ProductFormData;
  editingProduct: Product | null;
  onChange: (field: keyof ProductFormData, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancelEdit: () => void;
  saving: boolean;
};

export function ProductForm({
  form,
  editingProduct,
  onChange,
  onSubmit,
  onCancelEdit,
  saving
}: ProductFormProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">
            {editingProduct ? "Editar produto" : "Novo produto"}
          </h2>
          <p className="mt-1 text-sm text-stone-300">
            Preencha os dados do item para manter o estoque atualizado.
          </p>
        </div>

        {editingProduct ? (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-stone-200 transition hover:bg-white/10"
          >
            Cancelar
          </button>
        ) : null}
      </div>

      <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm text-stone-200">Nome</span>
          <input
            value={form.name}
            onChange={(event) => onChange("name", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-stone-950/70 px-4 py-3 text-white outline-none transition focus:border-brand-400"
            placeholder="Ex: Cafe Torrado 500g"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-stone-200">SKU</span>
          <input
            value={form.sku}
            onChange={(event) => onChange("sku", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-stone-950/70 px-4 py-3 text-white outline-none transition focus:border-brand-400"
            placeholder="Ex: CAF-500"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-stone-200">Preco</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(event) => onChange("price", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-stone-950/70 px-4 py-3 text-white outline-none transition focus:border-brand-400"
            placeholder="0.00"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-stone-200">Quantidade</span>
          <input
            type="number"
            min="0"
            step="1"
            value={form.quantity}
            onChange={(event) => onChange("quantity", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-stone-950/70 px-4 py-3 text-white outline-none transition focus:border-brand-400"
            placeholder="0"
            required
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-2xl bg-brand-500 px-4 py-3 font-semibold text-stone-950 transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Salvando..."
              : editingProduct
                ? "Atualizar produto"
                : "Cadastrar produto"}
          </button>
        </div>
      </form>
    </section>
  );
}
