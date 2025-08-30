"use client";

import { useState, useEffect } from "react";
import type { Job, Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { format } from 'date-fns';

export default function JobSeekerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs?limit=3'),
          fetch('/api/applications')
        ]);
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();
        setJobs(jobsData);
        setApplications(appsData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'In Review': return <Badge variant="secondary">In Review</Badge>;
      case 'Interview': return <Badge className="bg-blue-100 text-blue-800">Interview</Badge>;
      case 'Offered': return <Badge className="bg-green-100 text-green-800">Offered</Badge>;
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">Applied</Badge>;
    }
  };

  if (loading) {
    return <div>Loading...</div>
  }


  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Featured Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Date Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.jobTitle}</TableCell>
                  <TableCell>{app.companyName}</TableCell>
                  <TableCell>{format(new Date(app.appliedAt), 'PPP')}</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Application <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
