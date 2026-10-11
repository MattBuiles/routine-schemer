import { redirect } from 'next/navigation';

// El tablero vive en la raíz; se conserva la ruta antigua para enlaces guardados.
export default function BoardPage() {
  redirect('/');
}
