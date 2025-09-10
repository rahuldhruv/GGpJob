
"use client";

import { useState, useEffect } from "react";
import type { Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Users, User } from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";


export default function RecruiterDashboard() {
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const { toast } = useToast();

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/jobs?recruiterId=2&isReferral=false');
      const data = await res.json();
      setPostedJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch posted jobs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);
  
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      const response = await fetch(`/api/jobs/${jobToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      toast({ title: 'Success', description: 'Job deleted successfully.' });
      await fetchJobs();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete job.', variant: 'destructive' });
      console.error(error);
    } finally {
      setJobToDelete(null);
    }
  };


  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <AlertDialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting for &quot;{jobToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteJob}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>My Job Postings</CardTitle>
            <CardDescription>Manage your company's open positions.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/jobs/post">
                <PlusCircle className="mr-2 h-4 w-4" />
                Post a New Job
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date Posted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postedJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{format(new Date(job.postedAt), "PPP")}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      Open
                    </Badge>
                  </TableCell>
                  <TableCell>{job.applicantCount}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem asChild>
                            <Link href={`/jobs/${job.id}/applications`}>
                                <Users className="mr-2 h-4 w-4" />
                                View Applications
                            </Link>
                         </DropdownMenuItem>
                         <DropdownMenuItem asChild>
                           <Link href={`/jobs/edit/${job.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setJobToDelete(job)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
