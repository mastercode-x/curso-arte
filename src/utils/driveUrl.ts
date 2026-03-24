/**
 * Convierte URLs de Google Drive a formato embebible en <img src="">.
 *
 * Google cambió su comportamiento: drive.google.com/uc?export=view ya NO
 * devuelve la imagen directamente — redirige a una página de advertencia.
 *
 * La solución es usar la API de thumbnails de Drive, que sí devuelve
 * la imagen directamente sin redirects problemáticos:
 *   https://drive.google.com/thumbnail?id=FILE_ID&sz=w1200
 *
 * El parámetro sz controla el tamaño máximo (w1200 = máx 1200px de ancho).
 * Para imágenes de mayor resolución se puede usar sz=w2000.
 *
 * IMPORTANTE: el archivo en Drive debe estar compartido como
 * "Cualquier persona con el enlace puede ver" para que funcione.
 */
export function convertDriveUrl(url: string): string {
  if (!url) return url;

  // Si ya está en formato thumbnail, devolver tal cual
  if (url.includes('drive.google.com/thumbnail')) return url;

  // Formato: /file/d/FILE_ID/view?...
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w1200`;
  }

  // Formato antiguo uc?export=view&id=FILE_ID → convertir a thumbnail
  if (url.includes('drive.google.com/uc')) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1200`;
    }
  }

  // Formato: open?id=FILE_ID
  const openMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w1200`;
  }

  // No es Drive → devolver tal cual (URL normal de imagen)
  return url;
}

/**
 * Extrae el FILE_ID de cualquier URL de Drive.
 * Útil si necesitás construir URLs personalizadas.
 */
export function extractDriveFileId(url: string): string | null {
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  return null;
}