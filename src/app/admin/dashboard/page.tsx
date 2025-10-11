
"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Users, FileSignature, BarChart3, Calendar as CalendarIcon, UserSearch, UserRound, UserCheck, ThumbsUp } from "lucide-react";
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
import { AnimatedCounter } from "@/components/animated-counter";

interface ChartData {
  name: string;
  value: number;
}

interface AnalyticsData {
  totalJobSeekers: number;
  totalRecruiters: number;
  totalEmployees: number;
  totalDirectJobs: number;
  totalReferralJobs: number;
  totalApplications: number;
  directJobsByDomain: ChartData[];
  referralJobsByDomain: ChartData[];
  usersByDomain: ChartData[];
  applicationsByDomain: ChartData[];
  applicationsByStatus: ChartData[];
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

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
      {value}
    </text>
  );
};

const renderLegend = (props: any) => {
  const { payload } = props;

  return (
    <ul className="grid grid-cols-2 gap-2 text-sm mt-4">
      {
        payload.map((entry: any, index: number) => (
          <li key={`item-${index}`} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span>{entry.value}</span>
          </li>
        ))
      }
    </ul>
  );
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

  const isAdminOrSuperAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';

  useEffect(() => {
    if (user && !isAdminOrSuperAdmin) {
      router.push('/'); // Redirect non-admins
    }
  }, [user, router, isAdminOrSuperAdmin]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!isAdminOrSuperAdmin) return;

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
  }, [user, date, isAdminOrSuperAdmin]);

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
  
  if (!isAdminOrSuperAdmin) {
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
                    <AnimatedCounter value={analytics.totalJobSeekers} className="text-2xl font-bold" />
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Recruiters</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <AnimatedCounter value={analytics.totalRecruiters} className="text-2xl font-bold" />
                </CardContent>
                </Card>
                 <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <AnimatedCounter value={analytics.totalEmployees} className="text-2xl font-bold" />
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                    <FileSignature className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <AnimatedCounter value={analytics.totalApplications} className="text-2xl font-bold" />
                </CardContent>
                </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Direct Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <AnimatedCounter value={analytics.totalDirectJobs} className="text-2xl font-bold" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Referral Jobs</CardTitle>
                        <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <AnimatedCounter value={analytics.totalReferralJobs} className="text-2xl font-bold" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Direct Jobs by Domain</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                        <Pie
                            data={analytics.directJobsByDomain}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {analytics.directJobsByDomain.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
                        </PieChart>
                    </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Referral Jobs by Domain</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                        <Pie
                            data={analytics.referralJobsByDomain}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {analytics.referralJobsByDomain.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
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
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {analytics.usersByDomain.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
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
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {analytics.applicationsByDomain.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
                        </PieChart>
                    </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Applications by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                        <Pie
                            data={analytics.applicationsByStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                        >
                            {analytics.applicationsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={renderLegend} />
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
