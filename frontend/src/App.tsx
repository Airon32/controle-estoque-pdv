import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, FileUp, Plus } from "lucide-react";
import { Toaster, toast } from "sonner";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate
} from "react-router-dom";
import { api } from "./api";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Modal } from "./components/Modal";
import { ProductForm } from "./components/ProductForm";
import { ProductList } from "./components/ProductList";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { ImportPage } from "./pages/ImportPage";
import { LoginPage } from "./pages/LoginPage";
import { SignUpPage } from "./pages/SignUpPage";
import {
  ImportMapping,
  ImportPreviewRow,
  ImportResult,
  Product,
  ProductFormData
} from "./types";

const emptyForm: ProductFormData = {
  name: "",
  sku: "",
  price: "",
  quantity: ""
};

function LoginScreen() {
  const { session, signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, session]);

  const handleLogin = async (email: string, password: string) => {
    setSubmitting(true);

    try {
      await signIn(email, password);
      toast.success("Login realizado com sucesso.");
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return <LoginPage onSubmit={handleLogin} loading={submitting} />;
}

function SignUpScreen() {
  const { session, signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, session]);

  const handleSignUp = async (
    fullName: string,
    email: string,
    password: string
  ) => {
    setSubmitting(true);

    try {
      await signUp(fullName, email, password);
      toast.success("Conta criada com sucesso! Faça seu login.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return <SignUpPage onSubmit={handleSignUp} loading={submitting} />;
}

function AppShell() {
  const { accessToken, signOut, session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmImportOpen, setConfirmImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMapping, setImportMapping] = useState<ImportMapping>({});
  const [importPreviewColumns, setImportPreviewColumns] = useState<string[]>([]);
  const [importPreviewRows, setImportPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const initialLoadTokenRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage =
    location.pathname === "/dashboard"
      ? "dashboard"
      : location.pathname === "/import"
        ? "import"
        : location.pathname === "/checkout"
          ? "cashier"
          : location.pathname === "/settings"
            ? "settings"
            : "products";

  const loadProducts = async () => {
    if (!accessToken) {
      return;
    }

    try {
      setLoading(true);
      const data = await api<Product[]>("/products", {
        token: accessToken
      });
      setProducts(data);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      initialLoadTokenRef.current = null;
      return;
    }

    if (initialLoadTokenRef.current === accessToken) {
      return;
    }

    initialLoadTokenRef.current = accessToken;
    loadProducts();
  }, [accessToken]);

  const handleFormChange = (field: keyof ProductFormData, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProduct(null);
    setModalOpen(false);
  };

  const openCreateModal = () => {
    setForm(emptyForm);
    setEditingProduct(null);
    setModalOpen(true);
  };

  const resetImportState = () => {
    setImportFile(null);
    setImportMapping({});
    setImportPreviewColumns([]);
    setImportPreviewRows([]);
    setConfirmImportOpen(false);
  };

  const handleSubmitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);

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
          body: payload,
          token: accessToken
        });
        toast.success("Produto atualizado com sucesso.");
      } else {
        await api<Product>("/products", {
          method: "POST",
          body: payload,
          token: accessToken
        });
        toast.success("Produto cadastrado com sucesso.");
      }

      resetForm();
      await loadProducts();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
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
    setModalOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    setDeletingId(id);

    try {
      await api<void>(`/products/${id}`, {
        method: "DELETE",
        token: accessToken
      });
      toast.success("Produto excluído com sucesso.");
      await loadProducts();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  };

  const handleImportFileSelected = (
    file: File,
    columns: string[],
    rows: ImportPreviewRow[]
  ) => {
    setImportFile(file);
    setImportPreviewColumns(columns);
    setImportPreviewRows(rows);
    setImportMapping({});
  };

  const handleImportMappingChange = (
    field: keyof ImportMapping,
    value: string
  ) => {
    setImportMapping((current) => ({
      ...current,
      [field]: value || undefined
    }));
  };

  const handleConfirmImport = async () => {
    if (!importFile) {
      toast.error("Selecione um arquivo para importar.");
      return;
    }

    if (!importMapping.name || !importMapping.sku || !importMapping.price) {
      toast.error("Mapeie Nome, SKU e Preço antes de confirmar.");
      return;
    }

    setImporting(true);

    try {
      const formData = new FormData();
      formData.append("file", importFile);
      formData.append("mapping", JSON.stringify(importMapping));

      const result = await api<ImportResult>("/products/import", {
        method: "POST",
        body: formData,
        isFormData: true,
        token: accessToken
      });

      setConfirmImportOpen(false);
      await loadProducts();

      if (result.errors.length > 0) {
        toast.warning(
          `Importação concluída com ${result.insertedCount} produtos inseridos e ${result.skippedCount} linhas com erro.`
        );
      } else {
        toast.success(`${result.insertedCount} produtos importados com sucesso.`);
      }

      resetImportState();
      navigate("/products");
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setImporting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Sessão encerrada.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const filteredProducts = products.filter((product) => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return true;
    }

    return (
      product.name.toLowerCase().includes(normalizedSearch) ||
      product.sku.toLowerCase().includes(normalizedSearch)
    );
  });

  const totalUnits = products.reduce((sum, product) => sum + product.quantity, 0);
  const stockValue = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0
  );
  const userName =
    typeof session?.user.user_metadata?.full_name === "string" &&
    session.user.user_metadata.full_name.trim()
      ? session.user.user_metadata.full_name
      : session?.user.email?.split("@")[0] ?? "Usuário";

  return (
    <>
      <MainLayout
        activePage={currentPage}
        onNavigate={(page) => {
          if (page === "dashboard") navigate("/dashboard");
          if (page === "products") navigate("/products");
          if (page === "import") navigate("/import");
          if (page === "cashier") navigate("/checkout");
          if (page === "settings") navigate("/settings");
          if (page !== "import") {
            setConfirmImportOpen(false);
          }
        }}
        onLogout={handleLogout}
        userName={userName}
        userEmail={session?.user.email}
        title={
          currentPage === "dashboard"
            ? "Visão do Dono"
            : currentPage === "products"
              ? "Gestão de Estoque"
              : currentPage === "import"
                ? "Importador Universal"
                : currentPage === "cashier"
                  ? "Caixa / PDV"
                  : "Configurações"
        }
        subtitle={
          currentPage === "dashboard"
            ? `Indicadores estratégicos em tempo real para ${session?.user.email ?? "sua empresa"}.`
            : currentPage === "products"
              ? `Controle centralizado de cortes e produtos para ${session?.user.email ?? "sua conta"}.`
              : currentPage === "import"
                ? "Mapeie colunas de planilhas CSV ou Excel e realize importações em massa com segurança."
                : currentPage === "cashier"
                  ? "Módulo reservado para operação de frente de caixa com impressão térmica 80mm."
                  : "Preferências operacionais e parâmetros administrativos da Zuza Carnes."
        }
        action={
          currentPage === "products" ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/import")}
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
              >
                <FileUp className="h-4 w-4" />
                Importar arquivo
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 shadow-lg shadow-red-600/20"
              >
                <Plus className="h-4 w-4" />
                Novo produto
              </button>
            </div>
          ) : currentPage === "import" ? (
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao estoque
            </button>
          ) : null
        }
      >
        {currentPage === "dashboard" ? (
          <DashboardPage />
        ) : currentPage === "products" ? (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm shadow-black/20">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Produtos ativos
                </p>
                <strong className="mt-3 block text-3xl font-semibold text-white">
                  {products.length}
                </strong>
              </article>
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm shadow-black/20">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Unidades em estoque
                </p>
                <strong className="mt-3 block text-3xl font-semibold text-white">
                  {totalUnits}
                </strong>
              </article>
              <article className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm shadow-black/20">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Valor do inventário
                </p>
                <strong className="mt-3 block text-3xl font-semibold text-white">
                  R$ {stockValue.toFixed(2)}
                </strong>
              </article>
            </section>

            <ProductList
              products={filteredProducts}
              deletingId={deletingId}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              loading={loading}
              search={search}
              onSearchChange={setSearch}
            />
          </div>
        ) : currentPage === "import" ? (
          <ImportPage
            file={importFile}
            mapping={importMapping}
            previewColumns={importPreviewColumns}
            previewRows={importPreviewRows}
            importing={importing}
            onFileSelected={handleImportFileSelected}
            onMappingChange={handleImportMappingChange}
            onOpenConfirm={() => setConfirmImportOpen(true)}
            onClear={resetImportState}
          />
        ) : currentPage === "cashier" ? (
          <CheckoutPage />
        ) : (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-sm shadow-black/20">
            <h3 className="text-lg font-semibold text-white">
              Módulo em preparação
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Esta área foi preservada no layout para manter a navegação corporativa entre Estoque, Caixa e Configurações.
            </p>
          </section>
        )}
      </MainLayout>

      <Modal
        open={modalOpen}
        title={editingProduct ? "Editar produto" : "Novo produto"}
        description="Preencha os dados do item para manter o estoque sempre consistente."
        onClose={resetForm}
      >
        <ProductForm
          form={form}
          editingProduct={editingProduct}
          onChange={handleFormChange}
          onSubmit={handleSubmitProduct}
          onCancelEdit={resetForm}
          saving={saving}
        />
      </Modal>

      <Modal
        open={confirmImportOpen}
        title="Confirmar importação"
        description="Revise o mapeamento e confirme o processamento em massa dos produtos."
        onClose={() => setConfirmImportOpen(false)}
      >
        <div className="space-y-5">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p className="text-sm font-medium text-zinc-200">Arquivo selecionado</p>
            <p className="mt-1 text-sm text-zinc-400">
              {importFile?.name ?? "Nenhum arquivo"}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
            <p className="text-sm font-medium text-zinc-200">Mapeamento aplicado</p>
            <div className="mt-3 space-y-2 text-sm text-zinc-400">
              <p>Nome: {importMapping.name ?? "Não mapeado"}</p>
              <p>SKU: {importMapping.sku ?? "Não mapeado"}</p>
              <p>Preço: {importMapping.price ?? "Não mapeado"}</p>
              <p>Quantidade: {importMapping.quantity ?? "Não mapeado"}</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
            <button
              type="button"
              onClick={() => setConfirmImportOpen(false)}
              className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              Revisar
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={importing}
              className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? "Importando..." : "Confirmar importação"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function App() {
  return (
    <>
      <Toaster
        richColors
        position="top-right"
        toastOptions={{
          className: "border border-zinc-800 bg-zinc-900 text-zinc-100"
        }}
      />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignUpScreen />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<AppShell />} />
              <Route path="/products" element={<AppShell />} />
              <Route path="/import" element={<AppShell />} />
              <Route path="/checkout" element={<AppShell />} />
              <Route path="/settings" element={<AppShell />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocorreu um erro inesperado.";
}

export default App;
