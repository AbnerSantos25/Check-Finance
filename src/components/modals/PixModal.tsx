import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Heart, Copy, Check, ShieldCheck } from 'lucide-react';
import { Dialog, DialogCloseButton, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog';
import { BrandMark } from '../ui/BrandMark';

interface PixModalProps {
  onClose: () => void;
}

export const PixModal: React.FC<PixModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  // Pix "copia e cola" (BR Code) payload — valor livre, chave aleatória
  const pixCode =
    '00020126580014BR.GOV.BCB.PIX013667578609-75ea-4a34-8a00-1c79720092145204000053039865802BR5921Abner da Silva Santos6009SAO PAULO621405101OVV3QqPly63047B41';

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Dialog id="pix-modal-content" onClose={onClose}>
      <DialogHeader
        mark={<BrandMark icon={Heart} />}
      >
        <DialogTitle>Apoie o Projeto via PIX</DialogTitle>
        <DialogDescription>Mantenha o Hub 100% gratuito e sem anúncios invasivos.</DialogDescription>
      </DialogHeader>

      {/* Informative text */}
      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300/90 leading-relaxed mb-5">
        Este site foi desenvolvido para ajudar qualquer brasileiro a planejar seu futuro financeiro com clareza e transparência. Qualquer contribuição ajuda a cobrir custos de hospedagem e desenvolvimento de novas calculadoras!
      </div>

      {/* Real Pix QR Code */}
      <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-bg-deep border border-line mb-5">
        <div className="relative p-3 bg-white rounded-xl shadow-inner mb-3">
          <QRCodeSVG value={pixCode} size={160} level="M" includeMargin={false} />
        </div>
        <span className="text-[12px] sm:text-[11px] font-mono text-slate-400">
          Aponte a câmera do seu banco
        </span>
      </div>

      {/* PIX Copia e Cola Copy Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300">
          Pix Copia e Cola:
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={pixCode}
            className="flex-1 min-w-0 px-3 py-2.5 bg-bg-deep border border-line rounded-xl text-xs font-mono text-slate-200 select-all focus:outline-none truncate"
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

      <DialogFooter className="mt-5 items-center justify-between text-[12px] sm:text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
          <ShieldCheck className="w-4 h-4" />
          Pagamento Direto & Seguro
        </span>
        <DialogCloseButton className="text-slate-400 hover:text-slate-200 cursor-pointer">
          Fechar
        </DialogCloseButton>
      </DialogFooter>
    </Dialog>
  );
};
