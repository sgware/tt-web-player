import { AlertTriangle } from "lucide-react";

import { PartnerSelect } from "@/components/connect/partner-select";
import { PasswordField } from "@/components/connect/password-field";
import { RoleSelect } from "@/components/connect/role-select";
import { WorldSelect } from "@/components/connect/world-select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getQuestionSet, QUESTION_SET_NAMES } from "@/config/questions";
import { isValidToken } from "@/lib/validation";
import type { ConnectMessage, TandemTalesRole } from "@/types/protocol";
import type { JoinSearchParams } from "@/types/join-params";

interface ConnectFormProps {
  params: JoinSearchParams;
  connectInfo: ConnectMessage | null;
  ready: boolean;
  password: string;
  onPasswordChange: (value: string) => void;
  world: string;
  onWorldChange: (value: string) => void;
  role: TandemTalesRole | "";
  onRoleChange: (value: TandemTalesRole | "") => void;
  partner: string;
  onPartnerChange: (value: string) => void;
  onSubmit: () => void;
}

/**
 * The interactive part of the Connect page. Only renders inputs for the
 * parameters that were left unset on the URL, per the requirements.
 */
export function ConnectForm({
  params,
  connectInfo,
  ready,
  password,
  onPasswordChange,
  world,
  onWorldChange,
  role,
  onRoleChange,
  partner,
  onPartnerChange,
  onSubmit,
}: ConnectFormProps) {
  const worldInvalid = params.world.isSet && !isValidToken(params.world.value);
  const partnerInvalid = params.partner.isSet && !isValidToken(params.partner.value);
  const nameInvalid = !isValidToken(params.name);

  const invalidParams = [
    worldInvalid && "world",
    partnerInvalid && "partner",
    nameInvalid && "name",
  ].filter(Boolean) as string[];

  // An unknown question set is an error rather than "no questions", so a
  // mistyped study link is caught before anyone plays without being asked.
  const questionsInvalid = params.questions !== "" && getQuestionSet(params.questions) === null;

  const passwordMissing = params.passwordRequired && password.trim() === "";
  const canSubmit = ready && invalidParams.length === 0 && !questionsInvalid && !passwordMissing;

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      {invalidParams.length > 0 && (
        <p className="text-destructive flex items-center gap-2 text-sm">
          <AlertTriangle className="size-4 shrink-0" />
          Invalid value for: {invalidParams.join(", ")}. Values may only contain letters, digits,
          and underscores (max 20 characters).
        </p>
      )}

      {questionsInvalid && (
        <p className="text-destructive flex items-center gap-2 text-sm">
          <AlertTriangle className="size-4 shrink-0" />
          Unknown in-game questions "{params.questions}". Known values:{" "}
          {QUESTION_SET_NAMES.join(", ")}.
        </p>
      )}

      {params.passwordRequired && (
        <PasswordField value={password} onChange={onPasswordChange} disabled={!ready} />
      )}

      {!params.world.isSet && (
        <div className="space-y-2">
          <Label>Story world</Label>
          <WorldSelect
            worlds={connectInfo?.worlds ?? []}
            value={world}
            onChange={onWorldChange}
            disabled={!ready}
          />
        </div>
      )}

      {!params.role.isSet && (
        <div className="space-y-2">
          <Label>Role</Label>
          <RoleSelect value={role} onChange={onRoleChange} disabled={!ready} />
        </div>
      )}

      {!params.partner.isSet && (
        <div className="space-y-2">
          <Label>Partner</Label>
          <PartnerSelect
            agents={connectInfo?.agents ?? []}
            available={connectInfo?.available ?? []}
            world={params.world.isSet ? params.world.value : world}
            value={partner}
            onChange={onPartnerChange}
            disabled={!ready}
          />
        </div>
      )}

      {/* Always shown, even when every setting was supplied via URL parameters. */}
      <p className="text-muted-foreground text-sm">
        You must be at least 18 years old to play. We record the choices you make and may release
        that data for research. We do not record your name or other personal information. Please
        read our{" "}
        <a href="/consent.html" className="text-foreground underline underline-offset-4">
          consent page
        </a>
        .
      </p>

      <Button type="submit" disabled={!canSubmit} className="w-full">
        Start Playing
      </Button>
    </form>
  );
}
