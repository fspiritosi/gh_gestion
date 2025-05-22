export function cleanPath(url: string): string {
  try {
    // Agregar logs para depuración

    // Si la URL está vacía, devolver dashboard
    if (!url || url === '') {
      return '/dashboard';
    }

    // Si solo tenemos una barra, devolver dashboard
    if (url === '/') {
      return '/dashboard';
    }

    // Si la URL ya tiene el formato correcto (empieza por /)
    if (url.startsWith('/dashboard')) {
      return url;
    }

    // Crear un objeto URL
    const urlObj = new URL(url);
    // Obtener solo el pathname (todo lo que viene después del dominio)
    const pathname = urlObj.pathname;

    // Si el pathname es vacío o /, devolver dashboard
    if (!pathname || pathname === '/' || pathname === '') {
      return '/dashboard';
    }

    return pathname;
  } catch (error) {
    // Si la URL no es válida o está vacía, registrar el error
    console.error('Error procesando URL en cleanPath:', error);
    console.error('URL problemática:', url);
    return '/dashboard';
  }
}
