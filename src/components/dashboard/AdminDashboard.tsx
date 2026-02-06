
"use client"

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Users, Music, DollarSign, TrendingUp, UserPlus, Settings } from 'lucide-react';

const enrollmentData = [
  { name: 'Ene', students: 400 },
  { name: 'Feb', students: 300 },
  { name: 'Mar', students: 600 },
  { name: 'Abr', students: 800 },
  { name: 'May', students: 700 },
  { name: 'Jun', students: 900 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline">Centro de Administración 🏢</h1>
          <p className="text-muted-foreground mt-1 text-lg">Resumen de las operaciones y crecimiento de la escuela.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl gap-2">
            <Settings className="w-4 h-4" /> Ajustes
          </Button>
          <Button className="bg-accent text-white rounded-xl gap-2">
            <UserPlus className="w-4 h-4" /> Agregar Usuario
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Estudiantes Totales</p>
                <h3 className="text-2xl font-black">1,284</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-2xl">
                <Music className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Profesores Totales</p>
                <h3 className="text-2xl font-black">42</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-2xl">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Ingresos Mensuales</p>
                <h3 className="text-2xl font-black">$42,500</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Retención</p>
                <h3 className="text-2xl font-black">92%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-md p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Tendencias de Inscripción</CardTitle>
          </CardHeader>
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888888', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f5f5f5'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="students" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="rounded-3xl border-none shadow-md overflow-hidden">
          <CardHeader className="border-b bg-white/50">
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { user: 'Juan Pérez', action: 'Nueva Inscripción', time: 'Hace 10m' },
              { user: 'Prof. García', action: 'Sílabo Actualizado', time: 'Hace 1h' },
              { user: 'Emma Lou', action: 'Clase Reprogramada', time: 'Hace 2h' },
              { user: 'Sistema', action: 'Facturas Enviadas', time: 'Hace 4h' },
              { user: 'Alex Doe', action: 'Profesor Incorporado', time: 'Hace 1d' },
            ].map((act, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
                <div className="w-2 h-2 rounded-full bg-accent" />
                <div className="flex-1">
                  <div className="text-sm font-bold">{act.action}</div>
                  <div className="text-xs text-muted-foreground">{act.user}</div>
                </div>
                <div className="text-xs text-muted-foreground italic">{act.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
