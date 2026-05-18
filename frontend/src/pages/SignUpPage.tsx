import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ShieldPlus } from "lucide-react";

type SignUpPageProps = {
  onSubmit: (fullName: string, email: string, password: string) => Promise<void>;
  loading: boolean;
};

export function SignUpPage({ onSubmit, loading }: SignUpPageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setNameError("Informe seu nome completo.");
      return;
    }

    if (password.length < 6) {
      setNameError(null);
      setPasswordError("A senha deve ter no minimo 6 caracteres.");
      return;
    }

    setNameError(null);
    setPasswordError(null);
    await onSubmit(fullName, email, password);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_30%),linear-gradient(180deg,_#09090b_0%,_#0f172a_100%)] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <ShieldPlus className="h-6 w-6" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Enterprise Onboarding
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">
            Criar nova conta
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Cadastre seu acesso para entrar no sistema e iniciar a operacao.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-200">
              Nome completo
            </span>
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-950"
              placeholder="Seu nome completo"
              required
            />
            {nameError ? (
              <p className="mt-2 text-sm text-red-400">{nameError}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-200">
              E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-950"
              placeholder="voce@empresa.com"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-200">
              Senha
            </span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 pr-12 text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-950"
                placeholder="Minimo de 6 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-200"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordError ? (
              <p className="mt-2 text-sm text-red-400">{passwordError}</p>
            ) : (
              <p className="mt-2 text-xs text-zinc-500">
                Use uma senha com no minimo 6 caracteres.
              </p>
            )}
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Ja tenho conta?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-400 transition hover:text-blue-300"
          >
            Ja tenho conta
          </Link>
        </p>
      </div>
    </main>
  );
}
