
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
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Users, Music, DollarSign, TrendingUp, UserPlus, Settings } from 'lucide-react';

const enrollmentData = [
  { name: 'Jan', students: 400 },
  { name: 'Feb', students: 300 },
  { name: 'Mar', students: 600 },
  { name: 'Apr', students: 800 },
  { name: 'May', students: 700 },
  { name: 'Jun', students: 900 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline">Administration Hub 🏢</h1>
          <p className="text-muted-foreground mt-1 text-lg">Overview of school operations and growth.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl gap-2">
            <Settings className="w-4 h-4" /> Settings
          </Button>
          <Button className="bg-accent text-white rounded-xl gap-2">
            <UserPlus className="w-4 h-4" /> Add User
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
                <p className="text-sm text-muted-foreground font-medium">Total Students</p>
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
                <p className="text-sm text-muted-foreground font-medium">Total Teachers</p>
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
                <p className="text-sm text-muted-foreground font-medium">Monthly Rev</p>
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
                <p className="text-sm text-muted-foreground font-medium">Retention</p>
                <h3 className="text-2xl font-black">92%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-md p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Enrollment Trends</CardTitle>
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
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { user: 'John Smith', action: 'New Enrollment', time: '10m ago' },
              { user: 'Prof. Garcia', action: 'Updated Syllabus', time: '1h ago' },
              { user: 'Emma Lou', action: 'Class Rescheduled', time: '2h ago' },
              { user: 'System', action: 'Invoices Sent', time: '4h ago' },
              { user: 'Alex Doe', action: 'Teacher Onboarded', time: '1d ago' },
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
