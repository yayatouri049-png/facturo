// FacturaFlow - currency + calculation + storage helpers

export const CURRENCIES = [
  { code: "DZD", symbol: "DA", symbolAr: "دج", position: "suffix", locale: "fr-DZ" },
  { code: "EUR", symbol: "€", symbolAr: "€", position: "suffix", locale: "fr-FR" },
  { code: "USD", symbol: "$", symbolAr: "$", position: "prefix", locale: "en-US" },
];

export function getCurrency(code) {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[1];
}

export function formatMoney(amount, code, lang) {
  const c = getCurrency(code);
  const n = Number(amount) || 0;
  let formatted = n.toLocaleString(c.code === "USD" ? "en-US" : "fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // Force non-breaking spaces so thousand groups never wrap or get reordered
  formatted = formatted.replace(/\s/g, "\u00A0");
  const sym = lang === "ar" && c.symbolAr ? c.symbolAr : c.symbol;
  return c.position === "prefix" ? `${sym}${formatted}` : `${formatted}\u00A0${sym}`;
}

export function formatDate(iso) {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  const [y, m, d] = parts;
  return `${d}/${m}/${y}`;
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function plusDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function lineTotal(it) {
  const base = (Number(it.qty) || 0) * (Number(it.price) || 0);
  const d = Number(it.discount) || 0;
  return base * (1 - d / 100);
}

export function computeTotals(invoice) {
  const subtotal = (invoice.items || []).reduce((sum, it) => sum + lineTotal(it), 0);
  let discountAmount = 0;
  const dv = Number(invoice.discountValue) || 0;
  if (invoice.discountType === "percent") {
    discountAmount = (subtotal * dv) / 100;
  } else {
    discountAmount = dv;
  }
  discountAmount = Math.min(discountAmount, subtotal);
  const base = subtotal - discountAmount;
  const vat = (base * (Number(invoice.vatRate) || 0)) / 100;
  const total = base + vat;
  return { subtotal, discountAmount, base, vat, total };
}

export function nextInvoiceNumber(num) {
  if (!num) return "FAC-2026-001";
  const match = num.match(/(\d+)(?!.*\d)/);
  if (!match) return num;
  const digits = match[1];
  const incremented = String(Number(digits) + 1).padStart(digits.length, "0");
  return num.slice(0, match.index) + incremented + num.slice(match.index + digits.length);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ---- LocalStorage ----
export const STORAGE_KEYS = {
  profile: "facturaflow_profile",
  invoice: "facturaflow_invoice",
  lang: "facturaflow_lang",
  currency: "facturaflow_currency",
  history: "facturaflow_history",
  template: "facturaflow_template",
};

export function loadLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

export function clearAllLS() {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
}

// ---- Defaults / demo data ----
export const DEFAULT_PROFILE = {
  logo: "",
  name: "",
  address: "",
  phone: "",
  email: "",
  taxId: "",
  rc: "",
  ai: "",
  legalForm: "",
  capital: "",
  iban: "",
  bank: "",
  legalTerms: "",
};

export function makeDefaultInvoice() {
  return {
    number: "FAC-2026-001",
    date: todayISO(),
    dueDate: plusDaysISO(30),
    client: {
      name: "",
      address: "",
      email: "",
      phone: "",
      nif: "",
      rc: "",
      ai: "",
    },
    items: [
      { id: uid(), description: "Conception & développement site web", qty: 1, price: 120000 },
      { id: uid(), description: "Maintenance mensuelle", qty: 3, price: 8000 },
    ],
    vatRate: 19,
    discountType: "percent",
    discountValue: 0,
  };
}

export function makeEmptyInvoice(number) {
  return {
    number: number || "FAC-2026-001",
    date: todayISO(),
    dueDate: plusDaysISO(30),
    client: { name: "", address: "", email: "", phone: "", nif: "", rc: "", ai: "" },
    items: [{ id: uid(), description: "", qty: "", price: "" }],
    vatRate: "",
    discountType: "percent",
    discountValue: "",
  };
}

// ---- History ----
export function duplicateInvoice(snapshot, newNumber) {
  return {
    ...snapshot,
    number: newNumber,
    date: todayISO(),
    dueDate: plusDaysISO(30),
    client: { ...snapshot.client },
    items: (snapshot.items || []).map((it) => ({ ...it, id: uid() })),
  };
}
