import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Coins,
  CreditCard,
  Minus,
  Plus,
  Printer,
  QrCode,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { Modal } from "../components/Modal";
import { CartItem, Product, SaleResponse } from "../types";

const paymentMethods = [
  { id: "Dinheiro", label: "Dinheiro", icon: Coins },
  { id: "PIX", label: "PIX", icon: QrCode },
  { id: "Cartão de Crédito", label: "Cartão de Crédito", icon: CreditCard },
  { id: "Cartão de Débito", label: "Cartão de Débito", icon: CreditCard }
];

export function CheckoutPage() {
  const { accessToken } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedPayment, setSelectedPayment] = useState("Dinheiro");
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<SaleResponse | null>(null);

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
    } catch (error) {
      toast.error("Erro ao carregar os produtos disponíveis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [accessToken]);

  const filteredProducts = products.filter((product) => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return true;
    return (
      product.name.toLowerCase().includes(normalized) ||
      product.sku.toLowerCase().includes(normalized)
    );
  });

  const handleAddToCart = (product: Product) => {
    if (product.quantity <= 0) {
      toast.warning(`O produto ${product.name} está esgotado no estoque!`);
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.productId === product.id);

      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.warning(`Quantidade máxima disponível para ${product.name} atingida.`);
          return currentCart;
        }

        return currentCart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          stock: product.quantity,
          quantity: 1
        }
      ];
    });
  };

  const handleUpdateQuantity = (productId: number, delta: number) => {
    setCart((currentCart) => {
      return currentCart
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) {
              toast.warning(`Apenas ${item.stock} unidades disponíveis no estoque.`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((currentCart) => currentCart.filter((item) => item.productId !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    toast.info("Carrinho limpo.");
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleFinalizeSale = async () => {
    if (cart.length === 0) {
      toast.error("O carrinho está vazio.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        paymentMethod: selectedPayment,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };

      const sale = await api<SaleResponse>("/checkout", {
        method: "POST",
        body: payload,
        token: accessToken
      });

      setCompletedSale(sale);
      setCart([]);
      toast.success("Venda finalizada com sucesso!");
      await loadProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao finalizar a venda.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <>
      {/* Interface do PDV (Oculta na impressão) */}
      <div className="grid gap-8 lg:grid-cols-12 print:hidden animate-in fade-in-50 duration-500">
        {/* Painel Esquerdo: Busca e Seleção de Produtos */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg shadow-black/30 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Catálogo de Produtos</h3>
                <p className="text-xs text-zinc-400">
                  Selecione os cortes e produtos para adicionar ao pedido
                </p>
              </div>

              {/* Barra de Busca */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou SKU..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm font-medium text-white placeholder-zinc-500 outline-none transition focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Lista de Produtos em Grid */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {loading ? (
                <div className="col-span-2 py-12 text-center text-sm text-zinc-500">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mb-2" />
                  <p>Carregando catálogo...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-sm text-zinc-500">
                  Nenhum produto encontrado na busca.
                </div>
              ) : (
                filteredProducts.map((product) => {
                  const isEsgotado = product.quantity <= 0;

                  return (
                    <article
                      key={product.id}
                      onClick={() => !isEsgotado && handleAddToCart(product)}
                      className={`group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/50 p-5 shadow-sm transition ${
                        isEsgotado
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer hover:border-red-700/50 hover:bg-zinc-800/30"
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-white group-hover:text-red-400 transition">
                            {product.name}
                          </h4>
                          <span className="rounded-lg bg-zinc-900 px-2 py-1 text-xs font-mono font-semibold text-zinc-400 border border-zinc-800 shrink-0">
                            {product.sku}
                          </span>
                        </div>
                        <p className="mt-3 text-2xl font-extrabold text-emerald-400">
                          R$ {Number(product.price).toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-4">
                        <span
                          className={`text-xs font-semibold ${
                            isEsgotado ? "text-red-500" : "text-zinc-400"
                          }`}
                        >
                          {isEsgotado
                            ? "Esgotado"
                            : `${product.quantity} disponíveis`}
                        </span>
                        <button
                          type="button"
                          disabled={isEsgotado}
                          className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white transition hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Painel Direito: Carrinho e Finalização */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-lg shadow-black/30 backdrop-blur flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-bold text-white">Carrinho de Compras</h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-red-400 transition"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Limpar
                </button>
              )}
            </div>

            {/* Lista de Itens no Carrinho */}
            <div className="flex-1 my-6 space-y-4 overflow-y-auto max-h-[380px] pr-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center text-zinc-500">
                  <ShoppingBag className="h-12 w-12 stroke-1 mb-3 text-zinc-600" />
                  <p className="text-sm font-medium">Seu carrinho está vazio.</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Adicione cortes do catálogo ao lado para iniciar a venda.
                  </p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <h4 className="font-semibold text-white truncate">{item.name}</h4>
                      <p className="text-xs font-medium text-emerald-400 mt-0.5">
                        R$ {item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Controle de Quantidade */}
                      <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-900 p-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.productId, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.productId, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Botão Remover */}
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(item.productId)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Seleção de Pagamento e Subtotal */}
            {cart.length > 0 && (
              <div className="border-t border-zinc-800/80 pt-6 space-y-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                    Forma de Pagamento
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedPayment === method.id;

                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedPayment(method.id)}
                          className={`flex items-center gap-2.5 rounded-xl border p-3.5 text-left text-sm font-semibold transition ${
                            isSelected
                              ? "border-red-600 bg-red-600/10 text-white shadow-sm"
                              : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                          }`}
                        >
                          <Icon
                            className={`h-4 w-4 ${
                              isSelected ? "text-red-500" : "text-zinc-500"
                            }`}
                          />
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Total e Botão de Finalizar */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-400">Total a Pagar</span>
                  <strong className="text-2xl font-extrabold text-emerald-400">
                    R$ {cartTotal.toFixed(2)}
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={handleFinalizeSale}
                  disabled={submitting}
                  className="w-full rounded-xl bg-red-600 py-4 text-base font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Processando Venda...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Finalizar Venda</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal de Sucesso da Venda */}
      <Modal
        open={completedSale !== null}
        title="Venda Concluída com Sucesso!"
        description="A transação foi registrada no sistema e o estoque atualizado."
        onClose={() => setCompletedSale(null)}
      >
        {completedSale && (
          <div className="space-y-6 print:hidden">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm font-medium text-zinc-400">Total do Pedido</p>
              <strong className="mt-1 block text-4xl font-black text-white">
                R$ {completedSale.total.toFixed(2)}
              </strong>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-300 border border-zinc-800">
                <span>Forma de pagamento:</span>
                <span className="text-emerald-400 font-bold">
                  {completedSale.paymentMethod || "Dinheiro"}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {/* Botão de Imprimir Recibo 80mm */}
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                <Printer className="h-5 w-5" />
                <span>Imprimir Cupom / Recibo (80mm)</span>
              </button>

              <button
                type="button"
                onClick={() => setCompletedSale(null)}
                className="rounded-xl border border-zinc-700 py-3.5 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
              >
                Nova Venda
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Estrutura de Impressão do Cupom Térmico (80mm) */}
      {completedSale && (
        <div className="hidden print:block text-black font-mono text-[12px] leading-tight w-[80mm] p-2 mx-auto bg-white">
          {/* Cabeçalho */}
          <div className="text-center mb-3">
            <h2 className="font-bold text-[16px] mb-0.5">ZUZA CARNES</h2>
            <p className="text-[11px] font-semibold">AÇOUGUE & BOUTIQUE PREMIUM</p>
            <p className="text-[10px]">CNPJ: 45.678.901/0001-23</p>
            <p className="text-[10px]">RUA DAS CARNES PREMIUM, 100</p>
          </div>

          <div className="border-b border-black border-dashed my-2" />

          {/* Dados do Cupom */}
          <div className="text-[11px] mb-2 space-y-0.5">
            <p><span className="font-bold">CUPOM NÃO FISCAL</span></p>
            <p>PEDIDO: #{completedSale.id}</p>
            <p>DATA: {new Date(completedSale.createdAt).toLocaleString("pt-BR")}</p>
          </div>

          <div className="border-b border-black border-dashed my-2" />

          {/* Tabela de Itens */}
          <div className="mb-2">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="border-b border-black">
                  <th className="pb-1 font-bold">QTD</th>
                  <th className="pb-1 font-bold">DESCRIÇÃO</th>
                  <th className="pb-1 font-bold text-right">SUBTOT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {completedSale.items.map((item) => (
                  <tr key={item.id} className="py-1">
                    <td className="py-1 font-bold">{item.quantity}x</td>
                    <td className="py-1 pr-1 truncate max-w-[120px]">
                      {item.productName}
                    </td>
                    <td className="py-1 text-right font-bold">
                      R$ {item.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-b border-black border-dashed my-2" />

          {/* Totais e Pagamento */}
          <div className="space-y-1 text-[12px] mb-4">
            <div className="flex justify-between font-bold text-[14px]">
              <span>TOTAL A PAGAR:</span>
              <span>R$ {completedSale.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>FORMA DE PAGAMENTO:</span>
              <span className="font-bold">{completedSale.paymentMethod || "Dinheiro"}</span>
            </div>
          </div>

          <div className="border-b border-black border-dashed my-2" />

          {/* Rodapé */}
          <div className="text-center text-[10px] mt-3 space-y-0.5 font-bold">
            <p>OBRIGADO PELA PREFERÊNCIA!</p>
            <p>ZUZA CARNES - QUALIDADE GARANTIDA</p>
            <p className="text-[9px] font-normal mt-2">Desenvolvido com Tecnologia PDV</p>
          </div>
        </div>
      )}
    </>
  );
}
