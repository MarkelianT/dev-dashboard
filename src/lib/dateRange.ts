export type DateRange = "today" | "7d" | "30d";

export const DATE_RANGE_OPTIONS: ReadonlyArray<{ value: DateRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last month" },
];

export function getDateRangeLabel(range: DateRange) {
  return DATE_RANGE_OPTIONS.find((option) => option.value === range)?.label ?? "Today";
}

export function getRangeStart(range: DateRange) {
  const start = new Date();

  if (range === "today") {
    start.setHours(0, 0, 0, 0);
    return start;
  }

  start.setDate(start.getDate() - (range === "7d" ? 7 : 30));
  start.setHours(0, 0, 0, 0);
  return start;
}

export function isDateWithinRange(isoDate: string, range: DateRange) {
  if (range === "today") {
    return isoDate === new Date().toISOString().slice(0, 10);
  }

  return new Date(`${isoDate}T00:00:00`) >= getRangeStart(range);
}
