import type { TandemTalesRole } from "@/types/protocol";

export interface SettableParam<T> {
  isSet: boolean;
  value: T;
}

export interface JoinSearchParams {
  id: string | undefined;
  study: string | undefined;
  name: string;
  passwordRequired: boolean;
  world: SettableParam<string>;
  role: SettableParam<TandemTalesRole | "">;
  partner: SettableParam<string>;
  questions: string;
}

const VALID_ROLES: ReadonlySet<string> = new Set(["PLAYER", "GAME_MASTER"]);

export function parseJoinSearchParams(
  searchParams: URLSearchParams,
): JoinSearchParams {
  const rawRole = searchParams.get("role") ?? "";

  return {
    id: searchParams.get("id") ?? undefined,
    study: searchParams.get("study") ?? undefined,
    name: searchParams.get("name") || "web",
    passwordRequired: searchParams.get("password") === "true",
    world: {
      isSet: searchParams.has("world"),
      value: searchParams.get("world") ?? "",
    },
    role: {
      isSet: searchParams.has("role"),
      value: VALID_ROLES.has(rawRole) ? (rawRole as TandemTalesRole) : "",
    },
    partner: {
      isSet: searchParams.has("partner"),
      value: searchParams.get("partner") ?? "",
    },
    questions: searchParams.get("questions") ?? "",
  };
}
