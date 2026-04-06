import { DATE_RANGE_OPTIONS, getDateRangeLabel, type DateRange } from "../lib/dateRange";

type RangeDropdownProps = {
  value: DateRange;
  open: boolean;
  onToggle: () => void;
  onChange: (range: DateRange) => void;
  className?: string;
};

function RangeDropdown({ value, open, onToggle, onChange, className = "" }: RangeDropdownProps) {
  return (
    <div className={`relative ${className}`.trim()}>
      <button onClick={onToggle} className="accent-link inline-flex items-center gap-1 text-sm">
        {getDateRangeLabel(value)}
        <span className="text-xs">▼</span>
      </button>

      {open && (
        <div className="panel-sub absolute z-20 mt-2 w-40 !p-1">
          {DATE_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`mt-1 first:mt-0 w-full rounded-md px-2 py-1.5 text-left text-sm ${
                value === option.value
                  ? "chip-active"
                  : "text-main hover:bg-[var(--accent-soft)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default RangeDropdown;
