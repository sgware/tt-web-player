export interface ParameterSummaryItem {
  label: string;
  displayValue?: string;
  description?: string;
}

export function ParameterSummary({ items }: { items: ParameterSummaryItem[] }) {
  return (
    <ul className="divide-border divide-y rounded-md border">
      {items.map((item) => (
        <li key={item.label} className="px-3 py-2">
          <div className="min-w-0 space-y-0.5">
            <p className="text-muted-foreground text-xs">{item.label}</p>
            <p className="truncate text-sm font-medium">
              {item.displayValue && item.displayValue.length > 0
                ? item.displayValue
                : "—"}
            </p>
            {item.description && (
              <p className="text-muted-foreground text-xs leading-snug">
                {item.description}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
