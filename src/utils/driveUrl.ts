/**
 * Convierte cualquier formato de URL de Google Drive
 * a un link directo de imagen que funciona en <img src="">
 *
 * Soporta:
 *   https://drive.google.com/file/d/FILE_ID/view?...
 *   https://drive.google.com/open?id=FILE_ID
 *   https://drive.google.com/uc?id=FILE_ID           ← ya está bien
 *   https://drive.google.com/uc?export=view&id=...   ← ya está bien
 */
export function convertDriveUrl(url: string): string {
  if (!url) return url;

  // Ya está en formato correcto
  if (url.includes('drive.google.com/uc')) return url;

  // Formato: /file/d/FILE_ID/...
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/uc?export=view&id=${fileMatch[1]}`;
  }

  // Formato: open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return `https://drive.google.com/uc?export=view&id=${openMatch[1]}`;
  }

  // No es Drive, devolver tal cual (puede ser una URL normal)
  return url;
}