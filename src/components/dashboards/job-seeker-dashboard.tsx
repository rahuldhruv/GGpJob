"use client";

import { useState, useEffect, useCallback } from "react";
import type { Job, Application } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { ArrowRight, Search, LoaderCircle, Filter, X } from "lucide-react";
import { format } from 'date-fns';
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function JobSeekerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allLocations, setAllLocations] = useState<string[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    posted: "all",
    location: "all",
    experience: "all",
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.posted !== 'all') params.append('posted', filters.posted);
      if (filters.location !== 'all') params.append('location', filters.location);
      if (filters.experience !== 'all') params.append('experience', filters.experience);
      if (!filters.search && !params.has('posted') && !params.has('location') && !params.has('experience')) {
        params.append('limit', '3');
      }

      const jobsUrl = `/api/jobs?${params.toString()}`;
      const jobsRes = await fetch(jobsUrl);
      const jobsData = await jobsRes.json();
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/applications?userId=user-1')
        ]);
        const jobsData = await jobsRes.json();
        const appsData = await appsRes.json();
        
        if (Array.isArray(jobsData)) {
          const uniqueLocations = Array.from(new Set(jobsData.map(j => j.location).filter(Boolean)));
          setAllLocations(uniqueLocations);
        }

        const initialJobsUrl = `/api/jobs?limit=3`;
        const initialJobsRes = await fetch(initialJobsUrl);
        const initialJobsData = await initialJobsRes.json();
        
        setJobs(Array.isArray(initialJobsData) ? initialJobsData : []);
        setApplications(Array.isArray(appsData) ? appsData : []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchQuery }));
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      search: "",
      posted: "all",
      location: "all",
      experience: "all",
    });
  }

  const hasActiveFilters = () => {
    return filters.search || filters.posted !== 'all' || filters.location !== 'all' || filters.experience !== 'all';
  }

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
          <CardDescription>Search by title, company, or keywords. Use filters to refine your search.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                placeholder="e.g. 'Software Engineer' or 'Google'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? <LoaderCircle className="animate-spin mr-2"/> : <Search className="mr-2"/>}
                Search
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4" />
                <span>Filters:</span>
              </div>
              <Select value={filters.posted} onValueChange={(value) => handleFilterChange('posted', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Date Posted" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="1">Last 24 hours</SelectItem>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="14">Last 14 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {allLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.experience} onValueChange={(value) => handleFilterChange('experience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Experience Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Entry Level">Entry Level</SelectItem>
                  <SelectItem value="Mid Level">Mid Level</SelectItem>
                  <SelectItem value="Senior Level">Senior Level</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters() && (
                 <Button variant="ghost" onClick={resetFilters} className="text-sm text-muted-foreground flex items-center justify-start lg:justify-center col-span-full lg:col-span-1">
                    <X className="mr-2 h-4 w-4"/>
                    Reset Filters
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{filters.search ? `Search Results for "${filters.search}"` : 'Featured Jobs'}</CardTitle>
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
            <p>No jobs found with the current criteria.</p>
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
