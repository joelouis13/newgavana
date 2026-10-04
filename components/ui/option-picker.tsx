"use client";

export function OptionPicker({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
  error?: boolean;
}) {
  return (
    <fieldset>
      <legend className="mb-2 flex items-baseline gap-2 text-sm font-medium text-navy-900">
        {label}
        {value && <span className="font-normal text-muted">— {value}</span>}
        {error && !value && <span className="text-xs font-medium text-red-600">Please choose</span>}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = opt === value;
          return (
            <button
              key={opt}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(opt)}
              className={`min-w-11 rounded-full border px-4 py-2 text-sm font-medium transition ${
                selected
                  ? "border-navy-800 bg-navy-800 text-white"
                  : error && !value
                    ? "border-red-300 bg-white text-navy-900 hover:border-navy-800"
                    : "border-sand-300 bg-white text-navy-900 hover:border-navy-800"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
