
"use client"

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-store';
import { Star, Award, TrendingUp, Music, CheckCircle2 } from 'lucide-react';

export default function ProgressPage() {
  const { user } = useAuth();

  const SKILLS = [
    { name: 'Rhythm Accuracy', level: 85, color: 'bg-accent' },
    { name: 'Note Reading', level: 60, color: 'bg-blue-500' },
    { name: 'Dynamics', level: 45, color: 'bg-orange-500' },
    { name: 'Technique', level: 72, color: 'bg-green-500' },
  ];

  const MILESTONES = [
    { title: 'Completed Level 1', date: 'Oct 2023', achieved: true },
    { title: 'First Performance', date: 'Dec 2023', achieved: true },
    { title: 'Major Scales Master', date: 'Jan 2024', achieved: true },
    { title: 'Level 2 Proficiency', date: 'Expected Apr 2024', achieved: false },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline">
            {user?.role === 'teacher' ? 'Student Progress Overview' : 'My Learning Journey 🚀'}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Visualizing musical growth and achievements.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-3xl border-none shadow-md overflow-hidden">
              <CardHeader className="bg-primary/20">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Skill Development
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {SKILLS.map((skill, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-lg">{skill.name}</span>
                      <span className="text-accent">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-3" indicatorClassName={skill.color} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="rounded-3xl border-none shadow-sm bg-secondary/20 p-6 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <Music className="w-8 h-8 text-secondary-foreground" />
                </div>
                <div>
                  <h4 className="font-bold text-xl">Current Level</h4>
                  <p className="text-muted-foreground">Guitar Enthusiast (Lv. 2)</p>
                </div>
              </Card>

              <Card className="rounded-3xl border-none shadow-sm bg-accent/10 p-6 flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                  <Award className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-xl">Achievement Points</h4>
                  <p className="text-muted-foreground">2,450 Rhythm Points</p>
                </div>
              </Card>
            </div>
          </div>

          <Card className="rounded-3xl border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {MILESTONES.map((m, i) => (
                <div key={i} className="flex gap-4 items-start group">
                  <div className={cn(
                    "mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                    m.achieved ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground"
                  )}>
                    {m.achieved ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                  </div>
                  <div>
                    <div className={cn("font-bold", !m.achieved && "text-muted-foreground")}>{m.title}</div>
                    <div className="text-sm text-muted-foreground">{m.date}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
