
"use client"

import { useAuth } from '@/lib/auth-store';
import AppLayout from '@/components/layout/AppLayout';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <AppLayout>
      {user.role === 'student' && <StudentDashboard />}
      {user.role === 'teacher' && <TeacherDashboard />}
      {user.role === 'admin' && <AdminDashboard />}
    </AppLayout>
  );
}
