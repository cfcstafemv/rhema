import React from 'react';
import { ShieldCheck, Lock, HardDrive, Cloud, Mail, X } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-[#FBF9F5] dark:bg-[#141720] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/70 dark:bg-stone-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                Política de Privacidad — Rhema
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Tu estudio bíblico, tus tarjetas y tu Diario Devocional son 100% tuyos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
              <HardDrive className="w-4 h-4 text-amber-600 shrink-0" />
              <span>1. Almacenamiento local en tu dispositivo</span>
            </div>
            <p>
              Rhema puede utilizarse sin crear una cuenta. Todas tus prédicas, notas de célula, tarjetas visuales, resaltados y entradas del Diario Devocional se guardan primero en el almacenamiento local de tu propio navegador (<span className="font-mono text-[11px]">localStorage</span>). Ningún tercero ni administrador tiene acceso a esas notas locales.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
              <Cloud className="w-4 h-4 text-blue-600 shrink-0" />
              <span>2. Sincronización opcional con Google Drive</span>
            </div>
            <p>
              Si decides iniciar sesión con Google para sincronizar entre dispositivos, Rhema solicita únicamente el permiso mínimo necesario (<span className="font-mono text-[11px]">drive.file</span>) para crear y actualizar un archivo de respaldo propio llamado <span className="font-mono text-[11px]">rhema_estudios_respaldo.json</span> dentro de tu Google Drive personal.
            </p>
            <p>
              Rhema <strong>no lee, modifica ni elimina</strong> otros documentos, carpetas o archivos de tu Google Drive, y no almacena tus credenciales de Google en servidores externos.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
              <Lock className="w-4 h-4 text-pink-600 shrink-0" />
              <span>3. Diario Devocional, PDFs y no comercialización</span>
            </div>
            <p>
              Las guías PDF que cargas en Modo Célula se procesan directamente en tu dispositivo. Tus reflexiones y peticiones de oración del Diario Devocional son estrictamente privadas. Rhema no vende, alquila ni comparte datos de usuarios con terceros ni muestra publicidad.
            </p>
            <p>
              Puedes cerrar sesión o revocar el acceso a Google Drive en cualquier momento desde la configuración de tu cuenta de Google.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-100/80 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/70 flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                Contacto y soporte
              </span>
              <span className="text-stone-600 dark:text-stone-400">
                Si tienes dudas sobre privacidad o deseas reportar un problema técnico, puedes escribir a{' '}
                <a
                  href="mailto:appecrafter.stafe@gmail.com"
                  className="text-amber-700 dark:text-amber-400 font-medium hover:underline"
                >
                  appecrafter.stafe@gmail.com
                </a>
                .
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/70 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold cursor-pointer transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
