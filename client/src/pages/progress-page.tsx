import React, { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { ThreeDCard } from '@/components/ui/3d-card';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, Clock, Calendar, CheckSquare, Timer, TrendingUp } from 'lucide-react';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { AnimatedText } from '@/components/ui/animated-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ProgressPage() {
  const { user } = useAuth();
  const [date] = useState(new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }));

  const [period, setPeriod] = useState('week');

  // Fetch weekly activity data
  const { data: weeklyActivity = [] } = useQuery({
    queryKey: ['/api/weekly-activity'],
    queryFn: async () => {
      const res = await fetch('/api/weekly-activity');
      if (!res.ok) throw new Error('Failed to fetch weekly activity');
      return res.json();
    }
  });

  // Mock data for weekly progress chart
  const weeklyData = [
    { name: 'Mon', study: 2.5, work: 1.0, health: 0.5, recreation: 0.3 },
    { name: 'Tue', study: 3.2, work: 2.0, health: 0.7, recreation: 0.5 },
    { name: 'Wed', study: 4.0, work: 1.5, health: 0.5, recreation: 0.3 },
    { name: 'Thu', study: 3.5, work: 2.5, health: 1.0, recreation: 0.2 },
    { name: 'Fri', study: 2.8, work: 1.8, health: 0.3, recreation: 1.0 },
    { name: 'Sat', study: 1.2, work: 0.0, health: 1.5, recreation: 2.0 },
    { name: 'Sun', study: 0.5, work: 0.0, health: 2.0, recreation: 1.5 }
  ];

  // Category distribution data
  const pieData = [
    { name: 'Study', value: 18, color: '#38b6ff' },
    { name: 'Work', value: 9, color: '#6e47d4' },
    { name: 'Health', value: 6, color: '#32d196' },
    { name: 'Recreation', value: 5, color: '#f45d96' }
  ];

  const summaryData = [
    { 
      title: 'Total Hours',
      icon: <Clock className="h-5 w-5" />,
      value: '38',
      description: 'Hours tracked this week',
      change: '+15%',
      color: '#6e47d4'
    },
    { 
      title: 'Productivity',
      icon: <TrendingUp className="h-5 w-5" />,
      value: '72%',
      description: 'Based on focus time',
      change: '+8%',
      color: '#38b6ff'
    },
    { 
      title: 'Completed Tasks',
      icon: <CheckSquare className="h-5 w-5" />,
      value: '18',
      description: 'Out of 25 tasks',
      change: '+4',
      color: '#32d196'
    }
  ];

  const timeDistribution = [
    { name: 'Morning', hours: 12, percentage: 32, color: '#f3ca4e' },
    { name: 'Afternoon', hours: 17, percentage: 45, color: '#38b6ff' },
    { name: 'Evening', hours: 7, percentage: 18, color: '#6e47d4' },
    { name: 'Night', hours: 2, percentage: 5, color: '#1e1e24' }
  ];

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-dark text-white">
      <Sidebar />
      
      <div className="flex-grow overflow-auto">
        <Header 
          title="Progress Insights" 
          date={date} 
          onNewGoal={() => {}} 
        />
        
        <main className="p-4 md:p-6">
          <section className="mb-8">
            <AnimatedText
              text="Your Progress Dashboard"
              className="text-3xl font-display font-bold mb-4"
              variant="gradient"
            />
            <p className="text-gray-400">
              Track your productivity trends and identify areas for improvement.
            </p>
          </section>
          
          <div className="flex justify-end mb-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 bg-dark-tertiary border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {summaryData.map((item, index) => (
              <ThreeDCard key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    {item.icon}
                  </div>
                  <h3 className="font-medium">{item.title}</h3>
                </div>
                <div className="flex items-center">
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="mr-4"
                  >
                    <div className="text-3xl font-bold" style={{ color: item.color }}>{item.value}</div>
                    <div className="text-sm text-gray-400">{item.description}</div>
                  </motion.div>
                  <div className="ml-auto">
                    <div className="text-sm text-green-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {item.change}
                    </div>
                  </div>
                </div>
              </ThreeDCard>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <ThreeDCard className="p-6 lg:col-span-2">
              <h3 className="text-xl font-display font-bold mb-6">Time Distribution by Category</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2d35" />
                    <XAxis dataKey="name" tick={{ fill: '#a0aec0' }} />
                    <YAxis tick={{ fill: '#a0aec0' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e1e24', 
                        borderColor: '#2d2d35', 
                        borderRadius: '8px' 
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="study" stackId="a" fill="#38b6ff" />
                    <Bar dataKey="work" stackId="a" fill="#6e47d4" />
                    <Bar dataKey="health" stackId="a" fill="#32d196" />
                    <Bar dataKey="recreation" stackId="a" fill="#f45d96" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ThreeDCard>
            
            <ThreeDCard className="p-6">
              <h3 className="text-xl font-display font-bold mb-6">Category Distribution</h3>
              <div className="h-80 flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="70%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e1e24', 
                        borderColor: '#2d2d35', 
                        borderRadius: '8px' 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4">
                  {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-sm">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ThreeDCard>
          </div>
          
          <ThreeDCard className="p-6 mb-8">
            <h3 className="text-xl font-display font-bold mb-6">Time of Day Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {timeDistribution.map((item, index) => (
                <motion.div 
                  key={index}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <ProgressCircle
                    value={item.percentage}
                    max={100}
                    size={100}
                    strokeWidth={8}
                    color={item.color}
                    label={
                      <span className="text-xl font-bold">{item.percentage}%</span>
                    }
                  />
                  <h4 className="mt-3 font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-400">{item.hours} hours</p>
                </motion.div>
              ))}
            </div>
          </ThreeDCard>
        </main>
      </div>
    </div>
  );
}
