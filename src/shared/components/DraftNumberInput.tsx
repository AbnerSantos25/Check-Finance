import React, { useState } from 'react';

export type DraftNumberInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: number;
  onCommit: (value: number) => void;
};

// Keeps the typed text while editing, so a field can be cleared and retyped;
// only complete numbers are committed, and the sanitized value shows again on blur.
export const DraftNumberInput: React.FC<DraftNumberInputProps> = ({ value, onCommit, onBlur, ...rest }) => {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <input
      {...rest}
      type="number"
      value={draft ?? value}
      onChange={(e) => {
        const text = e.target.value;
        setDraft(text);
        if (text.trim() !== '' && Number.isFinite(Number(text))) onCommit(Number(text));
      }}
      onBlur={(e) => {
        setDraft(null);
        onBlur?.(e);
      }}
    />
  );
};
