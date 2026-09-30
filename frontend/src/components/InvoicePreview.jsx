import React from "react";
import { formatMoney, formatDate, computeTotals, lineTotal } from "@/lib/invoiceUtils";
import { amountInWordsSentence } from "@/lib/numberToWords";
import { DEFAULT_TEMPLATE } from "@/lib/templates";

export default function InvoicePreview({ profile, invoice, currency, t, dir, lang, theme }) {
  const { subtotal, discountAmount, vat, total } = computeTotals(invoice);
  const items = invoice.items || [];
  const hasAnyDiscount = items.some((it) => Number(it.discount) > 0);

  const legalForm = (profile.legalForm || "").trim();
  const capital = (profile.capital || "").trim();

  const tpl = theme || DEFAULT_TEMPLATE;
  const accent = tpl.accent;
  const gold = tpl.secondary;
  const muted = tpl.muted;
  const border = tpl.border;

  // header colors (adapt to a dark header band when present)
  const band = tpl.headerBand;
  const hName = band ? band.fg : accent;
  const hBody = band ? band.sub : "#334155";
  const hMuted = band ? band.sub : muted;
  const hTitle = band ? band.titleColor : accent;

  return (
    <div
      id="a4-invoice-preview"
      dir={dir}
      data-testid="a4-invoice-preview"
      className="a4-shadow"
      style={{ padding: "40px", position: "relative" }}
    >
      {/* top gradient accent bar */}
      {tpl.topBar && !band ? (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: tpl.topBar,
          }}
        />
      ) : null}

      {/* HEADER */}
      <div
        style={
          band
            ? { background: band.bg, color: band.fg, margin: "-40px -40px 0", padding: "34px 40px 26px" }
            : undefined
        }
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "24px" }}>
          <div style={{ maxWidth: "55%" }}>
            {profile.logo ? (
              <img
                src={profile.logo}
                alt="logo"
                style={{ maxWidth: "140px", maxHeight: "60px", objectFit: "contain", display: "block", marginBottom: "12px" }}
              />
            ) : null}
            <div style={{ fontSize: "14px", fontWeight: 700, color: hName }}>{profile.name || "—"}</div>
            <div style={{ fontSize: "12px", color: hBody, whiteSpace: "pre-line", lineHeight: 1.5, marginTop: "4px" }}>
              {profile.address}
            </div>
            <div style={{ fontSize: "12px", color: hBody, marginTop: "4px", lineHeight: 1.5 }}>
              {profile.phone ? <div><Ltr>{profile.phone}</Ltr></div> : null}
              {profile.email ? <div><Ltr>{profile.email}</Ltr></div> : null}
              {profile.taxId ? <div style={{ color: hMuted }}>{t.nifShort} : <Ltr>{profile.taxId}</Ltr></div> : null}
              {profile.rc ? <div style={{ color: hMuted }}>{t.rcShort} : <Ltr>{profile.rc}</Ltr></div> : null}
              {profile.ai ? <div style={{ color: hMuted }}>{t.aiShort} : <Ltr>{profile.ai}</Ltr></div> : null}
            </div>
          </div>

          <div style={{ textAlign: "end", minWidth: "40%" }}>
            <div style={{ fontSize: "27px", fontWeight: 800, letterSpacing: "3px", color: hTitle, lineHeight: 1 }}>
              {t.invoiceTitle}
            </div>
            <div style={{ marginTop: "14px", fontSize: "12px", color: hBody, lineHeight: 1.8 }}>
              <div>
                <span style={{ color: hMuted }}>{t.noHash} </span>
                <span style={{ fontWeight: 700, color: hName, fontSize: "13px" }}><Ltr>{invoice.number}</Ltr></span>
              </div>
              <div>
                <span style={{ color: hMuted }}>{t.issueDate}: </span>
                <span style={{ fontWeight: 600 }}><Ltr>{formatDate(invoice.date)}</Ltr></span>
              </div>
              <div>
                <span style={{ color: hMuted }}>{t.dueDate}: </span>
                <span style={{ fontWeight: 600 }}><Ltr>{formatDate(invoice.dueDate)}</Ltr></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {tpl.headerRule && !band ? (
        <div style={{ height: "2px", background: accent, marginTop: "16px", borderRadius: "2px" }} />
      ) : null}

      {/* BILLED TO */}
      <div
        style={{
          marginTop: "28px",
          marginInlineStart: "auto",
          width: "48%",
          background: tpl.boxBg,
          border: `1px solid ${border}`,
          borderRadius: "8px",
          padding: "14px 16px",
        }}
      >
        <div style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", color: gold }}>{t.billedTo}</div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: accent, marginTop: "6px" }}>
          {invoice.client.name || "—"}
        </div>
        <div style={{ fontSize: "12px", color: "#334155", whiteSpace: "pre-line", lineHeight: 1.5, marginTop: "2px" }}>
          {invoice.client.address}
        </div>
        <div style={{ fontSize: "12px", color: "#334155", lineHeight: 1.5 }}>
          {invoice.client.phone ? <div><Ltr>{invoice.client.phone}</Ltr></div> : null}
          {invoice.client.email ? <div><Ltr>{invoice.client.email}</Ltr></div> : null}
          {(invoice.client.nif || invoice.client.taxId) ? (
            <div style={{ color: muted }}>{t.nifShort} : <Ltr>{invoice.client.nif || invoice.client.taxId}</Ltr></div>
          ) : null}
          {invoice.client.rc ? <div style={{ color: muted }}>{t.rcShort} : <Ltr>{invoice.client.rc}</Ltr></div> : null}
          {invoice.client.ai ? <div style={{ color: muted }}>{t.aiShort} : <Ltr>{invoice.client.ai}</Ltr></div> : null}
        </div>
      </div>

      {/* ITEMS TABLE */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "26px", fontSize: "12px" }}>
        <thead>
          <tr style={{ background: tpl.tableHeadBg }}>
            <th style={{ textAlign: "start", padding: "9px 10px", width: hasAnyDiscount ? "40%" : "50%", color: tpl.tableHeadColor, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {t.description}
            </th>
            <th style={{ textAlign: "center", padding: "9px 10px", width: hasAnyDiscount ? "12%" : "15%", color: tpl.tableHeadColor, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {t.quantity}
            </th>
            <th style={{ textAlign: "end", padding: "9px 10px", width: hasAnyDiscount ? "18%" : "15%", color: tpl.tableHeadColor, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {t.unitPrice}
            </th>
            {hasAnyDiscount && (
              <th style={{ textAlign: "center", padding: "9px 10px", width: "12%", color: tpl.tableHeadColor, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                {t.lineDiscount}
              </th>
            )}
            <th style={{ textAlign: "end", padding: "9px 10px", width: hasAnyDiscount ? "18%" : "20%", color: tpl.tableHeadColor, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {t.lineTotal}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} style={{ borderBottom: `1px solid ${border}` }}>
              <td style={{ textAlign: "start", padding: "8px 10px", color: "#0f172a" }}>{it.description || "—"}</td>
              <td style={{ textAlign: "center", padding: "8px 10px", color: "#334155" }}><Ltr>{Number(it.qty) || 0}</Ltr></td>
              <td style={{ textAlign: "end", padding: "8px 10px", color: "#334155" }}><Ltr>{formatMoney(it.price, currency, lang)}</Ltr></td>
              {hasAnyDiscount && (
                <td style={{ textAlign: "center", padding: "8px 10px", color: "#334155" }}>
                  {Number(it.discount) > 0 ? <Ltr>{`${Number(it.discount)}%`}</Ltr> : "—"}
                </td>
              )}
              <td style={{ textAlign: "end", padding: "8px 10px", fontWeight: 600, color: "#0f172a" }}>
                <Ltr>{formatMoney(lineTotal(it), currency, lang)}</Ltr>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <div style={{ marginTop: "18px", marginInlineStart: "auto", width: "42%" }}>
        <Row label={t.subtotalHT} value={<Ltr>{formatMoney(subtotal, currency, lang)}</Ltr>} muted={muted} testid="preview-subtotal-ht" />
        {discountAmount > 0 ? (
          <Row label={t.discountLabel} value={<Ltr>{`- ${formatMoney(discountAmount, currency, lang)}`}</Ltr>} muted={muted} />
        ) : null}
        <Row
          label={`${t.vatLabel} (${Number(invoice.vatRate) || 0}%)`}
          value={<Ltr>{formatMoney(vat, currency, lang)}</Ltr>}
          muted={muted}
          testid="preview-tax-amount"
        />
        <div
          data-testid="preview-total-ttc"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "8px",
            padding: "12px 14px",
            borderRadius: "8px",
            background: tpl.totalsBg,
            border: `1px solid ${tpl.totalsBorder}`,
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", color: tpl.totalsColor, textTransform: "uppercase" }}>
            {t.totalTTC}
          </span>
          <span style={{ fontSize: "17px", fontWeight: 800, color: tpl.totalsAmountColor }}><Ltr>{formatMoney(total, currency, lang)}</Ltr></span>
        </div>
      </div>

      {/* AMOUNT IN WORDS */}
      <div
        data-testid="preview-amount-in-words"
        style={{
          clear: "both",
          marginTop: "16px",
          padding: "10px 14px",
          background: tpl.boxBg,
          border: `1px solid ${border}`,
          borderRadius: "8px",
          fontSize: "11.5px",
          color: "#1e293b",
          lineHeight: 1.6,
          fontStyle: lang === "ar" ? "normal" : "italic",
        }}
      >
        {amountInWordsSentence(total, lang, currency, t.amountWordsPrefix)}
      </div>

      {/* FOOTER */}
      <div style={{ position: "absolute", left: "40px", right: "40px", bottom: "34px" }}>
        {/* Stamp & signature */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
          <div style={{ width: "38%", textAlign: "center" }}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: gold,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "6px",
              }}
            >
              {t.stampSignature}
            </div>
            <div style={{ height: "62px", border: `1px dashed ${border}`, borderRadius: "8px" }} />
          </div>
        </div>

        <div style={{ height: "1px", background: border, marginBottom: "12px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", gap: "24px", fontSize: "9.5px", color: "#6b7280", lineHeight: 1.6 }}>
          {(profile.iban || profile.bank) && (
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: gold, marginBottom: "2px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {t.bankDetails}
              </div>
              {profile.bank ? <div>{profile.bank}</div> : null}
              {profile.iban ? <div><Ltr>{profile.iban}</Ltr></div> : null}
            </div>
          )}
          {profile.legalTerms ? (
            <div style={{ flex: 1, textAlign: "end", whiteSpace: "pre-line" }}>{profile.legalTerms}</div>
          ) : null}
        </div>
        {(legalForm || capital) ? (
          <div
            data-testid="preview-legal-line"
            style={{ textAlign: "center", fontSize: "9.5px", fontWeight: 600, color: "#475569", marginTop: "8px" }}
          >
            {legalForm && capital ? (
              <>{legalForm} {t.capitalPrefix} <Ltr>{capital}</Ltr></>
            ) : legalForm ? (
              legalForm
            ) : (
              <>{t.capital} : <Ltr>{capital}</Ltr></>
            )}
          </div>
        ) : null}
        <div style={{ textAlign: "center", fontSize: "9px", color: "#9ca3af", marginTop: "6px" }}>{t.thankYou}</div>
      </div>
    </div>
  );
}

function Row({ label, value, testid }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 2px", fontSize: "12px" }}>
      <span style={{ color: "#334155", fontWeight: 500 }}>{label}</span>
      <span data-testid={testid} style={{ fontWeight: 600, color: "#0f172a" }}>
        {value}
      </span>
    </div>
  );
}

// LTR isolation wrapper: keeps numbers, amounts, IBAN, IDs, dates, phones and
// emails in correct left-to-right order even inside an RTL (Arabic) document.
function Ltr({ children }) {
  return (
    <bdi dir="ltr" style={{ unicodeBidi: "isolate" }}>
      {children}
    </bdi>
  );
}
