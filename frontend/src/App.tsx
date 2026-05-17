import { FormEvent, useEffect, useState } from "react";
import { api } from "./api";
import { ProductForm } from "./components/ProductForm";
import { ProductList } from "./components/ProductList";
import { Product, ProductFormData } from "./types";

const emptyForm: ProductFormData = {
  name: "",
  sku: "",
  price: "",
  quantity: ""
};

function App() {
  const [activePage, setActivePage] = useState<"dashboard" | "products">(
    "products"
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api<Product[]>("/products");
      setProducts(data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleFormChange = (field: keyof ProductFormData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProduct(null);
  };

  const handleSubmitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        price: Number(form.price),
        quantity: Number(form.quantity)
      };

      if (editingProduct) {
        await api<Product>(`/products/${editingProduct.id}`, {
          method: "PUT",
          body: payload
        });
        setMessage("Produto atualizado com sucesso.");
      } else {
        await api<Product>("/products", {
          method: "POST",
          body: payload
        });
        setMessage("Produto cadastrado com sucesso.");
      }

      resetForm();
      await loadProducts();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity: String(product.quantity)
    });
    setMessage(null);
    setError(null);
  };

  const handleDeleteProduct = async (id: number) => {
    setDeletingId(id);
    setError(null);
    setMessage(null);

    try {
      await api<void>(`/products/${id}`, {
        method: "DELETE"
      });
      setMessage("Produto excluido com sucesso.");
      await loadProducts();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(118,145,63,0.18),_transparent_40%),linear-gradient(180deg,_#0a0d09_0%,_#141a10_55%,_#202712_100%)] text-stone-100">
      <section className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-10 flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex rounded-full border border-brand-400/30 bg-brand-500/10 px-4 py-1 text-sm text-brand-200">
                Supabase + Prisma + React
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
                Sistema de Gestao de Estoque
              </h1>
              <p className="mt-3 max-w-2xl text-base text-stone-300">
                Modulo focado no cadastro, edicao e controle dos produtos em estoque.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-300">
              {loading ? "Carregando produtos..." : `${products.length} produtos carregados`}
            </div>
          </div>

          <nav className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActivePage("dashboard")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activePage === "dashboard"
                  ? "bg-white text-stone-950"
                  : "border border-white/10 bg-white/5 text-stone-200 hover:bg-white/10"
              }`}
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => setActivePage("products")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activePage === "products"
                  ? "bg-brand-500 text-stone-950"
                  : "border border-white/10 bg-white/5 text-stone-200 hover:bg-white/10"
              }`}
            >
              Produtos
            </button>
          </nav>
        </header>

        {message ? (
          <div className="mb-6 rounded-2xl border border-brand-400/30 bg-brand-500/10 px-4 py-3 text-sm text-brand-100">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {activePage === "dashboard" ? (
          <section className="grid gap-6 md:grid-cols-3">
            <article className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-stone-400">
                Total de produtos
              </p>
              <strong className="mt-4 block text-4xl text-white">{products.length}</strong>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-stone-400">
                Itens em estoque
              </p>
              <strong className="mt-4 block text-4xl text-white">
                {products.reduce((sum, product) => sum + product.quantity, 0)}
              </strong>
            </article>

            <article className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.2em] text-stone-400">
                Valor do estoque
              </p>
              <strong className="mt-4 block text-4xl text-white">
                R${" "}
                {products
                  .reduce((sum, product) => sum + product.price * product.quantity, 0)
                  .toFixed(2)}
              </strong>
            </article>
          </section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <ProductForm
              form={form}
              editingProduct={editingProduct}
              onChange={handleFormChange}
              onSubmit={handleSubmitProduct}
              onCancelEdit={resetForm}
              saving={saving}
            />

            <ProductList
              products={products}
              deletingId={deletingId}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              loading={loading}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
}

export default App;
