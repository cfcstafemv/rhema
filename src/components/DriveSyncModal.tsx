import React, { useState, useEffect, useCallback } from 'react';
import {
  Cloud,
  CloudUpload,
  CloudDownload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  X,
  FileJson,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { SermonNote } from '../types';
import {
  googleSignIn,
  logoutGoogle,
  getAccessToken,
  clearCachedAccessToken,
} from '../services/googleAuth';
import {
  DRIVE_BACKUP_FILE_NAME,
  DriveFileMeta,
  DriveBackupPayload,
  DriveApiError,
  findRhemaBackupFile,
  downloadBackupFromDrive,
  uploadBackupToDrive,
  mergeSermonsLists,
} from '../services/googleDriveSync';
import { getAllSermons } from '../services/storage';

interface DriveSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleUser: User | null;
  hasAccessToken: boolean;
  onAuthUpdated: (user: User | null, hasToken: boolean) => void;
  localSermonsCount: number;
  activeSermonId: string;
  hasUnsavedChanges: boolean;
  onFlushLocalSave: () => void;
  onMergedFromDrive: (mergedSermons: SermonNote[], preferredActiveId?: string) => void;
  onOpenPrivacy?: () => void;
}

type PendingAction =
  | { type: 'upload' }
  | { type: 'merge' }
  | null;

export const DriveSyncModal: React.FC<DriveSyncModalProps> = ({
  isOpen,
  onClose,
  googleUser,
  hasAccessToken,
  onAuthUpdated,
  localSermonsCount,
  activeSermonId,
  hasUnsavedChanges,
  onFlushLocalSave,
  onMergedFromDrive,
  onOpenPrivacy,
}) => {
  const [isBusy, setIsBusy] = useState(false);
  const [isCheckingDrive, setIsCheckingDrive] = useState(false);
  const [driveFile, setDriveFile] = useState<DriveFileMeta | null>(null);
  const [drivePayload, setDrivePayload] = useState<DriveBackupPayload | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const inspectDriveBackup = useCallback(async (tokenOverride?: string) => {
    const token = tokenOverride || getAccessToken();
    if (!token) return;

    setIsCheckingDrive(true);
    setStatusMsg(null);
    try {
      const file = await findRhemaBackupFile(token);
      setDriveFile(file);
      if (file) {
        const payload = await downloadBackupFromDrive(token, file.id);
        setDrivePayload(payload);
      } else {
        setDrivePayload(null);
      }
    } catch (err: any) {
      if (err instanceof DriveApiError && err.status === 401) {
        clearCachedAccessToken();
        onAuthUpdated(googleUser, false);
      }
      setStatusMsg({
        type: 'error',
        text: err?.message || 'No se pudo consultar tu respaldo en Google Drive.',
      });
    } finally {
      setIsCheckingDrive(false);
    }
  }, [googleUser, onAuthUpdated]);

  useEffect(() => {
    if (!isOpen) {
      setPendingAction(null);
      setStatusMsg(null);
      return;
    }
    if (googleUser && hasAccessToken) {
      inspectDriveBackup();
    }
  }, [isOpen, googleUser, hasAccessToken, inspectDriveBackup]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsBusy(true);
    setStatusMsg(null);
    try {
      const { user, accessToken } = await googleSignIn();
      onAuthUpdated(user, true);
      await inspectDriveBackup(accessToken);
    } catch (err: any) {
      const msg =
        err?.code === 'auth/popup-closed-by-user'
          ? 'Se cerró la ventana de Google antes de completar el inicio de sesión.'
          : err?.message || 'No se pudo iniciar sesión con Google.';
      setStatusMsg({ type: 'error', text: msg });
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogout = async () => {
    setIsBusy(true);
    setStatusMsg(null);
    setPendingAction(null);
    try {
      await logoutGoogle();
      setDriveFile(null);
      setDrivePayload(null);
      onAuthUpdated(null, false);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err?.message || 'Error al cerrar sesión.' });
    } finally {
      setIsBusy(false);
    }
  };

  const executeConfirmedUpload = async () => {
    const token = getAccessToken();
    if (!token) {
      setStatusMsg({ type: 'error', text: 'Sesión de Drive expirada. Vuelve a conectar con Google.' });
      setPendingAction(null);
      return;
    }

    setIsBusy(true);
    setStatusMsg(null);
    try {
      if (hasUnsavedChanges) {
        onFlushLocalSave();
      }
      const allLocal = getAllSermons();
      const payload: DriveBackupPayload = {
        version: 1,
        updatedAt: Date.now(),
        activeSermonId,
        sermons: allLocal,
      };
      const uploaded = await uploadBackupToDrive(token, payload, driveFile?.id);
      setDriveFile(uploaded);
      setDrivePayload(payload);
      setPendingAction(null);
      setStatusMsg({
        type: 'success',
        text: `Respaldo guardado en Google Drive (${allLocal.length} estudios en "${DRIVE_BACKUP_FILE_NAME}").`,
      });
    } catch (err: any) {
      if (err instanceof DriveApiError && err.status === 401) {
        clearCachedAccessToken();
        onAuthUpdated(googleUser, false);
      }
      setStatusMsg({
        type: 'error',
        text: err?.message || 'No se pudo guardar el respaldo en Google Drive.',
      });
    } finally {
      setIsBusy(false);
    }
  };

  const executeConfirmedMerge = async () => {
    const token = getAccessToken();
    if (!token || !driveFile) {
      setStatusMsg({ type: 'error', text: 'No hay un archivo de respaldo disponible para descargar.' });
      setPendingAction(null);
      return;
    }

    setIsBusy(true);
    setStatusMsg(null);
    try {
      if (hasUnsavedChanges) {
        onFlushLocalSave();
      }
      const latestPayload = await downloadBackupFromDrive(token, driveFile.id);
      setDrivePayload(latestPayload);
      const localSermons = getAllSermons();
      const merged = mergeSermonsLists(localSermons, latestPayload.sermons);
      onMergedFromDrive(merged, latestPayload.activeSermonId);
      setPendingAction(null);
      setStatusMsg({
        type: 'success',
        text: `Sincronización completada: ahora tienes ${merged.length} estudios actualizados en este dispositivo.`,
      });
    } catch (err: any) {
      if (err instanceof DriveApiError && err.status === 401) {
        clearCachedAccessToken();
        onAuthUpdated(googleUser, false);
      }
      setStatusMsg({
        type: 'error',
        text: err?.message || 'No se pudo descargar el respaldo desde Google Drive.',
      });
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
        className="w-full max-w-lg bg-[#FBF9F5] dark:bg-[#141720] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white/70 dark:bg-stone-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-cinzel font-bold text-stone-900 dark:text-stone-100">
                Sincronización con Google Drive
              </h2>
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
                Guarda tus prédicas y Diario Devocional en tu propia nube personal
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

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Privacy assurance */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/80 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Rhema solo accede al archivo de respaldo que crea (<span className="font-mono font-semibold">{DRIVE_BACKUP_FILE_NAME}</span>). No lee otros documentos ni fotos de tu Google Drive.
            </p>
          </div>

          {/* Error / Success banner */}
          {statusMsg && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2 text-xs ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          {/* State 1: Not signed in OR signed in without in-memory Drive token */}
          {(!googleUser || !hasAccessToken) && (
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-center space-y-3">
              {googleUser && !hasAccessToken ? (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Sesión detectada: {googleUser.email}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Por seguridad, confirma tu acceso a Google Drive en esta pestaña para leer o guardar tu respaldo.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Conecta tu cuenta de Google
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Lleva tus {localSermonsCount} {localSermonsCount === 1 ? 'estudio local' : 'estudios locales'} de tu PC a tu tablet o celular.
                  </p>
                </div>
              )}

              <div className="flex flex-col items-center gap-2 pt-1">
                {/* Official Google Sign-In button style */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isBusy}
                  className="gsi-material-button inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-full bg-white hover:bg-stone-50 text-[#1F1F1F] border border-[#747775]/40 shadow-xs text-xs font-medium transition-all cursor-pointer disabled:opacity-60"
                >
                  <span className="w-4.5 h-4.5 shrink-0">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="block w-full h-full">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </span>
                  <span>
                    {isBusy
                      ? 'Conectando...'
                      : googleUser
                      ? 'Reconectar Google Drive'
                      : 'Sign in with Google'}
                  </span>
                </button>

                {googleUser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isBusy}
                    className="text-[11px] text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Cerrar sesión de {googleUser.email}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* State 2: Authenticated with valid Drive token */}
          {googleUser && hasAccessToken && (
            <div className="space-y-4">
              {/* Connected User Card */}
              <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {googleUser.photoURL ? (
                    <img
                      src={googleUser.photoURL}
                      alt={googleUser.displayName || 'Google User'}
                      className="w-9 h-9 rounded-full border border-stone-200 dark:border-stone-700 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {(googleUser.displayName || googleUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                      {googleUser.displayName || 'Cuenta Google'}
                    </p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                      {googleUser.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => inspectDriveBackup()}
                    disabled={isCheckingDrive || isBusy}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                    title="Actualizar estado de Drive"
                  >
                    <RefreshCw className={`w-4 h-4 ${isCheckingDrive ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isBusy}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:text-rose-600 hover:border-rose-200 dark:hover:border-rose-900 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Salir</span>
                  </button>
                </div>
              </div>

              {/* Drive vs Local comparison summary */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                    En este dispositivo
                  </span>
                  <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                    {localSermonsCount} {localSermonsCount === 1 ? 'estudio' : 'estudios'}
                  </div>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400">
                    {hasUnsavedChanges ? 'Hay cambios locales pendientes' : 'Todo guardado localmente'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                    En Google Drive
                  </span>
                  {isCheckingDrive ? (
                    <div className="flex items-center gap-1.5 text-stone-500 py-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Consultando...</span>
                    </div>
                  ) : driveFile && drivePayload ? (
                    <>
                      <div className="text-base font-bold text-stone-900 dark:text-stone-100">
                        {drivePayload.sermons.length}{' '}
                        {drivePayload.sermons.length === 1 ? 'estudio' : 'estudios'}
                      </div>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 truncate">
                        <FileJson className="w-3 h-3 shrink-0" />
                        {driveFile.modifiedTime
                          ? new Date(driveFile.modifiedTime).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Disponible'}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                        Sin respaldo aún
                      </div>
                      <span className="text-[11px] text-stone-500 dark:text-stone-400">
                        Sube tu primer respaldo
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Mandatory Confirmation Panel before modifying Drive or local data */}
              {pendingAction ? (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/35 border border-amber-300 dark:border-amber-800 space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-stone-800 dark:text-stone-200 space-y-1">
                      <p className="font-bold">
                        {pendingAction.type === 'upload'
                          ? driveFile
                            ? `¿Sobrescribir "${DRIVE_BACKUP_FILE_NAME}" en tu Google Drive?`
                            : `¿Crear el respaldo "${DRIVE_BACKUP_FILE_NAME}" en tu Google Drive?`
                          : `¿Combinar los estudios de Google Drive con este dispositivo?`}
                      </p>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-relaxed">
                        {pendingAction.type === 'upload'
                          ? driveFile
                            ? `Se reemplazará el contenido anterior en Drive (${drivePayload?.sermons.length || 0} estudios) con tus ${localSermonsCount} estudios actuales.`
                            : `Se guardarán tus ${localSermonsCount} estudios en un nuevo archivo dentro de tu Google Drive.`
                          : `Se descargarán los ${drivePayload?.sermons.length || 0} estudios de Drive y se combinarán con los ${localSermonsCount} locales, conservando la versión más reciente de cada estudio.`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => setPendingAction(null)}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 text-xs font-medium cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={
                        pendingAction.type === 'upload'
                          ? executeConfirmedUpload
                          : executeConfirmedMerge
                      }
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-60"
                    >
                      {isBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>
                        {pendingAction.type === 'upload'
                          ? 'Confirmar y subir'
                          : 'Confirmar y combinar'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={isBusy || isCheckingDrive}
                    onClick={() => setPendingAction({ type: 'upload' })}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <CloudUpload className="w-4 h-4 shrink-0" />
                    <span>Subir respaldo a Drive</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBusy || isCheckingDrive || !driveFile}
                    onClick={() => setPendingAction({ type: 'merge' })}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-100 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-45"
                  >
                    <CloudDownload className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>Traer y combinar de Drive</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {onOpenPrivacy && (
            <div className="pt-2 border-t border-stone-200/70 dark:border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span>Respaldo cifrado en tu propia cuenta</span>
              <button
                type="button"
                onClick={onOpenPrivacy}
                className="text-amber-700 dark:text-amber-400 hover:underline font-medium cursor-pointer"
              >
                Ver Política de Privacidad
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
