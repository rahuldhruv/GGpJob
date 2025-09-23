
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Users, FileSignature, BarChart3, Calendar as CalendarIcon, UserSearch, UserRound, UserCheck } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface ChartData {
  name: string;
  value: number;
}

interface AnalyticsData {
  totalJobSeekers: number;
  totalRecruiters: number;
  totalEmployees: number;
  totalJobs: number;
  totalApplications: number;
  jobsByDomain: ChartData[];
  usersByDomain: ChartData[];
  applicationsByDomain: ChartData[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {payload[0].name}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0].value}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


export default function AdminDashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    if (user && user.role !== 'Super Admin') {
      router.push('/admin/users');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (user?.role !== 'Super Admin') return;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (date?.from) params.append('from', date.from.toISOString());
        if (date?.to) params.append('to', date.to.toISOString());

        const res = await fetch(`/api/analytics?${params.toString()}`);
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user, date]);

  if (loading && !analytics) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
                <Card key={i}><CardHeader><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardHeader></Card>
            ))}
        </div>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            <Card>
                <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
            </Card>
        </div>
      </div>
    );
  }
  
  if (user?.role !== 'Super Admin') {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p>You do not have permission to view this page.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <BarChart3 className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
        <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
      </div>

      {loading ? (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                 {[...Array(5)].map((_, i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-6 w-24 mb-2" /><Skeleton className="h-8 w-16" /></CardHeader></Card>
                 ))}
            </div>
             <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                <Card>
                    <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                    <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                    <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                    <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
                </Card>
            </div>
        </div>
      ) : !analytics ? (
        <Card>
            <CardHeader><CardTitle>Error</CardTitle></CardHeader>
            <CardContent><p>Could not load analytics data.</p></CardContent>
        </Card>
      ) : (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Job Seekers</CardTitle>
                    <UserSearch className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalJobSeekers}</div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Recruiters</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalRecruiters}</div>
                </CardContent>
                </Card>
                 <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalEmployees}</div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Jobs Posted</CardTitle>
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalJobs}</div>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.totalApplications}</div>
                </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Jobs by Domain</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                        <Pie
                            data={analytics.jobsByDomain}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {analytics.jobsByDomain.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Users by Domain</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                        <Pie
                            data={analytics.usersByDomain}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {analytics.usersByDomain.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Applications by Domain</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                        <Pie
                            data={analytics.applicationsByDomain}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {analytics.applicationsByDomain.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </>
      )}
    </div>
  );
}
