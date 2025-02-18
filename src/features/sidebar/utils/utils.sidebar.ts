export function cleanPath(url: string): string {
  try {
    // Crear un objeto URL
    const urlObj = new URL(url);
    // Obtener solo el pathname (todo lo que viene después del dominio)
    return urlObj.pathname;
  } catch {
    // Si la URL no es válida o está vacía, retornar string vacío
    return '';
  }
}
