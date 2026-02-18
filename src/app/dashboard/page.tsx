
"use client"

import { useAuth } from '@/lib/auth-store';
import AppLayout from '@/components/layout/AppLayout';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';

export default function DashboardPage() {
  const { user, firebaseUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Solo redirigir si NO estamos cargando y NO hay un usuario autenticado en Auth
    if (!loading && !firebaseUser) {
      router.push('/login');
    }
  }, [firebaseUser, loading, router]);

  // Mientras carga o si tenemos usuario Auth pero aún no carga el perfil, mostrar vacío
  if (loading || (firebaseUser && !user)) return null;

  // Si después de cargar no hay usuario (caso de seguridad), no renderizar nada
  if (!user) return null;

  return (
    <AppLayout>
      <Suspense fallback={null}>
        {user.role === 'student' && <StudentDashboard />}
        {user.role === 'teacher' && <TeacherDashboard />}
        {user.role === 'admin' && <AdminDashboard />}
      </Suspense>
    </AppLayout>
  );
}
