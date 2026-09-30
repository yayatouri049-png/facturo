import React, { useState, useRef, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FolderOpen,
  Copy,
  Trash2,
  FileText,
  Inbox,
  Search,
  Download,
  Upload,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatMoney, formatDate, computeTotals } from "@/lib/invoiceUtils";

export default function InvoiceHistory({
  open,
  onOpenChange,
  history,
  t,
  dir,
  lang,
  onReopen,
  onDuplicate,
  onDelete,
  onToggleStatus,
  onExport,
  onImport,
}) {
  const [query, setQuery] = useState("");
  const fileRef = useRef(null);

  const sorted = useMemo(
    () => [...(history || [])].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0)),
    [history]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((e) => {
      const num = (e.invoice.number || "").toLowerCase();
      const client = (e.invoice.client?.name || "").toLowerCase();
      return num.includes(q) || client.includes(q);
    });
  }, [sorted, query]);

  // unpaid totals grouped by currency
  const unpaidByCurrency = useMemo(() => {
    const map = {};
    (history || []).forEach((e) => {
      if (e.status !== "paid") {
        const { total } = computeTotals(e.invoice);
        map[e.currency] = (map[e.currency] || 0) + total;
      }
    });
    return map;
  }, [history]);

  const unpaidEntries = Object.entries(unpaidByCurrency).filter(([, v]) => v > 0);

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (f) onImport(f);
    e.target.value = "";
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        dir={dir}
        side={dir === "rtl" ? "left" : "right"}
        data-testid="history-sheet"
        className="w-full border-[#282e42] bg-[#0e1220] text-slate-200 sm:max-w-md overflow-y-auto ff-scroll"
      >
        <SheetHeader className="text-start">
          <SheetTitle className="flex items-center gap-2 text-white">
            <FolderOpen className="h-5 w-5 text-violet-400" />
            {t.historyTitle}
          </SheetTitle>
          <SheetDescription className="text-slate-400">{t.historySubtitle}</SheetDescription>
        </SheetHeader>

        {/* Backup actions */}
        <div className="mt-5 flex items-center gap-2">
          <Button
            data-testid="history-export-button"
            onClick={onExport}
            disabled={(history || []).length === 0}
            size="sm"
            variant="outline"
            className="h-8 flex-1 border-[#282e42] bg-transparent text-slate-200 hover:bg-[#1a2030] hover:text-white disabled:opacity-40"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> {t.exportBackup}
          </Button>
          <Button
            data-testid="history-import-button"
            onClick={() => fileRef.current && fileRef.current.click()}
            size="sm"
            variant="outline"
            className="h-8 flex-1 border-[#282e42] bg-transparent text-slate-200 hover:bg-[#1a2030] hover:text-white"
          >
            <Upload className="mr-1.5 h-3.5 w-3.5" /> {t.importBackup}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            data-testid="history-import-input"
            onChange={handleFile}
          />
        </div>

        {/* Unpaid total */}
        {unpaidEntries.length > 0 && (
          <div
            data-testid="unpaid-total"
            className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3"
          >
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
              <Clock className="h-3.5 w-3.5" /> {t.unpaidTotal}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              {unpaidEntries.map(([cur, val], i) => (
                <React.Fragment key={cur}>
                  {i > 0 && <span className="text-amber-500/40">•</span>}
                  <span className="text-base font-bold text-amber-200 tabular-nums">
                    <bdi dir="ltr" style={{ unicodeBidi: "isolate" }}>{formatMoney(val, cur, lang)}</bdi>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            data-testid="history-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="bg-[#0e1220] border-[#282e42] ps-9 text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500 focus-visible:border-violet-500"
          />
        </div>

        <div className="mt-4 space-y-3">
          {sorted.length === 0 ? (
            <div
              data-testid="history-empty"
              className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#282e42] bg-[#141826] py-12 text-center"
            >
              <Inbox className="h-8 w-8 text-slate-600" />
              <p className="text-sm text-slate-500">{t.historyEmpty}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div data-testid="history-no-results" className="py-8 text-center text-sm text-slate-500">
              {t.noResults}
            </div>
          ) : (
            filtered.map((entry) => {
              const { total } = computeTotals(entry.invoice);
              const paid = entry.status === "paid";
              return (
                <div
                  key={entry.id}
                  data-testid={`history-item-${entry.invoice.number}`}
                  className="rounded-xl border border-[#282e42] bg-[#141826] p-4 transition-colors hover:border-violet-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-violet-400" />
                        <span className="truncate text-sm font-semibold text-white">{entry.invoice.number}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-slate-400">{entry.invoice.client?.name || "—"}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {t.savedOn} {formatDate((entry.savedAtISO || "").slice(0, 10))}
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <div className="text-sm font-bold text-violet-300"><bdi dir="ltr" style={{ unicodeBidi: "isolate" }}>{formatMoney(total, entry.currency, lang)}</bdi></div>
                      <div className="text-[11px] text-slate-500">{formatDate(entry.invoice.date)}</div>
                    </div>
                  </div>

                  {/* Status toggle */}
                  <button
                    data-testid={`history-status-${entry.invoice.number}`}
                    onClick={() => onToggleStatus(entry.id)}
                    title={paid ? t.markPending : t.markPaid}
                    className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      paid
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/25"
                        : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500/25"
                    }`}
                  >
                    {paid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                    {paid ? t.statusPaid : t.statusPending}
                  </button>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      data-testid={`history-reopen-${entry.invoice.number}`}
                      onClick={() => onReopen(entry)}
                      size="sm"
                      className="h-8 flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500"
                    >
                      <FolderOpen className="mr-1.5 h-3.5 w-3.5" /> {t.reopen}
                    </Button>
                    <Button
                      data-testid={`history-duplicate-${entry.invoice.number}`}
                      onClick={() => onDuplicate(entry)}
                      size="sm"
                      variant="outline"
                      className="h-8 flex-1 border-[#282e42] bg-transparent text-slate-200 hover:bg-[#1a2030] hover:text-white"
                    >
                      <Copy className="mr-1.5 h-3.5 w-3.5" /> {t.duplicate}
                    </Button>
                    <Button
                      data-testid={`history-delete-${entry.invoice.number}`}
                      onClick={() => onDelete(entry.id)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 border-[#282e42] bg-transparent p-0 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
