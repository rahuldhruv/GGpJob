"use client";

import { useState, useEffect } from "react";
import type { Job, Application } from "@/lib/types";
import { jobs as allJobs, applications as allApplications } from "@/lib/data";
import { getRecommendationsAction } from "@/app/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import JobCard from "../job-card";
import { Button } from "../ui/button";
import { Sparkles, LoaderCircle, ArrowRight } from "lucide-react";
import { format } from 'date-fns';

export default function JobSeekerDashboard() {
  const [recommendations, setRecommendations] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initially load all jobs as a placeholder before recommendations are fetched
    setRecommendations(allJobs.slice(0, 3));
    setApplications(allApplications);
  }, []);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      // In a real app, profileSummary and searchHistory would be dynamic
      const result = await getRecommendationsAction({
        profileSummary: "Senior frontend developer with experience in React, TypeScript, and Next.js.",
        searchHistory: "searched for 'frontend engineer', 'react developer'",
      });
      const recommendedJobs = allJobs.filter(job => result.jobRecommendations.includes(job.title));
      setRecommendations(recommendedJobs.length ? recommendedJobs : allJobs.slice(0, 3)); // Fallback to initial jobs
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      // Fallback to initial jobs on error
      setRecommendations(allJobs.slice(0, 3));
    }
    setIsLoading(false);
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>Recommended For You</CardTitle>
          </div>
          <Button onClick={fetchRecommendations} disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((job) => (
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
                  <TableCell>{format(app.appliedAt, 'PPP')}</TableCell>
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
