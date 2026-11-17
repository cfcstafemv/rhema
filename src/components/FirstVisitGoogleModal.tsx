import React, { useState } from 'react';
import { Cloud, ShieldCheck, AlertTriangle, Loader2, X } from 'lucide-react';
import type { User } from 'firebase/auth';
import { googleSignIn } from '../services/googleAuth';
import { findRhemaBackupFile } from '../services/googleDriveSync';

interface FirstVisitGoogleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthUpdated: (user: User | null, hasToken: boolean) => void;
  onOpenDriveSyncWithBackup: () => void;
  onOpenPrivacy: () => void;
}

export const FirstVisitGoogleModal: React.FC<FirstVisitGoogleModalProps> = ({
  isOpen,
  onClose,
  onAuthUpdated,
  onOpenDriveSyncWithBackup,
  onOpenPrivacy,
}) => {
  const [isBusy, setIsBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsBusy(true);
    setErrorMsg(null);
    try {
      const { user, accessToken } = await googleSignIn();
      onAuthUpdated(user, true);

      let hasBackup = false;
      try {
        const existingBackup = await findRhemaBackupFile(accessToken);
        hasBackup = Boolean(existingBackup);
      } catch {
        hasBackup = false;
      }

      onClose();
      if (hasBackup) {
        onOpenDriveSyncWithBackup();
      }
    } catch (err: any) {
      const msg =
        err?.code === 'auth/popup-closed-by-user'
          ? 'Se cerró la ventana de Google antes de completar el inicio de sesión.'
          : err?.message || 'No se pudo iniciar sesión con Google.';
      setErrorMsg(msg);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FBF9F5] dark:bg-[#141720] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/70 dark:bg-stone-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 p-1 shadow-xs shrink-0 flex items-center justify-center">
              <img
                src="/assets/aistudio/logoRHEMA_4329ba63.jpg"
                alt="Rhema"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                Bienvenido a Rhema
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Tu espacio personal de estudio bíblico y células
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 text-xs text-blue-950 dark:text-blue-200">
            <Cloud className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Conecta tu cuenta de Google para respaldar tus prédicas, células y Diario Devocional en tu propio <strong>Google Drive</strong> y acceder desde cualquier dispositivo.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl flex items-start gap-2 text-xs bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          <div className="flex flex-col items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isBusy}
              className="gsi-material-button w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 text-[#1F1F1F] border border-[#747775]/40 shadow-xs text-xs font-medium transition-all cursor-pointer disabled:opacity-60"
            >
              {isBusy ? (
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
              ) : (
                <span className="w-4.5 h-4.5 shrink-0">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="block w-full h-full"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                    <path fill="none" d="M0 0h48v48H0z" />
                  </svg>
                </span>
              )}
              <span>{isBusy ? 'Conectando con Google...' : 'Iniciar sesión con Google'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="w-full py-2 px-4 rounded-xl text-xs font-medium text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/70 transition-colors cursor-pointer"
            >
              Ahora no, continuar en este dispositivo
            </button>
          </div>

          <div className="pt-2 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-2 text-[11px] text-stone-500 dark:text-stone-400">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Sin cuenta también funciona 100% local</span>
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPrivacy();
              }}
              className="text-amber-700 dark:text-amber-400 hover:underline font-medium shrink-0 cursor-pointer"
            >
              Privacidad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
