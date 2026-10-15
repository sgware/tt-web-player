import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { type ThemePreference, useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const LABEL: Record<ThemePreference, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

const ICON: Record<ThemePreference, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

/** Cycles the theme: system -> light -> dark -> system. */
export function ThemeToggle({ className }: { className?: string }) {
  const { preference, setPreference } = useTheme();
  const Icon = ICON[preference];
  const next = NEXT[preference];

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground", className)}
      onClick={() => setPreference(next)}
      aria-label={`${LABEL[preference]} (switch to ${LABEL[next].toLowerCase()})`}
      title={`${LABEL[preference]} — click for ${LABEL[next].toLowerCase()}`}
    >
      <Icon />
    </Button>
  );
}
