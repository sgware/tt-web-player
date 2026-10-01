import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TandemTalesRole } from "@/types/protocol";

const EITHER_ROLE_VALUE = "__either_role__";

interface RoleSelectProps {
  value: TandemTalesRole | "";
  onChange: (value: TandemTalesRole | "") => void;
  disabled?: boolean;
}

/** Reusable dropdown for choosing PLAYER / GAME_MASTER, defaulting to "Either role". */
export function RoleSelect({ value, onChange, disabled }: RoleSelectProps) {
  return (
    <Select
      value={value === "" ? EITHER_ROLE_VALUE : value}
      onValueChange={(next) =>
        onChange(next === EITHER_ROLE_VALUE ? "" : (next as TandemTalesRole))
      }
      disabled={disabled}
    >
      <SelectTrigger className="w-full" aria-label="Role">
        <SelectValue placeholder="Either role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={EITHER_ROLE_VALUE}>Either role</SelectItem>
        <SelectItem value="PLAYER">Player</SelectItem>
        <SelectItem value="GAME_MASTER">Game Master</SelectItem>
      </SelectContent>
    </Select>
  );
}
