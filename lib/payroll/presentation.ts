export type PayrollLine = { attendance_status: string; duration: number; rate: number; amount: number };
type Summary = {
  completed_25_count: number; completed_50_count: number;
  no_show_25_count: number; no_show_50_count: number;
  late_cancellation_25_count: number; late_cancellation_50_count: number;
  rate_25: number; rate_50: number;
};
export type PayableStatus = "completed" | "no_show" | "late_cancellation";
export function categoryAmount(record: Summary, lines: PayrollLine[] | undefined, status: PayableStatus) {
  if (lines?.length) return lines.filter(line => line.attendance_status === status).reduce((sum, line) => sum + Math.round(Number(line.amount) * 100), 0) / 100;
  // Legacy payrolls without saved lesson detail retain their original flat-rate summary.
  return record[`${status}_25_count`] * record.rate_25 + record[`${status}_50_count`] * record.rate_50;
}
export function lessonRateLabel(lines: PayrollLine[] | undefined, duration: number, fallback: number) {
  const values = [...new Set((lines ?? []).filter(line => Number(line.duration) === duration).map(line => Number(line.rate)))].sort((a,b) => a-b);
  const currency = (value: number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
  if (!values.length) return currency(fallback);
  return values.length === 1 ? currency(values[0]) : `${currency(values[0])} – ${currency(values[values.length - 1])}`;
}
