import PocketBase from 'pocketbase';

const url = import.meta.env.VITE_POCKETBASE_URL || 'https://automattus.pockethost.io/';
export const pb = new PocketBase(url);

// Helper: get public file URL from a PocketBase record
export function getFileUrl(collectionIdOrName: string, recordId: string, filename: string): string {
  return `${url}api/files/${collectionIdOrName}/${recordId}/${filename}`;
}
