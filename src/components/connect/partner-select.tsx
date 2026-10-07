import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AgentInfo, AvailablePartner } from "@/types/protocol";

const ANY_PARTNER_VALUE = "__any_partner__";

interface PartnerSelectProps {
  agents: AgentInfo[];
  available: AvailablePartner[];
  /** The currently effective world filter (empty string means "any world"). */
  world: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Reusable dropdown for choosing which waiting agent to play with. Only
 * agents currently available for the selected world are shown, per the
 * requirements ("Any partner" is always the default option). Each agent is
 */
export function PartnerSelect({
  agents,
  available,
  world,
  value,
  onChange,
  disabled,
}: PartnerSelectProps) {
  const agentsByName = new Map(agents.map((agent) => [agent.name, agent]));
  const candidates = available.filter((entry) => world === "" || entry.world === world);
  const uniqueAgentNames = [...new Set(candidates.map((entry) => entry.agent))];

  return (
    <Select
      value={value === "" ? ANY_PARTNER_VALUE : value}
      onValueChange={(next) => onChange(next === ANY_PARTNER_VALUE ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger className="w-full" aria-label="Partner">
        <SelectValue placeholder="Any partner" />
      </SelectTrigger>
      <SelectContent position="popper" className="w-(--radix-select-trigger-width)">
        <SelectItem value={ANY_PARTNER_VALUE}>Any partner</SelectItem>
        {uniqueAgentNames.map((name) => {
          const agent = agentsByName.get(name);
          return (
            <SelectItem key={name} value={name} description={agent?.description}>
              {agent?.title ?? name}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
