export type SummaryPayment = { id:string; payment_date:string|null; amount_php:number|null };
export type MonthSummary = { month:number; count:number; total:number; missing:number };
export type YearSummary = { year:number; count:number; total:number; missing:number; months:MonthSummary[] };
export function summarizeIncome(rows:SummaryPayment[], currentYear:number) {
 const years=new Map<number,YearSummary>(); let undated=0;
 function yearFor(year:number){let value=years.get(year);if(!value){value={year,count:0,total:0,missing:0,months:Array.from({length:12},(_,i)=>({month:i+1,count:0,total:0,missing:0}))};years.set(year,value);}return value;}
 yearFor(currentYear);
 for(const row of rows){const match=/^(\d{4})-(\d{2})-\d{2}$/.exec(row.payment_date||'');if(!match||Number(match[2])<1||Number(match[2])>12){undated++;continue;}
 const year=yearFor(Number(match[1]));const month=year.months[Number(match[2])-1];const value=Number(row.amount_php);const missing=row.amount_php===null||!Number.isFinite(value);year.count++;month.count++;
 if(missing){year.missing++;month.missing++;}else{year.total+=value;month.total+=value;}
 }
 return {years:[...years.values()].sort((a,b)=>b.year-a.year),undated};
}
