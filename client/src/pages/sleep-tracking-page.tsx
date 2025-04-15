import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Moon, Sun, Clock, TrendingUp, Activity } from "lucide-react";
import { format } from "date-fns";
import { SleepQualityData } from "@shared/schema";

export default function SleepTrackingPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [sleepData, setSleepData] = useState({
    startTime: "22:00",
    endTime: "06:30",
    quality: 7.5,
    deepSleepPercentage: 20,
    remSleepPercentage: 25,
    lightSleepPercentage: 55,
    disturbances: 2,
    notes: "",
    tags: ["weekday", "normal"],
  });

  const { data: sleepEntries, isLoading } = useQuery({
    queryKey: ["/api/sleep-entries"],
    queryFn: async () => {
      try {
        const res = await apiRequest("GET", "/api/sleep-entries");
        return await res.json();
      } catch (error) {
        // Return mock data while endpoint is being developed
        return mockSleepData;
      }
    },
  });

  const addSleepEntryMutation = useMutation({
    mutationFn: async (sleepEntry: any) => {
      const res = await apiRequest("POST", "/api/sleep-entries", sleepEntry);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sleep-entries"] });
      toast({
        title: "Sleep entry added",
        description: "Your sleep data has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding sleep entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [startHours, startMinutes] = sleepData.startTime.split(":").map(Number);
    const [endHours, endMinutes] = sleepData.endTime.split(":").map(Number);
    
    const startDate = new Date(selectedDate);
    startDate.setHours(startHours, startMinutes, 0);
    
    const endDate = new Date(selectedDate);
    // If end time is earlier than start time, it's the next day
    if (endHours < startHours || (endHours === startHours && endMinutes < startMinutes)) {
      endDate.setDate(endDate.getDate() + 1);
    }
    endDate.setHours(endHours, endMinutes, 0);
    
    // Calculate duration in minutes
    const duration = (endDate.getTime() - startDate.getTime()) / (60 * 1000);
    
    const sleepEntry = {
      date: selectedDate.toISOString(),
      startTimeIso: startDate.toISOString(), // renamed to avoid conflict
      endTimeIso: endDate.toISOString(), // renamed to avoid conflict
      duration,
      quality: sleepData.quality,
      deepSleepPercentage: sleepData.deepSleepPercentage,
      remSleepPercentage: sleepData.remSleepPercentage,
      lightSleepPercentage: sleepData.lightSleepPercentage,
      disturbances: sleepData.disturbances,
      notes: sleepData.notes,
      tags: sleepData.tags,
      bedTime: sleepData.startTime, // original time string
      wakeTime: sleepData.endTime // original time string
    };
    
    addSleepEntryMutation.mutate(sleepEntry);
  };

  const renderSleepQualityGauge = (quality: number) => {
    const percentage = (quality / 10) * 100;
    let color;
    
    if (quality < 4) color = 'var(--accent-pink)';
    else if (quality < 7) color = 'var(--accent-yellow)';
    else color = 'var(--accent-green)';
    
    return (
      <div className="w-full h-32 relative flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full flex items-center justify-center z-10 bg-background animate-pulse">
          <span className="text-3xl font-bold">{quality}</span>
        </div>
        <svg className="w-full h-full animate-float" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--dark-tertiary)"
            strokeWidth="10"
            strokeDasharray="282.7"
            strokeDashoffset="0"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray="282.7"
            strokeDashoffset={282.7 - (percentage * 282.7) / 100}
            className="progress-circle animate-glow"
            style={{transition: 'all 1s ease-in-out'}}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Moon className="text-primary h-8 w-8 animate-float" />
        </div>
      </div>
    );
  };

  const renderSleepDistribution = () => {
    const { deepSleepPercentage, remSleepPercentage, lightSleepPercentage } = sleepData;
    
    return (
      <div className="w-full h-12 rounded-md overflow-hidden bg-dark-tertiary flex animate-slide-in">
        <div 
          className="h-full bg-accent-blue animate-pulse" 
          style={{ width: `${deepSleepPercentage}%` }}
          title={`Deep sleep: ${deepSleepPercentage}%`}
        />
        <div 
          className="h-full bg-accent-purple" 
          style={{ width: `${remSleepPercentage}%` }}
          title={`REM sleep: ${remSleepPercentage}%`}
        />
        <div 
          className="h-full bg-accent-pink" 
          style={{ width: `${lightSleepPercentage}%` }}
          title={`Light sleep: ${lightSleepPercentage}%`}
        />
      </div>
    );
  };

  const renderSleepTrends = () => {
    if (!sleepEntries || sleepEntries.length === 0) return <p>No sleep data available</p>;
    
    const lastWeekEntries = sleepEntries.slice(0, 7);
    const maxDuration = Math.max(...lastWeekEntries.map((entry: any) => entry.duration));
    
    return (
      <div className="w-full h-60 flex items-end space-x-2 mt-4">
        {lastWeekEntries.map((entry: SleepQualityData, index: number) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="text-xs text-muted-foreground">{entry.date.split('T')[0].slice(-2)}</div>
            <div 
              className="w-full bg-gradient-to-t from-primary to-accent-blue rounded-t-md chart-bar animate-slide-up delay-100 glass-hover"
              style={{ 
                height: `${(entry.duration / maxDuration) * 100}%`,
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className="h-full w-full opacity-0 hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                <span className="text-xs font-medium">{Math.round(entry.duration / 60)}h {Math.round(entry.duration % 60)}m</span>
                <span className="text-xs">Quality: {entry.quality}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container py-10 animate-fade-in">
      <h1 className="text-4xl font-bold text-gradient mb-6">Sleep Tracking</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 card-3d-deep">
          <CardHeader>
            <CardTitle className="text-gradient-rainbow">Track Your Sleep</CardTitle>
            <CardDescription>Log your sleep duration and quality to track your patterns over time</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <Label htmlFor="date" className="text-shadow-glow">Date</Label>
                  <div className="mt-2 glass p-2 rounded-md">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md"
                    />
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <Label htmlFor="startTime" className="flex items-center gap-1">
                      <Moon size={16} className="text-accent-blue animate-float-x" />
                      <span>Bedtime</span>
                    </Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={sleepData.startTime}
                      onChange={(e) => setSleepData({ ...sleepData, startTime: e.target.value })}
                      className="mt-1 btn-glow"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="endTime" className="flex items-center gap-1">
                      <Sun size={16} className="text-accent-yellow animate-pulse" />
                      <span>Wake Time</span>
                    </Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={sleepData.endTime}
                      onChange={(e) => setSleepData({ ...sleepData, endTime: e.target.value })}
                      className="mt-1 btn-glow"
                    />
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-1">
                      <Activity size={16} className="text-accent-green" />
                      <span>Sleep Quality (1-10)</span>
                    </Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Slider
                        value={[sleepData.quality]}
                        min={1}
                        max={10}
                        step={0.5}
                        onValueChange={(value) => setSleepData({ ...sleepData, quality: value[0] })}
                        className="progress-rainbow"
                      />
                      <span className="text-xl font-bold min-w-[2.5rem] text-center">{sleepData.quality}</span>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full btn-gradient mt-6" disabled={addSleepEntryMutation.isPending}>
                    {addSleepEntryMutation.isPending ? "Saving..." : "Save Sleep Data"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="card-3d h-full">
          <CardHeader>
            <CardTitle className="text-gradient">Sleep Stats</CardTitle>
            <CardDescription>Your current sleep quality and patterns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-medium text-center">Sleep Quality</h3>
              {renderSleepQualityGauge(sleepData.quality)}
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Sleep Stages</h3>
              {renderSleepDistribution()}
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <div className="flex items-center"><div className="w-2 h-2 bg-accent-blue rounded-full mr-1"></div> Deep ({sleepData.deepSleepPercentage}%)</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-accent-purple rounded-full mr-1"></div> REM ({sleepData.remSleepPercentage}%)</div>
                <div className="flex items-center"><div className="w-2 h-2 bg-accent-pink rounded-full mr-1"></div> Light ({sleepData.lightSleepPercentage}%)</div>
              </div>
            </div>
            
            <div className="pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Insights</h3>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-sm space-y-2">
                <p className="glass p-2 rounded-md animate-slide-in">Optimal sleep time: 7-9 hours</p>
                <p className="glass p-2 rounded-md animate-slide-in delay-100">Your average: 7.5 hours</p>
                <p className="glass p-2 rounded-md animate-slide-in delay-200">Sleep debt: +0.5 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue="trends">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="trends" className="btn-neon">Sleep Trends</TabsTrigger>
            <TabsTrigger value="analysis" className="btn-neon">Analysis</TabsTrigger>
            <TabsTrigger value="recommendations" className="btn-neon">Recommendations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends">
            <Card className="card-3d">
              <CardHeader>
                <CardTitle className="text-gradient">Weekly Sleep Trends</CardTitle>
                <CardDescription>Your sleep patterns over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-60 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent"></div>
                  </div>
                ) : (
                  renderSleepTrends()
                )}
                
                <div className="flex justify-between mt-8">
                  <Button variant="outline" className="btn-glow">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Previous Week
                  </Button>
                  <Button variant="outline" className="btn-glow">
                    Next Week <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis">
            <Card className="card-3d">
              <CardHeader>
                <CardTitle className="text-gradient">Sleep Analysis</CardTitle>
                <CardDescription>Insights based on your sleep data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="glass p-4 rounded-md animate-slide-in">
                    <h3 className="font-medium flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-accent-green animate-pulse" />
                      Your Sleep Score
                    </h3>
                    <p className="mt-2 text-muted-foreground">Your overall sleep health score is 82/100, which is considered excellent. Continue with your current sleep habits.</p>
                  </div>
                  
                  <div className="glass p-4 rounded-md animate-slide-in delay-100">
                    <h3 className="font-medium">Sleep Consistency</h3>
                    <p className="mt-2 text-muted-foreground">Your sleep schedule variance is less than 30 minutes on weekdays, which is excellent for circadian rhythm. Your weekend schedule differs by 1.5 hours.</p>
                  </div>
                  
                  <div className="glass p-4 rounded-md animate-slide-in delay-200">
                    <h3 className="font-medium">Deep Sleep Analysis</h3>
                    <p className="mt-2 text-muted-foreground">Your deep sleep percentage (20%) is within the optimal range of 15-25% for your age group. Deep sleep is crucial for physical recovery and memory consolidation.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <Card className="card-3d">
              <CardHeader>
                <CardTitle className="text-gradient">Sleep Recommendations</CardTitle>
                <CardDescription>Personalized tips to improve your sleep quality</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative pl-6 glass p-4 rounded-md animate-slide-in">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-green rounded-l-md"></div>
                    <h3 className="font-medium">Maintain Consistent Schedule</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Aim to go to bed and wake up at the same time every day, including weekends.</p>
                  </div>
                  
                  <div className="relative pl-6 glass p-4 rounded-md animate-slide-in delay-100">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-blue rounded-l-md"></div>
                    <h3 className="font-medium">Digital Sunset</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Reduce blue light exposure 1-2 hours before bedtime by using night mode on devices or wearing blue light blocking glasses.</p>
                  </div>
                  
                  <div className="relative pl-6 glass p-4 rounded-md animate-slide-in delay-200">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-purple rounded-l-md"></div>
                    <h3 className="font-medium">Optimize Sleep Environment</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Keep your bedroom cool (65-68°F/18-20°C), dark, and quiet. Consider using a white noise machine if needed.</p>
                  </div>
                  
                  <div className="relative pl-6 glass p-4 rounded-md animate-slide-in delay-300">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-pink rounded-l-md"></div>
                    <h3 className="font-medium">Relaxation Techniques</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Try deep breathing, progressive muscle relaxation, or meditation before bed to calm your mind and prepare for sleep.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Mock data for development until API is ready
const mockSleepData = [
  {
    id: 1,
    date: new Date(Date.now() - 86400000 * 6).toISOString(),
    quality: 7.5,
    duration: 420, // 7 hours in minutes
    deepSleepPercentage: 18,
    remSleepPercentage: 22,
    lightSleepPercentage: 60,
    disturbances: 3
  },
  {
    id: 2,
    date: new Date(Date.now() - 86400000 * 5).toISOString(),
    quality: 8.0,
    duration: 450, // 7.5 hours in minutes
    deepSleepPercentage: 20,
    remSleepPercentage: 25,
    lightSleepPercentage: 55,
    disturbances: 1
  },
  {
    id: 3,
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    quality: 6.5,
    duration: 390, // 6.5 hours in minutes
    deepSleepPercentage: 15,
    remSleepPercentage: 20,
    lightSleepPercentage: 65,
    disturbances: 4
  },
  {
    id: 4,
    date: new Date(Date.now() - 86400000 * 3).toISOString(),
    quality: 7.0,
    duration: 420, // 7 hours in minutes
    deepSleepPercentage: 18,
    remSleepPercentage: 22,
    lightSleepPercentage: 60,
    disturbances: 2
  },
  {
    id: 5,
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    quality: 8.5,
    duration: 480, // 8 hours in minutes
    deepSleepPercentage: 22,
    remSleepPercentage: 26,
    lightSleepPercentage: 52,
    disturbances: 1
  },
  {
    id: 6,
    date: new Date(Date.now() - 86400000).toISOString(),
    quality: 7.5,
    duration: 450, // 7.5 hours in minutes
    deepSleepPercentage: 19,
    remSleepPercentage: 24,
    lightSleepPercentage: 57,
    disturbances: 2
  },
  {
    id: 7,
    date: new Date().toISOString(),
    quality: 8.0,
    duration: 450, // 7.5 hours in minutes
    deepSleepPercentage: 20,
    remSleepPercentage: 25,
    lightSleepPercentage: 55,
    disturbances: 2
  }
];