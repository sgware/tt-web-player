export type ParameterSource = "url" | "default" | "input-needed";

export interface ParameterSummaryItem {
  label: string;
  /** Human readable value, or undefined to display an em dash placeholder. */
  displayValue?: string;
  source: ParameterSource;
}

/**
 * Reusable list that shows the current value of every Join parameter.
 */
export function ParameterSummary({ items }: { items: ParameterSummaryItem[] }) {
  return (
    <ul className="divide-border divide-y rounded-md border">
      {items.map((item) => (
        <li key={item.label} className="px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-muted-foreground truncate text-xs">
              {item.displayValue && item.displayValue.length > 0 ? item.displayValue : "—"}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
