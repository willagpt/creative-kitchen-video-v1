const GOOGLE_API_KEY = 'AIzaSyD4F2MOxzzWTME1v_Z5iCOl1sFO7IlFzlE';
const DRIVE_FOLDER_ID = '1n3DeGn2r7owzCnqc2LlwWrgikLF-9sD7';

export function getThumbnailUrl(fileName: string): string {
  // Thumbnails are stored in .thumbnails/ folder as .jpg
  const thumbName = fileName.replace(/\.[^.]+$/, '.jpg');
  return `https://drive.google.com/thumbnail?id=${thumbName}&sz=w400`;
}

export function getDriveFileUrl(fileId: string): string {
  return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`;
}

export function getDriveStreamUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  thumbnailLink?: string;
}

export async function listDriveFiles(folderId: string = DRIVE_FOLDER_ID): Promise<DriveFile[]> {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${GOOGLE_API_KEY}&fields=files(id,name,mimeType,size,thumbnailLink)&pageSize=1000`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Drive API error: ${response.status}`);
  }
  const data = await response.json();
  return data.files || [];
}

export async function listDriveFolder(folderName: string, parentId: string = DRIVE_FOLDER_ID): Promise<string | null> {
  const url = `https://www.googleapis.com/drive/v3/files?q='${parentId}'+in+parents+and+name='${folderName}'+and+mimeType='application/vnd.google-apps.folder'&key=${GOOGLE_API_KEY}&fields=files(id,name)`;

  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  return data.files?.[0]?.id || null;
}

export async function getThumbnailFiles(): Promise<Map<string, string>> {
  const thumbFolderId = await listDriveFolder('.thumbnails');
  if (!thumbFolderId) return new Map();

  const files = await listDriveFiles(thumbFolderId);
  const map = new Map<string, string>();
  for (const file of files) {
    // Map "clip-name.jpg" -> file.id
    map.set(file.name, file.id);
  }
  return map;
}

export function driveThumbUrl(fileId: string): string {
  return `https://lh3.googleusercontent.com/d/${fileId}=w400`;
}

export { GOOGLE_API_KEY, DRIVE_FOLDER_ID };
