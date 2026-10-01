import { Badge } from "@/components/ui/badge";
import type { TandemTalesRole } from "@/types/protocol";

interface RoleBannerProps {
  role: TandemTalesRole;
}

export function RoleBanner({ role }: RoleBannerProps) {
  return (
    <Badge variant="secondary" className="text-xs">
      Playing as {role === "PLAYER" ? "Player" : "Game Master"}
    </Badge>
  );
}
