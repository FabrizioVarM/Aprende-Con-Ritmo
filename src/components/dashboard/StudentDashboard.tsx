
"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, PlayCircle, Star, Clock, ChevronRight } from 'lucide-react';

export default function StudentDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground font-headline">Hola, Ana! 👋</h1>
          <p className="text-muted-foreground mt-1 text-lg">Ready for your next musical breakthrough?</p>
        </div>
        <Button className="bg-accent text-white rounded-full px-6">
          Schedule New Lesson
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-3xl border-none shadow-sm bg-secondary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-accent fill-accent" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85%</div>
            <p className="text-sm text-muted-foreground">Level 2 Guitar Master</p>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-none shadow-sm bg-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Next Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Today</div>
            <p className="text-sm text-muted-foreground">3:00 PM with Prof. Carlos</p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-sm bg-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Hours Practiced
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12.5</div>
            <p className="text-sm text-muted-foreground">Keep up the great work!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-3xl border-none shadow-md overflow-hidden">
          <CardHeader className="border-b bg-white/50">
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { date: 'Today, 3 PM', topic: 'Acoustic Rhythms', type: 'Guitar' },
              { date: 'Friday, 11 AM', topic: 'Theory Basics', type: 'General' },
              { date: 'Monday, 2 PM', topic: 'Scale Practice', type: 'Guitar' },
            ].map((lesson, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                <div className="flex gap-4 items-center">
                  <div className="bg-primary/50 p-2 rounded-xl">
                    <Calendar className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <div className="font-bold">{lesson.topic}</div>
                    <div className="text-xs text-muted-foreground">{lesson.date}</div>
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-full">{lesson.type}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-none shadow-md overflow-hidden">
          <CardHeader className="border-b bg-white/50">
            <CardTitle>Learning Resources</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {[
              { title: 'Intro to Chords', length: '15 min', type: 'Video' },
              { title: 'Practice Sheet #4', length: '2 pages', type: 'PDF' },
              { title: 'Minor Pentatonic', length: '12 min', type: 'Video' },
            ].map((resource, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b last:border-0">
                <div className="flex gap-4 items-center">
                  <div className="bg-accent/20 p-2 rounded-xl">
                    <PlayCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="font-bold">{resource.title}</div>
                    <div className="text-xs text-muted-foreground">{resource.length}</div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
