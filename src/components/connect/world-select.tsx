import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WorldInfo } from "@/types/protocol";

const ANY_WORLD_VALUE = "__any_world__";

interface WorldSelectProps {
  worlds: WorldInfo[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Reusable dropdown for choosing a story world, with "Any world" as the default option. */
export function WorldSelect({ worlds, value, onChange, disabled }: WorldSelectProps) {
  return (
    <Select
      value={value === "" ? ANY_WORLD_VALUE : value}
      onValueChange={(next) => onChange(next === ANY_WORLD_VALUE ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full" aria-label="Story world">
        <SelectValue placeholder="Any world" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY_WORLD_VALUE}>Any world</SelectItem>
        {worlds.map((world) => (
          <SelectItem key={world.name} value={world.name}>
            {world.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
