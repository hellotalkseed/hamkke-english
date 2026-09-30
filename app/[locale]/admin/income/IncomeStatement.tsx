function formatPaymentMethod(value: string | null): string {
  if (!value?.trim()) return "Not recorded";
  const key = value.trim().toLowerCase().replace(/[\s_-]+/g, "");
  const brands: Record<string, string> = {
    gcash: "GCash", paypal: "PayPal", sentbe: "SentBe", maya: "Maya",
    paymaya: "PayMaya", wise: "Wise", remitly: "Remitly", gotyme: "GoTyme",
    gotymebank: "GoTyme Bank", bpi: "BPI", bdo: "BDO", unionbank: "UnionBank",
    metrobank: "Metrobank", seabank: "SeaBank", grabpay: "GrabPay",
    shopeepay: "ShopeePay", alipay: "Alipay", wechatpay: "WeChat Pay",
    banktransfer: "Bank Transfer", koreanbanktransfer: "Korean Bank Transfer",
    cash: "Cash", creditcard: "Credit Card", debitcard: "Debit Card",
    pending: "Pending", other: "Other",
  };
  return brands[key] ?? value.trim().replace(/[_-]+/g, " ").replace(/\b[a-z]/g, letter => letter.toUpperCase());
}

type Entry = { id: string; date: string | null; learner: string; enrollment: string; description: string; method: string | null; reference: string | null; php: number | null };
const money = (amount: number) => amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function dateLabel(value: string | null) {
  return value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`)) : "Not recorded";
}
export default function IncomeStatement({ period, reportId, generatedAt, entries }: { period: string; reportId: string; generatedAt: string; entries: Entry[] }) {
  const total = entries.reduce((sum, entry) => sum + (entry.php ?? 0), 0);
  const missing = entries.filter(entry => entry.php === null).length;
  const issued = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Manila" }).format(new Date(generatedAt));
  return <article className="income-print" aria-label="Printable monthly income statement">
    <style>{`
      .income-print { display: none; }
      @media print {
        @page { size: A4 portrait; margin: 16mm 14mm 18mm;
          @bottom-left { content: "Hamkke | Self-prepared statement"; font: 8pt Arial, sans-serif; color: #666; }
          @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 8pt Arial, sans-serif; color: #666; }
        }
        html:has(.income-print), body:has(.income-print) { background: white !important; color: #222 !important; margin: 0 !important; padding: 0 !important; }
        body:has(.income-print) .owner-admin-shell > aside { display: none !important; }
        body:has(.income-print) .owner-admin-shell,
        body:has(.income-print) .owner-admin-content,
        body:has(.income-print) .income-page { margin: 0 !important; padding: 0 !important; min-height: 0 !important; height: auto !important; width: 100% !important; max-width: none !important; background: white !important; overflow: visible !important; }
        .income-screen { display: none !important; }
        .income-print { display: block !important; font: 10pt/1.35 Arial, sans-serif; color: #222; }
        .income-print * { box-sizing: border-box; }
        .income-print p { margin: 0; }
        .income-print .notes p + p { margin-top: 1mm; }
        .income-print .statement-brand { display: flex; justify-content: space-between; align-items: start; border-bottom: 1.5pt solid #526852; padding-bottom: 3mm; }
        .income-print .brand { font: bold 15pt Georgia, serif; letter-spacing: 1px; }
        .income-print .small { font-size: 8pt; color: #555; }
        .income-print h1 { font: bold 21pt Georgia, serif; margin: 4mm 0 1mm; }
        .income-print .subtitle { margin: 0 0 4mm; color: #555; }
        .income-print .metadata { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 8mm; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 3mm 0; margin-bottom: 4mm; }
        .income-print .label { display: block; font-size: 8pt; color: #555; margin-bottom: 1mm; }
        .income-print table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 8.5pt; }
        .income-print thead { display: table-header-group; }
        .income-print th { padding: 2mm 2mm; border-top: 1px solid #555; border-bottom: 1px solid #555; text-align: left; font-size: 8pt; }
        .income-print td { padding: 2mm 2mm; vertical-align: top; border-bottom: 1px solid #ddd; overflow-wrap: anywhere; }
        .income-print tr { break-inside: avoid; page-break-inside: avoid; }
        .income-print .amount { text-align: right; white-space: nowrap; }
        .income-print .summary { display: flex; justify-content: space-between; gap: 5mm; border-top: 1.5px solid #444; padding-top: 3mm; margin-top: 3mm; break-inside: avoid; }
        .income-print .total { font-size: 15pt; font-weight: bold; }
        .income-print .notes { margin-top: 3mm; font-size: 8pt; color: #555; }
        .income-print .declaration { margin-top: 5mm; break-inside: avoid; }
        .income-print .declaration h2 { font-size: 10pt; margin-bottom: 2mm; }
        .income-print .signature { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16mm; margin-top: 9mm; }
        .income-print .signature > div { border-top: 1px solid #555; padding-top: 2mm; }
      }
    `}</style>
    <header className="statement-brand">
      <div><div className="brand">HAMKKE │ 함께</div><div className="small">Private English Lessons · hamkkeenglish.com</div></div>
      <div className="small">SELF-PREPARED STATEMENT</div>
    </header>
    <h1>Monthly Income Statement</h1>
    <p className="subtitle">Schedule of recorded lesson payments · {period}</p>
    <div className="metadata">
      <div><span className="label">Prepared by</span><strong>Jesica Abejaron</strong></div>
      <div><span className="label">Reporting period</span>{period}</div>
      <div><span className="label">Internal report reference</span>{reportId}</div>
      <div><span className="label">Generated on · Philippine time</span>{issued}</div>
    </div>
    <table>
      <colgroup><col style={{ width: "15%" }}/><col style={{ width: "22%" }}/><col style={{ width: "28%" }}/><col style={{ width: "20%" }}/><col style={{ width: "15%" }}/></colgroup>
      <thead><tr><th>Payment date</th><th>Learner</th><th>Enrollment / description</th><th>Method / reference</th><th className="amount">Recorded PHP</th></tr></thead>
      <tbody>{entries.length ? entries.map(entry => <tr key={entry.id}>
        <td>{dateLabel(entry.date)}</td><td>{entry.learner}</td>
        <td><strong>{entry.enrollment}</strong><div className="small">{entry.description}</div></td>
        <td>{formatPaymentMethod(entry.method)}{entry.reference && <div className="small">{entry.reference}</div>}</td>
        <td className="amount">{entry.php === null ? "Not recorded" : money(entry.php)}</td>
      </tr>) : <tr><td colSpan={5}>No payments marked paid were recorded for this period.</td></tr>}</tbody>
    </table>
    <div className="summary"><div>{entries.length} payment record{entries.length === 1 ? "" : "s"}<div className="small">Currency: Philippine peso (PHP)</div></div>
      <div className="amount"><span className="label">{missing ? "Subtotal of available PHP amounts" : "Total recorded payments"}</span><span className="total">PHP {money(total)}</span></div>
    </div>
    <div className="notes">
      {missing > 0 && <p><strong>Incomplete PHP total:</strong> {missing} payment record(s) have no PHP amount and are excluded from the subtotal. Complete those records before presenting this statement.</p>}
      <p>Includes payments marked paid, selected by payment date. PHP amounts are those recorded in Hamkke; no exchange rates have been recalculated. This statement reports receipts before expenses and does not calculate net profit or taxable income.</p>
      <p>This is a self-prepared summary, not an invoice, tax return, or independently certified statement. Supporting payment records should accompany it when required.</p>
    </div>
    <section className="declaration"><h2>Declaration</h2><p>By signing below, I confirm that I have reviewed this statement and that, to the best of my knowledge, it accurately reflects the recorded payments for the stated period.</p>
      <div className="signature"><div><strong>Jesica Abejaron</strong><div className="small">Signature over printed name</div></div><div>Date signed</div></div>
    </section>
  </article>;
}
