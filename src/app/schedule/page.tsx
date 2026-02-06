
"use client"

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Video, MapPin, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-store';

export default function SchedulePage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const CLASSES = [
    { time: '09:00 AM', title: 'Advanced Rhythms', teacher: 'Carlos V.', type: 'Online', duration: '60 min' },
    { time: '11:30 AM', title: 'Music Theory 101', teacher: 'Elena S.', type: 'In-person', duration: '45 min' },
    { time: '02:00 PM', title: 'Guitar Workshop', teacher: 'Carlos V.', type: 'In-person', duration: '90 min' },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground font-headline">Class Schedule 📅</h1>
            <p className="text-muted-foreground mt-1 text-lg">Manage your sessions and availability.</p>
          </div>
          <Button className="bg-accent text-white rounded-xl gap-2 h-12 px-6">
            <Plus className="w-5 h-5" /> Book Class
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="rounded-3xl border-none shadow-md overflow-hidden bg-white">
            <CardHeader className="bg-primary/20">
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full flex justify-center"
              />
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              Classes for {date?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            
            {CLASSES.map((cls, i) => (
              <Card key={i} className="rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-secondary/50 p-4 rounded-2xl text-center min-w-[100px]">
                    <Clock className="w-6 h-6 mx-auto mb-1 text-secondary-foreground" />
                    <span className="font-bold text-lg">{cls.time.split(' ')[0]}</span>
                    <span className="text-xs block opacity-70">{cls.time.split(' ')[1]}</span>
                  </div>
                  
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <h4 className="text-xl font-black">{cls.title}</h4>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium"><Users className="w-4 h-4" /> {cls.teacher}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {cls.duration}</span>
                      <span className="flex items-center gap-1">
                        {cls.type === 'Online' ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        {cls.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-primary">Reschedule</Button>
                    <Button className="bg-accent text-white rounded-xl">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
