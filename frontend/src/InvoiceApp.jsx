import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from "react";
import html2pdf from "html2pdf.js";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, Printer, FilePlus2, RotateCcw, Languages, Save, History, Palette } from "lucide-react";
import InvoiceForm from "@/components/InvoiceForm";
import InvoicePreview from "@/components/InvoicePreview";
import RewardedAdDialog from "@/components/RewardedAdDialog";
import InvoiceHistory from "@/components/InvoiceHistory";
import { translations, LANGUAGES } from "@/lib/translations";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import {
  CURRENCIES,
  STORAGE_KEYS,
  loadLS,
  saveLS,
  clearAllLS,
  DEFAULT_PROFILE,
  makeDefaultInvoice,
  makeEmptyInvoice,
  nextInvoiceNumber,
  duplicateInvoice,
  todayISO,
  uid,
} from "@/lib/invoiceUtils";

const BRAND_LOGO =
  "https://customer-assets-lxgj4vgw.emergentagent.net/job_invoice-builder-358/artifacts/l207egin_IMG_4747.jpeg";
const A4_WIDTH_PX = 793.7; // 210mm @96dpi

export default function InvoiceApp() {
  const [lang, setLang] = useState(() => loadLS(STORAGE_KEYS.lang, "fr"));
  const [currency, setCurrency] = useState(() => loadLS(STORAGE_KEYS.currency, "DZD"));
  const [templateId, setTemplateId] = useState(() => loadLS(STORAGE_KEYS.template, "classic"));
  const [profile, setProfile] = useState(() => loadLS(STORAGE_KEYS.profile, DEFAULT_PROFILE));
  const [invoice, setInvoice] = useState(() => loadLS(STORAGE_KEYS.invoice, makeDefaultInvoice()));
  const [history, setHistory] = useState(() => loadLS(STORAGE_KEYS.history, []));
  const [historyOpen, setHistoryOpen] = useState(false);

  const t = translations[lang];
  const dir = t.dir;
  const theme = getTemplate(templateId);

  // ---- persistence ----
  useEffect(() => saveLS(STORAGE_KEYS.profile, profile), [profile]);
  useEffect(() => saveLS(STORAGE_KEYS.invoice, invoice), [invoice]);
  useEffect(() => saveLS(STORAGE_KEYS.lang, lang), [lang]);
  useEffect(() => saveLS(STORAGE_KEYS.currency, currency), [currency]);
  useEffect(() => saveLS(STORAGE_KEYS.template, templateId), [templateId]);
  useEffect(() => saveLS(STORAGE_KEYS.history, history), [history]);

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [dir, lang]);

  // ---- scaling preview ----
  const containerRef = useRef(null);
  const innerRef = useRef(null);
  const [scaleBox, setScaleBox] = useState({ scale: 1, w: A4_WIDTH_PX, h: 1122 });

  const recompute = useCallback(() => {
    if (!containerRef.current || !innerRef.current) return;
    const avail = containerRef.current.clientWidth - 48;
    const scale = Math.min(1, avail / A4_WIDTH_PX);
    const h = innerRef.current.offsetHeight;
    const next = { scale, w: A4_WIDTH_PX * scale, h: h * scale };
    setScaleBox((prev) => {
      if (
        Math.abs(prev.scale - next.scale) < 0.001 &&
        Math.abs(prev.h - next.h) < 0.5 &&
        Math.abs(prev.w - next.w) < 0.5
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    recompute();
  });

  useEffect(() => {
    const ro = new ResizeObserver(recompute);
    if (containerRef.current) ro.observe(containerRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [recompute]);

  // ---- handlers ----
  const updateProfile = (field, value) => setProfile((p) => ({ ...p, [field]: value }));
  const updateInvoice = (field, value) => setInvoice((i) => ({ ...i, [field]: value }));
  const updateClient = (field, value) =>
    setInvoice((i) => ({ ...i, client: { ...i.client, [field]: value } }));
  const updateItem = (id, field, value) =>
    setInvoice((i) => ({
      ...i,
      items: i.items.map((it) => (it.id === id ? { ...it, [field]: value } : it)),
    }));
  const addItem = () =>
    setInvoice((i) => ({ ...i, items: [...i.items, { id: uid(), description: "", qty: 1, price: 0 }] }));
  const removeItem = (id) =>
    setInvoice((i) => ({ ...i, items: i.items.filter((it) => it.id !== id) }));

  const onLogoUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => updateProfile("logo", e.target.result);
    reader.readAsDataURL(file);
  };
  const removeLogo = () => updateProfile("logo", "");

  // ---- history ----
  const upsertHistory = useCallback(
    (inv, cur) => {
      setHistory((prev) => {
        const entry = {
          id: uid(),
          savedAt: Date.now(),
          savedAtISO: new Date().toISOString(),
          currency: cur,
          status: "pending",
          invoice: JSON.parse(JSON.stringify(inv)),
        };
        const idx = prev.findIndex((e) => e.invoice.number === inv.number);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...entry, id: prev[idx].id, status: prev[idx].status || "pending" };
          return copy;
        }
        return [...prev, entry];
      });
    },
    []
  );

  const toggleStatus = (id) =>
    setHistory((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: e.status === "paid" ? "pending" : "paid" } : e))
    );

  const exportHistory = () => {
    const data = {
      app: "FacturaFlow",
      version: 1,
      exportedAt: new Date().toISOString(),
      profile,
      history,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facturaflow-sauvegarde-${todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast.success(t.exportSuccess);
  };

  const importHistory = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const imported = Array.isArray(data) ? data : data.history;
        if (!Array.isArray(imported)) throw new Error("invalid");
        setHistory((prev) => {
          const map = new Map(prev.map((x) => [x.invoice.number, x]));
          imported.forEach((x) => {
            if (x && x.invoice && x.invoice.number) {
              map.set(x.invoice.number, { ...x, id: uid(), status: x.status || "pending" });
            }
          });
          return Array.from(map.values());
        });
        if (data.profile) setProfile(data.profile);
        toast.success(t.importSuccess);
      } catch {
        toast.error(t.importError);
      }
    };
    reader.readAsText(file);
  };

  const handleSaveInvoice = () => {
    upsertHistory(invoice, currency);
    toast.success(t.saved);
  };

  const handleReopen = (entry) => {
    setInvoice(JSON.parse(JSON.stringify(entry.invoice)));
    setCurrency(entry.currency);
    setHistoryOpen(false);
    toast.success(t.reopened);
  };

  const handleDuplicate = (entry) => {
    let newNumber = nextInvoiceNumber(entry.invoice.number);
    const existing = new Set(history.map((e) => e.invoice.number));
    while (existing.has(newNumber)) newNumber = nextInvoiceNumber(newNumber);
    const dup = duplicateInvoice(entry.invoice, newNumber);
    setInvoice(dup);
    setCurrency(entry.currency);
    setHistoryOpen(false);
    toast.success(t.duplicated);
  };

  const handleDeleteHistory = (id) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
    toast.success(t.deletedInvoice);
  };

  const handleNewInvoice = () => {
    upsertHistory(invoice, currency);
    setInvoice(makeEmptyInvoice(nextInvoiceNumber(invoice.number)));
    toast.success(t.tNew);
  };

  const handleResetProfile = () => {
    clearAllLS();
    setProfile(DEFAULT_PROFILE);
    setInvoice(makeDefaultInvoice());
    setHistory([]);
    setCurrency("DZD");
    setLang("fr");
    toast.success(t.tReset);
  };

  const [exporting, setExporting] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [adAction, setAdAction] = useState('download');

  const generatePdf = async () => {
    if (!innerRef.current || exporting) return;
    setExporting(true);
    try {
      await html2pdf()
        .set({
          margin: 0,
          filename: `${invoice.number || "facture"}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff", windowWidth: A4_WIDTH_PX },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(innerRef.current)
        .save();
      upsertHistory(invoice, currency);
      toast.success(t.tPdf);
    } catch (e) {
      toast.error(t.tPdfErr);
    } finally {
      setExporting(false);
    }
  };

const handleDownloadPdf = () => {
  setAdAction('download');
  setAdOpen(true);
};

const handlePrint = () => {
  setAdAction('print');
  setAdOpen(true);
};

  return (
    <div dir={dir} className="min-h-screen bg-[#0b0d14] text-slate-200">
      {/* subtle background glow */}
      <div
        className="pointer-events-none fixed inset-0 app-no-print"
        style={{
          background:
            "radial-gradient(700px 400px at 12% -5%, rgba(124,58,237,0.16), transparent 60%), radial-gradient(700px 400px at 100% 0%, rgba(0,152,242,0.12), transparent 55%)",
        }}
      />

      {/* HEADER */}
      <header
        data-testid="app-header"
        className="app-no-print sticky top-0 z-30 border-b border-[#1e2333] bg-[#0b0d14]/85 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={BRAND_LOGO} alt="FacturaFlow" className="h-10 w-10 rounded-xl object-cover ring-1 ring-white/10" />
            <div>
              <div
                className="text-lg font-extrabold leading-none tracking-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#d4af37" }}
              >
                Facturo
              </div>
              <div className="text-[11px] text-slate-500">{t.appTagline}</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-[#282e42] bg-[#141826] px-2">
              <Languages className="h-4 w-4 text-slate-500" />
              <Select value={lang} onValueChange={setLang}>
                <SelectTrigger
                  data-testid="language-switcher-select"
                  className="h-8 w-[104px] border-0 bg-transparent text-slate-200 focus:ring-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.code} value={l.code}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-[#282e42] bg-[#141826] px-2">
              <Palette className="h-4 w-4 text-slate-500" />
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger
                  data-testid="template-switcher-select"
                  className="h-8 w-[132px] border-0 bg-transparent text-slate-200 focus:ring-0"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id} data-testid={`template-option-${tpl.id}`}>
                      <span className="flex items-center gap-2">
                        <span className="flex">
                          <span
                            className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10"
                            style={{ background: tpl.swatch[0] }}
                          />
                          <span
                            className="-ml-1 inline-block h-3 w-3 rounded-full ring-1 ring-black/10"
                            style={{ background: tpl.swatch[1] }}
                          />
                        </span>
                        {t[tpl.nameKey]}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              data-testid="history-button"
              onClick={() => setHistoryOpen(true)}
              variant="outline"
              className="relative h-9 border-[#282e42] bg-[#141826] text-slate-200 hover:text-white hover:bg-[#1a2030]"
            >
              <History className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t.history}</span>
              {history.length > 0 && (
                <span
                  data-testid="history-count-badge"
                  className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold text-white"
                >
                  {history.length}
                </span>
              )}
            </Button>

            <Button
              data-testid="save-invoice-button"
              onClick={handleSaveInvoice}
              variant="outline"
              className="glow-gold h-9 border-[#33301c] bg-[#161510] text-amber-200 hover:bg-amber-500/10"
            >
              <Save className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t.save}</span>
            </Button>

            <Button
              data-testid="new-invoice-button"
              onClick={handleNewInvoice}
              variant="outline"
              className="glow-blue h-9 border-[#282e42] bg-[#141826] text-slate-200 hover:text-white hover:bg-[#1a2030]"
            >
              <FilePlus2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t.newInvoice}</span>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  data-testid="reset-profile-button"
                  variant="outline"
                  className="h-9 border-[#3a2130] bg-[#1a1220] text-red-300 hover:bg-red-500/10 hover:text-red-200"
                >
                  <RotateCcw className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{t.resetProfile}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-[#282e42] bg-[#141826] text-slate-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">{t.resetProfile}</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">{t.confirmReset}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#282e42] bg-transparent text-slate-200 hover:bg-[#1a2030] hover:text-white">
                    ✕
                  </AlertDialogCancel>
                  <AlertDialogAction
                    data-testid="confirm-reset-button"
                    onClick={handleResetProfile}
                    className="bg-red-600 text-white hover:bg-red-500"
                  >
                    {t.resetProfile}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              data-testid="print-invoice-button"
              onClick={handlePrint}
              variant="outline"
              className="glow-gold h-9 border-[#33301c] bg-[#161510] text-amber-200 hover:bg-amber-500/10"
            >
              <Printer className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t.print}</span>
            </Button>

            <Button
              data-testid="download-pdf-button"
              onClick={handleDownloadPdf}
              disabled={exporting}
              className="glow-violet h-9 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500"
            >
              <Download className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{t.downloadPdf}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="relative mx-auto flex max-w-[1600px] flex-col lg:flex-row">
        {/* LEFT: form */}
        <div className="app-no-print w-full lg:w-1/2 lg:h-[calc(100vh-65px)] lg:overflow-y-auto ff-scroll px-4 py-6 sm:px-6">
          <InvoiceForm
            profile={profile}
            invoice={invoice}
            currency={currency}
            t={t}
            lang={lang}
            currencies={CURRENCIES}
            onCurrencyChange={setCurrency}
            updateProfile={updateProfile}
            updateInvoice={updateInvoice}
            updateClient={updateClient}
            updateItem={updateItem}
            addItem={addItem}
            removeItem={removeItem}
            onLogoUpload={onLogoUpload}
            removeLogo={removeLogo}
          />
        </div>

        {/* RIGHT: preview */}
        <div
          ref={containerRef}
          className="preview-panel w-full lg:w-1/2 lg:h-[calc(100vh-65px)] lg:overflow-y-auto ff-scroll px-4 py-6 sm:px-6"
          style={{ background: "linear-gradient(180deg,#0d1018,#090b12)" }}
        >
          <div
            className="a4-scale-wrapper mx-auto"
            style={{ width: `${scaleBox.w}px`, height: `${scaleBox.h}px` }}
          >
            <div
              className="a4-scale-inner"
              style={{ transform: `scale(${scaleBox.scale})`, transformOrigin: "top left", width: `${A4_WIDTH_PX}px` }}
            >
              <div ref={innerRef}>
                <InvoicePreview profile={profile} invoice={invoice} currency={currency} t={t} dir={dir} lang={lang} theme={theme} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <RewardedAdDialog
        open={adOpen}
        onOpenChange={setAdOpen}
       onReward={() => {
            if (adAction === 'print') {
              window.print();
            } else {
              generatePdf();
            }
          }}

        t={t}
        dir={dir}
      />

      <InvoiceHistory
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
        t={t}
        dir={dir}
        lang={lang}
        onReopen={handleReopen}
        onDuplicate={handleDuplicate}
        onDelete={handleDeleteHistory}
        onToggleStatus={toggleStatus}
        onExport={exportHistory}
        onImport={importHistory}
      />
    </div>
  );
}
