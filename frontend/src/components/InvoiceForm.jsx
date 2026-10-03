import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  User,
  FileText,
  ListPlus,
  Percent,
  Landmark,
  Upload,
  Trash2,
  Plus,
  ImageOff,
} from "lucide-react";
import { formatMoney, lineTotal, computeTotals, plusDaysISO } from "@/lib/invoiceUtils";

const DOC_TYPES = ["Facture", "Devis", "Bon de commande", "Avoir"];

const STATUS_OPTIONS = [
  { id: "none", labelKey: "stampNone", labelDefault: "Aucun", activeCls: "bg-slate-700 text-white ring-1 ring-slate-400 shadow-md" },
  { id: "PAID", labelKey: "stampPaid", labelDefault: "PAYÉE", activeCls: "bg-emerald-600 text-white ring-1 ring-emerald-400 shadow-lg shadow-emerald-600/30" },
  { id: "PENDING", labelKey: "stampPending", labelDefault: "En attente", activeCls: "bg-amber-600 text-white ring-1 ring-amber-400 shadow-lg shadow-amber-600/30" },
  { id: "CANCELLED", labelKey: "stampCancelled", labelDefault: "Annulée", activeCls: "bg-rose-600 text-white ring-1 ring-rose-400 shadow-lg shadow-rose-600/30" },
];

const Section = ({ icon: Icon, title, hint, children, accent = "#7c3aed" }) => (
  <div className="rounded-2xl border border-[#282e42] bg-[#141826]/80 backdrop-blur-sm overflow-hidden fade-in">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-[#282e42] bg-[#171b2b]">
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: `${accent}22`, color: accent }}
      >
        <Icon className="h-4.5 w-4.5" size={18} />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-slate-100 leading-tight">{title}</h3>
        {hint ? <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p> : null}
      </div>
    </div>
    <div className="p-5 space-y-4">{children}</div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <Label className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</Label>
    {children}
  </div>
);

const inputCls =
  "bg-[#0e1220] border-[#282e42] text-slate-100 placeholder:text-slate-600 focus-visible:ring-violet-500 focus-visible:border-violet-500";

export default function InvoiceForm({
  profile,
  invoice,
  currency,
  t,
  lang,
  currencies,
  onCurrencyChange,
  updateProfile,
  updateInvoice,
  updateClient,
  updateItem,
  addItem,
  removeItem,
  onLogoUpload,
  removeLogo,
  blNumber,
  poNumber,
  onBlNumberChange,
  onPoNumberChange,
  docType,
  onDocTypeChange,
  paymentStatus,
  onPaymentStatusChange,
}) {
  return (
    <div className="space-y-5">
      {/* TYPE DE DOCUMENT & STATUT DE PAIEMENT */}
      <div className="rounded-2xl border border-[#282e42] bg-[#141826]/80 backdrop-blur-sm p-4 space-y-4 fade-in">
        {/* Sélecteur de type de document */}
        <div>
          <Label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-2">
            {t.docTypeLabel || "Type de document"}
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DOC_TYPES.map((type) => {
              const active = docType === type;
              const typeKey = `docType_${type.replace(/\s+/g, "")}`;
              const label = t[typeKey] || type;
              const testId = `doc-type-btn-${type.toLowerCase().replace(/\s+/g, "-")}`;
              return (
                <button
                  key={type}
                  type="button"
                  data-testid={testId}
                  onClick={() => onDocTypeChange(type)}
                  className={`flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30 ring-1 ring-violet-400"
                      : "border border-[#282e42] bg-[#0e1220] text-slate-300 hover:bg-[#1a2030] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tampon de statut de paiement */}
        <div className="pt-3 border-t border-[#282e42]/60">
          <Label className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-2">
            {t.paymentStatusLabel || "Tampon de statut"}
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STATUS_OPTIONS.map((opt) => {
              const active = paymentStatus === opt.id;
              const label = t[opt.labelKey] || opt.labelDefault;
              const testId = `status-stamp-btn-${opt.id.toLowerCase()}`;
              return (
                <button
                  key={opt.id}
                  type="button"
                  data-testid={testId}
                  onClick={() => onPaymentStatusChange(opt.id)}
                  translate="no"
                  className={`notranslate flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? opt.activeCls
                      : "border border-[#282e42] bg-[#0e1220] text-slate-400 hover:bg-[#1a2030] hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* EMETTEUR */}
      <Section icon={Building2} title={t.emitter} hint={t.emitterHint} accent="#7c3aed">
        <Field label={t.logo}>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-28 items-center justify-center rounded-xl border border-dashed border-[#3a4260] bg-[#0e1220] overflow-hidden">
              {profile.logo ? (
                <img src={profile.logo} alt="logo" className="max-h-14 max-w-24 object-contain" />
              ) : (
                <ImageOff className="h-5 w-5 text-slate-600" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  data-testid="emitter-logo-upload-input"
                  onChange={(e) => e.target.files[0] && onLogoUpload(e.target.files[0])}
                />
                <span className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#282e42] bg-[#171b2b] px-3 py-2 text-xs font-medium text-slate-200 hover:border-violet-500 transition-colors">
                  <Upload className="h-3.5 w-3.5" /> {t.uploadLogo}
                </span>
              </label>
              {profile.logo ? (
                <button
                  data-testid="remove-logo-button"
                  onClick={removeLogo}
                  className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" /> {t.removeLogo}
                </button>
              ) : null}
            </div>
          </div>
        </Field>

        <Field label={t.companyName}>
          <Input
            data-testid="emitter-name-input"
            className={inputCls}
            value={profile.name}
            onChange={(e) => updateProfile("name", e.target.value)}
          />
        </Field>
        <Field label={t.address}>
          <Textarea
            data-testid="emitter-address-input"
            className={inputCls}
            rows={2}
            value={profile.address}
            onChange={(e) => updateProfile("address", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.phone}>
            <Input className={inputCls} value={profile.phone} onChange={(e) => updateProfile("phone", e.target.value)} />
          </Field>
          <Field label={t.email}>
            <Input className={inputCls} value={profile.email} onChange={(e) => updateProfile("email", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.taxId}>
            <Input data-testid="emitter-nif-input" className={inputCls} value={profile.taxId || ""} onChange={(e) => updateProfile("taxId", e.target.value)} />
          </Field>
          <Field label={t.nis}>
            <Input data-testid="emitter-nis-input" className={inputCls} value={profile.nis || ""} onChange={(e) => updateProfile("nis", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.rc}>
            <Input data-testid="emitter-rc-input" className={inputCls} value={profile.rc || ""} onChange={(e) => updateProfile("rc", e.target.value)} />
          </Field>
          <Field label={t.ai}>
            <Input data-testid="emitter-ai-input" className={inputCls} value={profile.ai || ""} onChange={(e) => updateProfile("ai", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.legalForm}>
            <Input data-testid="emitter-legalform-input" className={inputCls} value={profile.legalForm || ""} onChange={(e) => updateProfile("legalForm", e.target.value)} />
          </Field>
          <Field label={t.capital}>
            <Input data-testid="emitter-capital-input" className={inputCls} value={profile.capital || ""} onChange={(e) => updateProfile("capital", e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* CLIENT */}
      <Section icon={User} title={t.client} hint={t.clientHint} accent="#0098f2">
        <Field label={t.clientName}>
          <Input
            data-testid="client-name-input"
            className={inputCls}
            value={invoice.client.name}
            onChange={(e) => updateClient("name", e.target.value)}
          />
        </Field>
        <Field label={t.address}>
          <Textarea
            data-testid="client-address-input"
            className={inputCls}
            rows={2}
            value={invoice.client.address}
            onChange={(e) => updateClient("address", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.phone}>
            <Input className={inputCls} value={invoice.client.phone} onChange={(e) => updateClient("phone", e.target.value)} />
          </Field>
          <Field label={t.email}>
            <Input className={inputCls} value={invoice.client.email} onChange={(e) => updateClient("email", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.clientNif}>
            <Input data-testid="client-nif-input" className={inputCls} value={invoice.client.nif || ""} onChange={(e) => updateClient("nif", e.target.value)} />
          </Field>
          <Field label={t.clientNis}>
            <Input data-testid="client-nis-input" className={inputCls} value={invoice.client.nis || ""} onChange={(e) => updateClient("nis", e.target.value)} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.clientRc}>
            <Input data-testid="client-rc-input" className={inputCls} value={invoice.client.rc || ""} onChange={(e) => updateClient("rc", e.target.value)} />
          </Field>
          <Field label={t.clientAi}>
            <Input data-testid="client-ai-input" className={inputCls} value={invoice.client.ai || ""} onChange={(e) => updateClient("ai", e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* DETAILS */}
      <Section icon={FileText} title={t.details} accent="#d4af37">
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.invoiceNumber}>
            <Input
              data-testid="invoice-number-input"
              className={inputCls}
              value={invoice.number}
              onChange={(e) => updateInvoice("number", e.target.value)}
            />
          </Field>
          <Field label={t.currency}>
            <Select value={currency} onValueChange={onCurrencyChange}>
              <SelectTrigger data-testid="currency-switcher-select" className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.issueDate}>
            <Input
              type="date"
              data-testid="invoice-date-input"
              className={`${inputCls} [color-scheme:dark]`}
              value={invoice.date}
              onChange={(e) => updateInvoice("date", e.target.value)}
            />
          </Field>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  data-testid="due-date-toggle-checkbox"
                  checked={Boolean(invoice.dueDate)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateInvoice("dueDate", plusDaysISO(30));
                    } else {
                      updateInvoice("dueDate", "");
                    }
                  }}
                  className="rounded border-[#282e42] bg-[#0e1220] text-violet-600 focus:ring-violet-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-300">
                  {t.dueDate}
                </span>
              </label>
              {invoice.dueDate ? (
                <button
                  type="button"
                  data-testid="clear-due-date-btn"
                  onClick={() => updateInvoice("dueDate", "")}
                  className="text-[11px] text-slate-400 hover:text-red-400 transition-colors"
                  title={t.clearDueDate || "Effacer la date d'échéance"}
                >
                  ✕ {t.clear || "Effacer"}
                </button>
              ) : (
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {t.optional || "Optionnel"}
                </span>
              )}
            </div>
            <div className="relative">
              <Input
                type="date"
                data-testid="invoice-due-date-input"
                className={`${inputCls} [color-scheme:dark] ${invoice.dueDate ? "pr-8" : "text-slate-500 opacity-80"}`}
                value={invoice.dueDate || ""}
                onChange={(e) => updateInvoice("dueDate", e.target.value)}
              />
              {invoice.dueDate ? (
                <button
                  type="button"
                  onClick={() => updateInvoice("dueDate", "")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-400 text-xs p-1"
                  title={t.clear || "Effacer"}
                >
                  ✕
                </button>
              ) : null}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.blNumber}>
            <Input
              data-testid="bl-number-input"
              className={inputCls}
              placeholder="ex: BL-2026-001"
              value={blNumber || ""}
              onChange={(e) => onBlNumberChange(e.target.value)}
            />
          </Field>
          <Field label={t.poNumber}>
            <Input
              data-testid="po-number-input"
              className={inputCls}
              placeholder="ex: BC-2026-042"
              value={poNumber || ""}
              onChange={(e) => onPoNumberChange(e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* ITEMS */}
      <Section icon={ListPlus} title={t.items} accent="#7c3aed">
        <div className="space-y-3">
          {invoice.items.map((it, idx) => (
            <div key={it.id} className="rounded-xl border border-[#282e42] bg-[#0e1220] p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    data-testid={`item-description-input-${idx}`}
                    className={`${inputCls} h-9`}
                    placeholder={t.description}
                    value={it.description}
                    onChange={(e) => updateItem(it.id, "description", e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px] text-slate-500">{t.quantity}</Label>
                      <Input
                        type="number"
                        min="1"
                        data-testid={`item-qty-input-${idx}`}
                        className={`${inputCls} h-9`}
                        value={it.qty}
                        onChange={(e) => updateItem(it.id, "qty", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">{t.unitPrice}</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        data-testid={`item-price-input-${idx}`}
                        className={`${inputCls} h-9`}
                        value={it.price}
                        onChange={(e) => updateItem(it.id, "price", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-slate-500">{t.lineTotal}</Label>
                      <div className="flex h-9 items-center px-2 text-sm font-semibold text-violet-300 tabular-nums truncate">
                        <bdi dir="ltr" style={{ unicodeBidi: "isolate" }}>{formatMoney(lineTotal(it), currency, lang)}</bdi>
                      </div>
                    </div>
                  </div>

                  {it.discount !== undefined && it.discount !== null ? (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-violet-500/5 px-2 py-1.5 ring-1 ring-violet-500/20">
                      <Percent className="h-3.5 w-3.5 text-violet-300" />
                      <Label className="text-[11px] text-slate-400">{t.lineDiscount}</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        data-testid={`item-discount-input-${idx}`}
                        className={`${inputCls} h-8 w-20`}
                        value={it.discount}
                        onChange={(e) => updateItem(it.id, "discount", e.target.value)}
                      />
                      <button
                        data-testid={`remove-item-discount-${idx}`}
                        onClick={() => updateItem(it.id, "discount", undefined)}
                        title={t.removeLineDiscount}
                        className="ms-auto text-xs text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      data-testid={`add-item-discount-${idx}`}
                      onClick={() => updateItem(it.id, "discount", 0)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-violet-300 hover:text-violet-200"
                    >
                      <Percent className="h-3.5 w-3.5" /> {t.addLineDiscount}
                    </button>
                  )}
                </div>
                <button
                  data-testid={`remove-item-button-${idx}`}
                  onClick={() => removeItem(it.id)}
                  disabled={invoice.items.length <= 1}
                  className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-[#282e42] text-red-400 hover:bg-red-500/10 hover:border-red-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button
          data-testid="add-item-button"
          onClick={addItem}
          variant="outline"
          className="w-full border-dashed border-[#3a4260] bg-transparent text-slate-200 hover:bg-violet-500/10 hover:text-violet-200 hover:border-violet-500"
        >
          <Plus className="h-4 w-4 mr-2" /> {t.addLine}
        </Button>
      </Section>

      {/* TAXES */}
      <Section icon={Percent} title={t.taxes} accent="#0098f2">
        <Field label={t.vatRate}>
          <Input
            type="number"
            min="0"
            step="0.1"
            data-testid="vat-rate-input"
            className={inputCls}
            value={invoice.vatRate}
            onChange={(e) => updateInvoice("vatRate", e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label={t.discount}>
            <Select value={invoice.discountType} onValueChange={(v) => updateInvoice("discountType", v)}>
              <SelectTrigger data-testid="discount-type-select" className={inputCls}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">{t.discountPercent}</SelectItem>
                <SelectItem value="fixed">{t.discountFixed}</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="&nbsp;">
            <Input
              type="number"
              min="0"
              step="0.01"
              data-testid="discount-value-input"
              className={inputCls}
              value={invoice.discountValue}
              onChange={(e) => updateInvoice("discountValue", e.target.value)}
            />
          </Field>
        </div>
        <Field label={t.deposit || "Acompte versé"}>
          <Input
            type="number"
            min="0"
            step="0.01"
            data-testid="deposit-input"
            className={inputCls}
            placeholder="0.00"
            value={invoice.deposit ?? ""}
            onChange={(e) => updateInvoice("deposit", e.target.value)}
          />
        </Field>
        {Number(invoice.deposit || 0) > 0 ? (
          <div className="flex items-center justify-between rounded-xl bg-violet-500/10 border border-violet-500/30 px-3 py-2 text-xs">
            <span className="text-violet-200 font-medium">{t.netToPay || "Montant restant dû"} :</span>
            <span className="text-violet-300 font-bold tabular-nums" data-testid="form-net-to-pay">
              <bdi dir="ltr" style={{ unicodeBidi: "isolate" }}>
                {formatMoney(computeTotals(invoice).netToPay, currency, lang)}
              </bdi>
            </span>
          </div>
        ) : null}
      </Section>

      {/* PAYMENT */}
      <Section icon={Landmark} title={t.payment} hint={t.paymentHint} accent="#d4af37">
        <div className="grid grid-cols-1 gap-4">
          <Field label={t.bank}>
            <Input className={inputCls} value={profile.bank} onChange={(e) => updateProfile("bank", e.target.value)} />
          </Field>
          <Field label={t.iban}>
            <Input className={inputCls} value={profile.iban} onChange={(e) => updateProfile("iban", e.target.value)} />
          </Field>
          <Field label={t.legalTerms}>
            <Textarea
              className={inputCls}
              rows={3}
              value={profile.legalTerms}
              onChange={(e) => updateProfile("legalTerms", e.target.value)}
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}
