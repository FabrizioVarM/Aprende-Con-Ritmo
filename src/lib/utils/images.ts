/**
 * @fileOverview Utilidades para el manejo de imágenes externas.
 * 
 * - getDirectImageUrl: Transforma enlaces de Google Drive en enlaces de acceso directo.
 */

/**
 * Transforma enlaces de Google Drive (compartir, vista previa, uc) en enlaces de servidor
 * de contenido directo para asegurar que Next.js pueda cargarlos en cualquier dispositivo.
 * 
 * @param url URL original de la imagen
 * @returns URL transformada o la original si no es de Drive
 */
export const getDirectImageUrl = (url: string | undefined | null): string => {
  if (!url || typeof url !== 'string') return url || '';
  
  // Limpiar espacios en blanco
  const cleanUrl = url.trim();

  // Detectar enlaces de Google Drive
  if (cleanUrl.includes('drive.google.com')) {
    let id = '';
    
    // Formato: /file/d/ID/view...
    if (cleanUrl.includes('/file/d/')) {
      id = cleanUrl.split('/d/')[1]?.split('/')[0];
    } 
    // Formato: ?id=ID o &id=ID
    else if (cleanUrl.includes('id=')) {
      id = cleanUrl.split('id=')[1]?.split('&')[0];
    }
    
    if (id) {
      // El formato lh3.googleusercontent.com/d/ID es el más fiable para hotlinking público
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
  }
  
  return cleanUrl;
};
