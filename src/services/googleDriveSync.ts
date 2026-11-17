import { SermonNote } from '../types';

export const DRIVE_BACKUP_FILE_NAME = 'rhema_estudios_respaldo.json';

export interface DriveFileMeta {
  id: string;
  name: string;
  modifiedTime?: string;
  size?: string;
}

export interface DriveBackupPayload {
  version: number;
  updatedAt: number;
  activeSermonId?: string;
  sermons: SermonNote[];
}

export class DriveApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'DriveApiError';
    this.status = status;
    this.code = code;
  }
}

async function parseDriveError(res: Response): Promise<DriveApiError> {
  let rawText = '';
  try {
    rawText = await res.text();
    const json = JSON.parse(rawText);
    const msg = json?.error?.message || res.statusText || 'Error de Google Drive';
    const reason = json?.error?.errors?.[0]?.reason;

    if (res.status === 401) {
      return new DriveApiError(
        'La sesión de Google Drive expiró. Vuelve a conectar con Google para continuar.',
        401,
        'UNAUTHENTICATED'
      );
    }
    if (res.status === 403 && (reason === 'accessNotConfigured' || msg.includes('has not been used in project'))) {
      return new DriveApiError(
        'La API de Google Drive aún no está habilitada en el proyecto de Google Cloud. Actívala en Google Cloud Console y vuelve a intentarlo.',
        403,
        'API_NOT_ENABLED'
      );
    }
    if (res.status === 403) {
      return new DriveApiError(
        'Faltan permisos para acceder a Google Drive. Reconecta tu cuenta aceptando el acceso a archivos de Rhema.',
        403,
        'PERMISSION_DENIED'
      );
    }
    return new DriveApiError(msg, res.status, reason);
  } catch {
    return new DriveApiError(rawText || res.statusText || 'Error de comunicación con Google Drive', res.status);
  }
}

export async function findRhemaBackupFile(accessToken: string): Promise<DriveFileMeta | null> {
  const query = encodeURIComponent(`name = '${DRIVE_BACKUP_FILE_NAME}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&spaces=drive&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime%20desc&pageSize=1`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw await parseDriveError(res);
  }

  const data = await res.json();
  const files = data.files as DriveFileMeta[] | undefined;
  return files && files.length > 0 ? files[0] : null;
}

export async function downloadBackupFromDrive(
  accessToken: string,
  fileId: string
): Promise<DriveBackupPayload> {
  const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw await parseDriveError(res);
  }

  const data = await res.json();
  if (!data || !Array.isArray(data.sermons)) {
    throw new Error('El archivo en Google Drive no tiene un formato de respaldo válido de Rhema.');
  }

  return {
    version: typeof data.version === 'number' ? data.version : 1,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
    activeSermonId: typeof data.activeSermonId === 'string' ? data.activeSermonId : undefined,
    sermons: data.sermons as SermonNote[],
  };
}

export async function uploadBackupToDrive(
  accessToken: string,
  payload: DriveBackupPayload,
  existingFileId?: string | null
): Promise<DriveFileMeta> {
  const boundary = 'rhema_drive_boundary_' + Date.now();
  const metadata = existingFileId
    ? { name: DRIVE_BACKUP_FILE_NAME, mimeType: 'application/json' }
    : { name: DRIVE_BACKUP_FILE_NAME, mimeType: 'application/json', description: 'Respaldo automático de estudios bíblicos de Rhema' };

  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(payload)}\r\n` +
    `--${boundary}--`;

  const endpoint = existingFileId
    ? `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existingFileId)}?uploadType=multipart&fields=id,name,modifiedTime,size`
    : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size`;

  const res = await fetch(endpoint, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    throw await parseDriveError(res);
  }

  return (await res.json()) as DriveFileMeta;
}

/**
 * Merges local and Drive sermon arrays by sermon ID, keeping the newest `updatedAt` version of each study.
 */
export function mergeSermonsLists(localSermons: SermonNote[], driveSermons: SermonNote[]): SermonNote[] {
  const map = new Map<string, SermonNote>();

  for (const s of driveSermons) {
    if (s && typeof s.id === 'string' && Array.isArray(s.cards)) {
      map.set(s.id, s);
    }
  }

  for (const s of localSermons) {
    if (!s || typeof s.id !== 'string' || !Array.isArray(s.cards)) continue;
    const existing = map.get(s.id);
    if (!existing || (s.updatedAt || 0) >= (existing.updatedAt || 0)) {
      map.set(s.id, s);
    }
  }

  return Array.from(map.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}
