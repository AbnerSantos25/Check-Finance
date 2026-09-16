import React, { useState } from 'react';
import { X, Sparkles, Bell, Check, ArrowRight } from 'lucide-react';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName: string;
  description: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  isOpen,
  onClose,
  toolName,
  description,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  if (!isOpen) return null;

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
        onClose();
      }, 2500);
    }
  };

  return (
    <div 
      id="coming-soon-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div 
        id="coming-soon-modal-content"
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#141824] to-[#0f121a] border border-[#263044] p-6 sm:p-7 shadow-2xl text-white"
      >
        <button
          onClick={onClose}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
              EM DESENVOLVIMENTO
            </span>
            <h3 className="text-base font-bold text-white mt-1">
              {toolName}
            </h3>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mt-3 mb-6 bg-[#090b10] p-3.5 rounded-xl border border-[#1f2638]">
          {description}
        </p>

        {/* Notification form */}
        <form onSubmit={handleNotify} className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            Deseja ser avisado no lançamento?
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-3.5 py-2.5 bg-[#0a0d14] border border-[#242b3b] focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Cadastrado!</span>
                </>
              ) : (
                <>
                  <span>Avisar-me</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            Sem spam. Apenas uma notificação quando a ferramenta for ao ar.
          </p>
        </form>

        <div className="mt-6 pt-4 border-t border-[#1c2230] flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            Entendido, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
