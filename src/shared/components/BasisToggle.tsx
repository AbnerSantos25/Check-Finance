import React from 'react';

/** Base dos valores: poder de compra de hoje (descontada a inflação) ou o que aparece no extrato. */
export type ValueBasis = 'real' | 'nominal';

export const BasisToggle: React.FC<{ basis: ValueBasis; onChange: (basis: ValueBasis) => void }> = ({
  basis,
  onChange,
}) => (
  <div role="group" aria-label="Base dos valores" className="flex items-center rounded-xl bg-bg-deep p-1 border border-line text-xs">
    {(
      [
        ['real', 'Valores de hoje'],
        ['nominal', 'Valores nominais'],
      ] as const
    ).map(([value, label]) => (
      <button
        key={value}
        type="button"
        aria-pressed={basis === value}
        onClick={() => onChange(value)}
        className={`tap-target px-2.5 py-1 rounded-lg transition-all ${
          basis === value ? 'bg-line-soft text-white font-medium' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);
