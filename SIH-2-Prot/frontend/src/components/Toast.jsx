import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';

export const Toast = () => {
  const { toast } = useAuth();
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isAlert = toast.type === 'alert' || toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-short">
      <div className={`p-4 rounded-xl shadow-2xl backdrop-blur-xl border flex items-start gap-3 ${
        isAlert
          ? 'bg-rose-950/90 border-rose-500/50 text-rose-100 shadow-rose-950/50'
          : isWarning
          ? 'bg-amber-950/90 border-amber-500/50 text-amber-100 shadow-amber-950/50'
          : isSuccess
          ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-100 shadow-emerald-950/50'
          : 'bg-slate-900/90 border-cyan-500/50 text-cyan-100 shadow-cyan-950/50'
      }`}>
        <div className="mt-0.5 shrink-0">
          {isAlert && <AlertOctagon className="w-5 h-5 text-rose-400 animate-pulse" />}
          {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {!isAlert && !isWarning && !isSuccess && <Info className="w-5 h-5 text-cyan-400" />}
        </div>
        <div className="text-sm font-medium leading-relaxed pr-2">
          {toast.message}
        </div>
      </div>
    </div>
  );
};
