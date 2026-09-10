import type { CSSProperties } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export type PinInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

/**
 * Thin wrapper around the already-installed shadcn InputOTP primitive,
 * fixed at 4 numeric digits (the item PIN length) and restyled to this
 * page's zinc/amber dark palette rather than the primitive's default
 * shadcn theme-token look. Resting colors are overridden via `className`;
 * the active-slot focus ring is driven by the primitive's own `ring-ring`
 * utility, so `--ring` is re-scoped to amber here via a local CSS variable
 * override rather than fighting the primitive's conditional class list.
 */
export function PinInput({ value, onChange, disabled, autoFocus }: PinInputProps) {
  return (
    <div style={{ "--ring": "38 92% 50%" } as CSSProperties}>
      <InputOTP
        maxLength={4}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        inputMode="numeric"
        pattern="^[0-9]*$"
      >
        <InputOTPGroup>
          {Array.from({ length: 4 }, (_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className="h-12 w-12 border-zinc-700 bg-zinc-950/60 text-base text-zinc-100 first:rounded-l-lg last:rounded-r-lg"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
