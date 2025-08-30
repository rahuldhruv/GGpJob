"use client";

import { useState, useEffect, useCallback } from "react";
import type { Job, Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { ArrowRight, Search, LoaderCircle } from "lucide-react";
import { format } from 'date-fns';
import { Input } from "../ui/input";

export default function JobSeekerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const jobsUrl = searchTerm ? `/api/jobs?search=${encodeURIComponent(searchTerm)}` : '/api/jobs?limit=3';
      const jobsRes = await fetch(jobsUrl);
      const jobsData = await jobsRes.json();
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs?limit=3'),
          fetch('/api/applications?userId=user-1')
        ]);
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setApplications(Array.isArray(appsData) ? appsData : []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    if (!searchTerm) {
      fetchInitialData();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm) {
      fetchJobs();
    }
  }, [searchTerm, fetchJobs]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchQuery);
  };

  const getStatusBadge = (status: Application['status']) => {
    switch (status) {
      case 'In Review': return <Badge variant="secondary">In Review</Badge>;
      case 'Interview': return <Badge className="bg-blue-100 text-blue-800">Interview</Badge>;
      case 'Offered': return <Badge className="bg-green-100 text-green-800">Offered</Badge>;
      case 'Rejected': return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline">Applied</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Find your next job</CardTitle>
          <CardDescription>Search by title, company, or keywords.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="e.g. 'Software Engineer' or 'Google'"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={loading}>
              {loading && !searchTerm ? <LoaderCircle className="animate-spin mr-2"/> : <Search className="mr-2"/>}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{searchTerm ? `Search Results for "${searchTerm}"` : 'Featured Jobs'}</CardTitle>
        </CardHeader>
        <CardContent>
           {loading ? (
             <div>Loading...</div>
           ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <p>No jobs found.</p>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>My Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length > 0 ? (
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
          ) : (
             <p className="text-sm text-muted-foreground">You have not applied to any jobs yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
