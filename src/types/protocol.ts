export type TandemTalesRole = "PLAYER" | "GAME_MASTER";

export type TurnType = "SUCCEED" | "FAIL" | "PROPOSE" | "PASS";

export interface WorldInfo {
  name: string;
  title: string;
  description: string;
}

export interface AgentInfo {
  name: string;
  title: string;
  description: string;
}

export interface AvailablePartner {
  agent: string;
  world: string;
}

export interface ConnectMessage {
  type: "Connect";
  version: string;
  worlds: WorldInfo[];
  agents: AgentInfo[];
  available: AvailablePartner[];
}

export interface ErrorMessage {
  type: "Error";
  message: string;
}

export interface Entity {
  type: "Entity";
  id: number;
  name: string;
  description: string;
  code: string;
}

export interface Constant {
  type: "Constant";
  value?: string | number | boolean | null;
}

export type Value = Entity | Constant;

export function isEntity(value: Value): value is Entity {
  return value.type === "Entity";
}

export interface Signature {
  name: string;
  arguments: Value[];
}

export interface Variable {
  type: "Variable";
  id: number;
  name: string;
  signature: Signature;
  encoding: string;
  description: string;
}

export interface Action {
  id: number;
  name: string;
  signature: Signature;
  consenting: Entity[];
  description: string;
  code: string;
}

export interface Ending {
  id: number;
  name: string;
  signature: Signature;
  description: string;
  code: string;
}

export interface Turn {
  role: TandemTalesRole;
  type: TurnType;
  action?: Action;
  description: string;
  code: string;
}

export interface Assignment {
  variable: Variable;
  value: Value;
  visible: boolean;
  description: string;
  code: string;
}

export interface WorldState {
  assignments: Assignment[];
  description: string;
  code: string;
}

export interface World {
  name: string;
  entities: Entity[];
  variables: Variable[];
  actions: Action[];
  endings: Ending[];
}

export interface StartMessage {
  type: "Start";
  role: TandemTalesRole;
  world: World;
}

export interface Status {
  role: TandemTalesRole;
  history: Turn[];
  state: WorldState;
  descriptions: Entity[];
  choices: Turn[];
  ending?: Ending | null;
}

export interface UpdateMessage {
  type: "Update";
  status: Status;
}

export interface StopMessage {
  type: "Stop";
  role?: TandemTalesRole;
  message: string;
  ending?: Ending | null;
}

export interface EndMessage {
  type: "End";
  session: string;
}

export type ServerMessage =
  | ConnectMessage
  | ErrorMessage
  | StartMessage
  | UpdateMessage
  | StopMessage
  | EndMessage;

export interface JoinMessage {
  type: "Join";
  name: string;
  password: string | null;
  world: string | null;
  role: TandemTalesRole | null;
  partner: string | null;
}

export interface ChoiceMessage {
  type: "Choice";
  index: number;
}

export interface ReportMessage {
  type: "Report";
  item: string;
  value: string;
  comment: string;
}

export function isServerMessage(value: unknown): value is ServerMessage {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (value as { type: unknown }).type === "string"
  );
}
