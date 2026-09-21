import React, { useState } from 'react';
import { Bell, Check, ArrowRight, CodeXml } from 'lucide-react';
import { Dialog, DialogFooter, DialogHeader, DialogIcon, DialogTitle } from '../ui/Dialog';

interface ComingSoonModalProps {
  onClose: () => void;
  toolName: string;
  description: string;
}

export const ComingSoonModal: React.FC<ComingSoonModalProps> = ({
  onClose,
  toolName,
  description,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

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
    <Dialog id="coming-soon-modal-content" onClose={onClose}>
      <DialogHeader
        mark={<DialogIcon icon={CodeXml} frameClass="bg-amber-500/15 border-amber-500/30 text-amber-400" />}
        className="mb-3"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
          EM DESENVOLVIMENTO
        </span>
        <DialogTitle className="text-base mt-1">{toolName}</DialogTitle>
      </DialogHeader>

      <p className="text-xs text-slate-300 leading-relaxed mt-3 mb-6 bg-bg-deep p-3.5 rounded-xl border border-line">
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
            className="flex-1 px-3.5 py-2.5 bg-bg-deep border border-line focus:border-emerald-500 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none"
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

      <DialogFooter>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          Entendido, fechar
        </button>
      </DialogFooter>
    </Dialog>
  );
};
