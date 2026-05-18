import { useMemo, useState } from "react";
import { FileSpreadsheet, Upload, XCircle } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { ImportFieldOption, ImportMapping, ImportPreviewRow } from "../types";

type ImportPageProps = {
  file: File | null;
  mapping: ImportMapping;
  previewColumns: string[];
  previewRows: ImportPreviewRow[];
  importing: boolean;
  onFileSelected: (file: File, columns: string[], rows: ImportPreviewRow[]) => void;
  onMappingChange: (field: keyof ImportMapping, value: string) => void;
  onOpenConfirm: () => void;
  onClear: () => void;
};

const fieldOptions: ImportFieldOption[] = [
  { key: "name", label: "Nome", required: true },
  { key: "sku", label: "SKU", required: true },
  { key: "price", label: "Preco", required: true },
  { key: "quantity", label: "Quantidade" }
];

const acceptedExtensions = [".csv", ".xlsx", ".xls", ".xlsm"];

export function ImportPage({
  file,
  mapping,
  previewColumns,
  previewRows,
  importing,
  onFileSelected,
  onMappingChange,
  onOpenConfirm,
  onClear
}: ImportPageProps) {
  const [dragActive, setDragActive] = useState(false);

  const selectedMappings = useMemo(
    () => Object.values(mapping).filter(Boolean),
    [mapping]
  );

  const handleFile = async (selectedFile: File | undefined) => {
    if (!selectedFile) {
      return;
    }

    const extension = `.${selectedFile.name.split(".").pop()?.toLowerCase() ?? ""}`;

    if (!acceptedExtensions.includes(extension)) {
      throw new Error("Envie um arquivo CSV, XLSX, XLS ou XLSM.");
    }

    const arrayBuffer = await selectedFile.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      throw new Error("O arquivo nao possui planilhas validas.");
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false
    });

    if (rows.length === 0) {
      throw new Error("O arquivo nao possui dados para importar.");
    }

    const columns = Object.keys(rows[0]).map((column) => String(column).trim());
    const normalizedRows = rows.slice(0, 5).map((row) =>
      Object.fromEntries(
        columns.map((column) => [column, String(row[column] ?? "")])
      )
    );

    onFileSelected(selectedFile, columns, normalizedRows);
  };

  const hasRequiredMapping =
    Boolean(mapping.name) && Boolean(mapping.sku) && Boolean(mapping.price);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm shadow-black/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Importador universal
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              Importacao em massa via CSV ou Excel
            </h3>
            <p className="mt-2 max-w-3xl text-sm text-zinc-400">
              Envie planilhas de fornecedores ou catalogos internos, mapeie as
              colunas e confirme a insercao em massa com alta performance.
            </p>
          </div>

          {file ? (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
            >
              <XCircle className="h-4 w-4" />
              Limpar
            </button>
          ) : null}
        </div>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={async (event) => {
            event.preventDefault();
            setDragActive(false);
            try {
              await handleFile(event.dataTransfer.files?.[0]);
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Falha ao processar o arquivo enviado."
              );
            }
          }}
          className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-14 text-center transition ${
            dragActive
              ? "border-blue-500 bg-blue-950/30"
              : "border-zinc-700 bg-zinc-950/70 hover:border-zinc-500 hover:bg-zinc-900"
          }`}
        >
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.xlsm"
            className="hidden"
            onChange={async (event) => {
              try {
                await handleFile(event.target.files?.[0]);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Falha ao processar o arquivo enviado."
                );
              }
            }}
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-blue-400">
            <Upload className="h-6 w-6" />
          </div>
          <h4 className="mt-4 text-lg font-semibold text-white">
            Arraste o arquivo para esta area
          </h4>
          <p className="mt-2 text-sm text-zinc-400">
            Ou clique para selecionar um arquivo CSV ou Excel.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.22em] text-zinc-500">
            Suporta .csv, .xlsx, .xls e .xlsm
          </p>
        </label>
      </section>

      {file ? (
        <>
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-sm shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-800 text-zinc-200">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{file.name}</p>
                <p className="text-xs text-zinc-400">
                  {previewColumns.length} colunas identificadas
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {fieldOptions.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-200">
                    Campo do sistema: {field.label}
                    {field.required ? (
                      <span className="ml-2 text-xs uppercase tracking-[0.18em] text-blue-400">
                        Obrigatorio
                      </span>
                    ) : null}
                  </span>
                  <select
                    value={mapping[field.key] ?? ""}
                    onChange={(event) => onMappingChange(field.key, event.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-950"
                  >
                    <option value="">Nao mapear</option>
                    {previewColumns.map((column) => (
                      <option
                        key={column}
                        value={column}
                        disabled={
                          selectedMappings.includes(column) &&
                          mapping[field.key] !== column
                        }
                      >
                        {column}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onOpenConfirm}
                disabled={!hasRequiredMapping || importing}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar importacao
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm shadow-black/20">
            <div className="border-b border-zinc-800 px-6 py-5">
              <h4 className="text-lg font-semibold text-white">
                Pre-visualizacao das linhas
              </h4>
              <p className="mt-1 text-sm text-zinc-400">
                Exibindo as primeiras linhas detectadas para validar o mapeamento.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead className="bg-zinc-900">
                  <tr>
                    {previewColumns.map((column) => (
                      <th
                        key={column}
                        className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, index) => (
                    <tr
                      key={`${index}-${previewColumns.join("-")}`}
                      className={index % 2 === 0 ? "bg-zinc-900" : "bg-zinc-900/60"}
                    >
                      {previewColumns.map((column) => (
                        <td
                          key={`${index}-${column}`}
                          className="px-6 py-4 text-sm text-zinc-300"
                        >
                          {row[column]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
