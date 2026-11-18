import React from 'react';
import { ShieldCheck, Lock, HardDrive, Cloud, Mail, X, Trash2, ExternalLink } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalonePage?: boolean;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  isStandalonePage = false,
}) => {
  if (!isOpen) return null;

  const contentSections = (
    <div className="space-y-4 text-xs sm:text-[13px] text-stone-700 dark:text-stone-300 leading-relaxed">
      <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
          <HardDrive className="w-4 h-4 text-amber-600 shrink-0" />
          <span>1. Datos almacenados localmente en tu dispositivo</span>
        </div>
        <p>
          Rhema puede utilizarse sin crear una cuenta ni iniciar sesión. Todas tus prédicas, notas de célula, tarjetas visuales, resaltados bíblicos y entradas del Diario Devocional se guardan primero en el almacenamiento local de tu propio navegador (<span className="font-mono text-[11px]">localStorage</span>). Las guías PDF cargadas en Modo Célula se procesan localmente en tu navegador sin subirse a servidores externos.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
          <Cloud className="w-4 h-4 text-blue-600 shrink-0" />
          <span>2. Cuenta de Google y Google Drive (opcional)</span>
        </div>
        <p>
          Si decides iniciar sesión con Google mediante Firebase Authentication, Rhema accede únicamente a tu nombre visible, correo electrónico y foto de perfil para identificar tu sesión en la interfaz.
        </p>
        <p>
          Para respaldar tus estudios en la nube, Rhema solicita exclusivamente el alcance mínimo necesario (<span className="font-mono text-[11px]">https://www.googleapis.com/auth/drive.file</span>) para crear, leer y actualizar su propio archivo de respaldo llamado <span className="font-mono text-[11px]">rhema_estudios_respaldo.json</span> dentro de tu Google Drive personal.
        </p>
        <p>
          Rhema <strong>no lee, lista, modifica ni elimina</strong> otros documentos, carpetas o archivos de tu Google Drive, y conserva el token de acceso únicamente en la memoria volátil de la sesión activa (nunca en <span className="font-mono text-[11px]">localStorage</span> ni servidores propios).
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>3. Uso Limitado de las API de Google (Limited Use)</span>
        </div>
        <p>
          El uso y la transferencia por parte de Rhema de cualquier información recibida de las API de Google cumplen estrictamente con la Política de Datos de Usuario de los Servicios de API de Google, incluidos los requisitos de <strong>Uso Limitado (Limited Use)</strong>. Rhema no vende, alquila ni comparte datos de usuarios con terceros, no muestra publicidad y no utiliza información de Google Drive para entrenar modelos de IA.
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
          <Lock className="w-4 h-4 text-pink-600 shrink-0" />
          <span>4. Privacidad del Diario Devocional</span>
        </div>
        <p>
          Tus reflexiones personales, aplicaciones prácticas y peticiones de oración del Diario Devocional permanecen privadas bajo tu control exclusivo (en tu dispositivo y, si activas la sincronización, dentro de tu propio respaldo en Google Drive).
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100">
          <Trash2 className="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0" />
          <span>5. Retención, eliminación y revocación de permisos</span>
        </div>
        <p>
          Puedes eliminar tus estudios locales desde la app o la configuración del navegador, borrar el archivo <span className="font-mono text-[11px]">rhema_estudios_respaldo.json</span> desde tu Google Drive, cerrar sesión en cualquier momento o revocar el acceso de Rhema desde los permisos de tu cuenta de Google (<span className="font-mono text-[11px]">myaccount.google.com/permissions</span>).
        </p>
      </div>

      <div className="p-3.5 rounded-xl bg-stone-100/80 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/70 flex items-start gap-2.5">
        <Mail className="w-4 h-4 text-stone-600 dark:text-stone-300 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-stone-900 dark:text-stone-100 block">
            6. Contacto y soporte
          </span>
          <span className="text-stone-600 dark:text-stone-400 block">
            Si tienes dudas sobre esta política de privacidad o deseas reportar un problema técnico, puedes escribir a{' '}
            <a
              href="mailto:appecrafter.stafe@gmail.com"
              className="text-amber-700 dark:text-amber-400 font-medium hover:underline"
            >
              appecrafter.stafe@gmail.com
            </a>
            .
          </span>
          <a
            href="/privacidad.html"
            className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium hover:underline pt-0.5"
          >
            <span>Abrir documento completo de Política de Privacidad</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );

  if (isStandalonePage) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-[#FBF9F5] dark:bg-[#0E1015] text-stone-900 dark:text-stone-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-cinzel font-bold text-stone-900 dark:text-stone-100">
                  Política de Privacidad — Rhema
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Tu estudio bíblico, tus tarjetas y tu Diario Devocional son 100% tuyos
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold cursor-pointer transition-colors"
            >
              Ir a la aplicación
            </button>
          </div>

          {contentSections}
        </div>
      </div>
    );
  }

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
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto">{contentSections}</div>

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
