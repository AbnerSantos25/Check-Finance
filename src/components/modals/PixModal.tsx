import React, { useState } from 'react';
import { X, Heart, Copy, Check, QrCode, ShieldCheck, Sparkles } from 'lucide-react';

interface PixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PixModal: React.FC<PixModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  // Example PIX key or transparent placeholder
  const pixKey = 'investimentoaolongoprazo@pix.hub.br';

  if (!isOpen) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div 
      id="pix-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        id="pix-modal-content"
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#141824] to-[#0f121a] border border-[#263044] p-6 sm:p-7 shadow-2xl text-white"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
            <Heart className="w-6 h-6 fill-emerald-500 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Apoie o Projeto via PIX
            </h3>
            <p className="text-xs text-slate-400">
              Mantenha o Hub 100% gratuito e sem anúncios invasivos.
            </p>
          </div>
        </div>

        {/* Informative text */}
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300/90 leading-relaxed mb-5">
          Este site foi desenvolvido para ajudar qualquer brasileiro a planejar seu futuro financeiro com clareza e transparência. Qualquer contribuição ajuda a cobrir custos de hospedagem e desenvolvimento de novas calculadoras!
        </div>

        {/* Simulated QR Code Box */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0a0d14] border border-[#1f2638] mb-5">
          <div className="relative p-3 bg-white rounded-xl shadow-inner mb-3">
            {/* SVG Visual QR Code */}
            <svg
              className="w-40 h-40 text-slate-900"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              {/* Corner markers */}
              <rect x="5" y="5" width="25" height="25" fill="#0b0d12" rx="3" />
              <rect x="9" y="9" width="17" height="17" fill="#ffffff" rx="1" />
              <rect x="13" y="13" width="9" height="9" fill="#0b0d12" />

              <rect x="70" y="5" width="25" height="25" fill="#0b0d12" rx="3" />
              <rect x="74" y="9" width="17" height="17" fill="#ffffff" rx="1" />
              <rect x="78" y="13" width="9" height="9" fill="#0b0d12" />

              <rect x="5" y="70" width="25" height="25" fill="#0b0d12" rx="3" />
              <rect x="9" y="74" width="17" height="17" fill="#ffffff" rx="1" />
              <rect x="13" y="78" width="9" height="9" fill="#0b0d12" />

              {/* Data matrix dots pattern */}
              <circle cx="40" cy="15" r="3" fill="#0b0d12" />
              <circle cx="50" cy="15" r="3" fill="#0b0d12" />
              <circle cx="60" cy="22" r="3" fill="#0b0d12" />
              <circle cx="45" cy="28" r="3" fill="#0b0d12" />
              <circle cx="55" cy="35" r="3" fill="#0b0d12" />
              
              <rect x="36" y="42" width="28" height="16" rx="2" fill="#059669" />
              <circle cx="50" cy="50" r="4" fill="#ffffff" />

              <circle cx="15" cy="45" r="3" fill="#0b0d12" />
              <circle cx="25" cy="50" r="3" fill="#0b0d12" />
              <circle cx="18" cy="58" r="3" fill="#0b0d12" />
              
              <circle cx="75" cy="45" r="3" fill="#0b0d12" />
              <circle cx="85" cy="52" r="3" fill="#0b0d12" />
              <circle cx="80" cy="60" r="3" fill="#0b0d12" />

              <circle cx="40" cy="75" r="3" fill="#0b0d12" />
              <circle cx="50" cy="80" r="3" fill="#0b0d12" />
              <circle cx="60" cy="72" r="3" fill="#0b0d12" />
              <circle cx="75" cy="80" r="3" fill="#0b0d12" />
              <circle cx="85" cy="85" r="3" fill="#0b0d12" />
            </svg>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Aponte a câmera do seu banco
          </span>
        </div>

        {/* PIX Key Copy Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Chave PIX (E-mail / Aleatória):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={pixKey}
              className="flex-1 px-3 py-2.5 bg-[#0a0d14] border border-[#242b3b] rounded-xl text-xs font-mono text-slate-200 select-all focus:outline-none"
            />
            <button
              id="copy-pix-btn"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-[#1c2230] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            Pagamento Direto & Seguro
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
