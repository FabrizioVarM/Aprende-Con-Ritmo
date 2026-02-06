
"use client"

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function TeacherDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground font-headline">Prof. Carlos Dashboard 🎻</h1>
        <p className="text-muted-foreground mt-1 text-lg">You have 4 classes scheduled for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-blue-600">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">24</div>
            <p className="text-xs text-blue-400">+2 this month</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-none shadow-sm bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-green-600">Avg. Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">94%</div>
            <p className="text-xs text-green-400">Above school average</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-accent/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-accent">Materials Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">12</div>
            <p className="text-xs text-accent/70">Past 7 days</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-secondary-foreground">Class Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">120</div>
            <p className="text-xs text-secondary-foreground/60">This semester</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Student Progress Tracker</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              { name: 'Ana Garcia', level: 'Guitar 2', progress: 85 },
              { name: 'Liam Smith', level: 'Piano 1', progress: 45 },
              { name: 'Emma Wilson', level: 'Violin 3', progress: 72 },
              { name: 'Sophia Chen', level: 'Guitar 1', progress: 20 },
            ].map((student, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold">{student.name}</span>
                  <span className="text-muted-foreground">{student.level} - {student.progress}%</span>
                </div>
                <Progress value={student.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-md overflow-hidden">
          <CardHeader className="border-b bg-white/50">
            <CardTitle>Today&apos;s Classes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { time: '10:00 AM', student: 'Ana Garcia', mode: 'In-person' },
              { time: '11:30 AM', student: 'Liam Smith', mode: 'Online' },
              { time: '02:00 PM', student: 'Group Lesson', mode: 'Workshop' },
              { time: '04:00 PM', student: 'Emma Wilson', mode: 'In-person' },
            ].map((cls, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
                <div>
                  <div className="font-bold">{cls.time}</div>
                  <div className="text-sm text-muted-foreground">{cls.student}</div>
                </div>
                <Button variant="ghost" size="sm" className="text-accent font-bold">
                  Start
                </Button>
              </div>
            ))}
            <div className="p-4 bg-muted/30">
              <Button className="w-full bg-accent text-white rounded-xl">Manage Availability</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
