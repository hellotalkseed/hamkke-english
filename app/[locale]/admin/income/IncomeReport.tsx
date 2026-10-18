import IncomeStatement from "./IncomeStatement";
export type IncomeEntry={id:string;date:string|null;learner:string;enrollment:string;description:string;method:string|null;reference:string|null;php:number|null};
const money=(n:number)=>n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
const monthLabel=(year:number,month:number)=>new Intl.DateTimeFormat("en-US",{year:"numeric",month:"long",timeZone:"UTC"}).format(new Date(Date.UTC(year,month-1,1)));
export default function IncomeReport({year,month,entries,generatedAt}:{year:number;month:number|null;entries:IncomeEntry[];generatedAt:string}) {
 const annual=entries.filter(e=>e.date?.startsWith(`${year}-`));
 const months=Array.from({length:12},(_,i)=>{const month=i+1;const rows=annual.filter(e=>e.date?.slice(5,7)===String(month).padStart(2,"0"));return {month,rows,total:rows.reduce((n,e)=>n+(e.php??0),0),missing:rows.filter(e=>e.php===null).length};});
 const total=annual.reduce((n,e)=>n+(e.php??0),0);const missing=annual.filter(e=>e.php===null).length;
 const issued=new Intl.DateTimeFormat("en-GB",{year:"numeric",month:"short",day:"2-digit",timeZone:"Asia/Manila"}).format(new Date(generatedAt));
 return <div className="income-report"><style>{`
 .hamkke-income-print-root { display:none; }
 @media screen {
         .income-report .income-print { display: block !important; font: 10pt/1.35 Arial, sans-serif; color: #222; }
        .income-report .income-print * { box-sizing: border-box; }
        .income-report .income-print p { margin: 0; }
        .income-report .income-print .notes p + p { margin-top: 1mm; }
        .income-report .income-print .statement-brand { display: flex; justify-content: space-between; align-items: start; border-bottom: 1.5pt solid #526852; padding-bottom: 3mm; }
        .income-report .income-print .brand { font: bold 15pt Georgia, serif; letter-spacing: 1px; }
        .income-report .income-print .small { font-size: 8pt; color: #555; }
        .income-report .income-print h1 { font: bold 21pt Georgia, serif; margin: 4mm 0 1mm; }
        .income-report .income-print .subtitle { margin: 0 0 4mm; color: #555; }
        .income-report .income-print .metadata { display: grid; grid-template-columns: 1fr 1fr; gap: 2mm 8mm; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 3mm 0; margin-bottom: 4mm; }
        .income-report .income-print .label { display: block; font-size: 8pt; color: #555; margin-bottom: 1mm; }
        .income-report .income-print table { width: 100%; table-layout: fixed; border-collapse: collapse; font-size: 8.5pt; }
        .income-report .income-print thead { display: table-header-group; }
        .income-report .income-print th { padding: 2mm 2mm; border-top: 1px solid #555; border-bottom: 1px solid #555; text-align: left; font-size: 8pt; }
        .income-report .income-print td { padding: 2mm 2mm; vertical-align: top; border-bottom: 1px solid #ddd; overflow-wrap: anywhere; }
        .income-report .income-print tr { break-inside: avoid; page-break-inside: avoid; }
        .income-report .income-print .amount { text-align: right; white-space: nowrap; }
        .income-report .income-print .summary { display: flex; justify-content: space-between; gap: 5mm; border-top: 1.5px solid #444; padding-top: 3mm; margin-top: 3mm; break-inside: avoid; }
        .income-report .income-print .total { font-size: 15pt; font-weight: bold; }
        .income-report .income-print .notes { margin-top: 3mm; font-size: 8pt; color: #555; }
        .income-report .income-print .declaration { margin-top: 5mm; break-inside: avoid; }
        .income-report .income-print .declaration h2 { font-size: 10pt; margin-bottom: 2mm; }
        .income-report .income-print .signature { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16mm; margin-top: 9mm; }
        .income-report .income-print .signature > div { border-top: 1px solid #555; padding-top: 2mm; }
 .income-report .income-print { background:white; padding:24px; margin-bottom:24px; }
 .income-report .income-print h1 { font-family:Arial,sans-serif; font-size:24px; }
 .income-report .income-print .brand { font-family:Arial,sans-serif; }
 }
 @media print {
  body:has(.hamkke-income-print-root) > *:not(.hamkke-income-print-root) { display:none !important; }
  .hamkke-income-print-root { display:block !important; margin:0 !important; padding:0 !important; }
  .hamkke-income-print-root .income-report { margin:0; padding:0; }
  .hamkke-income-print-root .income-month-section { break-before:page; page-break-before:always; }
  .hamkke-income-print-root .income-annual-cover { break-inside:avoid; }
 }
 `}</style>
 {month===null&&<article className="income-print income-annual-cover"><header className="statement-brand"><div><div className="brand">HAMKKE │ 함께</div><div className="small">Private English Lessons · hamkkeenglish.com</div></div><div className="small">SELF-PREPARED STATEMENT</div></header><h1>Annual Income Statement</h1><p className="subtitle">Monthly totals · {year}</p><div className="metadata"><div><span className="label">Prepared by</span><strong>Jesica Abejaron</strong></div><div><span className="label">Reporting period</span>January–December {year}</div><div><span className="label">Internal report reference</span>HK-INC-{year}-ANNUAL</div><div><span className="label">Generated on · Philippine time</span>{issued}</div></div><table><thead><tr><th>Month</th><th className="amount">Recorded PHP</th></tr></thead><tbody>{months.map(m=><tr key={m.month}><td>{monthLabel(year,m.month)}{m.missing>0&&<span className="small"> · {m.missing} missing amount{m.missing===1?'':'s'}</span>}</td><td className="amount">{money(m.total)}</td></tr>)}</tbody></table><div className="summary"><div>Annual total<div className="small">Currency: Philippine peso (PHP)</div></div><div className="total amount">PHP {money(total)}</div></div><div className="notes">{missing>0&&<p><strong>Incomplete total:</strong> {missing} records have no PHP amount and are excluded from totals.</p>}<p>Includes payments marked paid, selected by payment date. PHP amounts are those recorded in Hamkke; no exchange rates have been recalculated. This statement reports receipts before expenses and does not calculate net profit or taxable income.</p><p>This is a self-prepared summary, not an invoice, tax return, or independently certified statement. Supporting payment records should accompany it when required.</p><p>The following monthly schedules form part of this annual statement. Months without recorded paid payments show zero.</p></div><section className="declaration"><h2>Declaration</h2><p>By signing below, I confirm that I have reviewed this annual statement, including the attached monthly payment schedules, and that, to the best of my knowledge, it accurately reflects the recorded payments for the stated period.</p><div className="signature"><div><strong>Jesica Abejaron</strong><div className="small">Signature over printed name</div></div><div>Date signed</div></div></section></article>}
 {months.filter(m=>month===null||month===m.month).map(m=><section className={month===null?"income-month-section":""} key={m.month}><IncomeStatement includeDeclaration={month!==null} annualReference={month===null?`HK-INC-${year}-ANNUAL`:undefined} period={monthLabel(year,m.month)} reportId={`HK-INC-${year}${String(m.month).padStart(2,"0")}`} generatedAt={generatedAt} entries={m.rows}/></section>)}
 </div>;
}
