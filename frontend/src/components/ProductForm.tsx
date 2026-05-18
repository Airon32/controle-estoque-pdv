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
    <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">Nome</span>
        <input
          value={form.name}
          onChange={(event) => onChange("name", event.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-950"
          placeholder="Ex: Cafe Torrado 500g"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">SKU</span>
        <input
          value={form.sku}
          onChange={(event) => onChange("sku", event.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-950"
          placeholder="Ex: CAF-500"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">Preco</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(event) => onChange("price", event.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-950"
          placeholder="0.00"
          required
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Quantidade
        </span>
        <input
          type="number"
          min="0"
          step="1"
          value={form.quantity}
          onChange={(event) => onChange("quantity", event.target.value)}
          className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-950"
          placeholder="0"
          required
        />
      </label>

      <div className="flex items-center justify-end gap-3 border-t border-zinc-800 pt-5 md:col-span-2">
        <button
          type="button"
          onClick={onCancelEdit}
          className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
        >
          Cancelar
        </button>
        <label className="block">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Salvando..."
              : editingProduct
                ? "Salvar alteracoes"
                : "Cadastrar produto"}
          </button>
        </label>
      </div>
    </form>
  );
}
