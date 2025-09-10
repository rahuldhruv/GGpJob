
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Application, Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download, User, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast";


export default function JobApplicationsPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobAndApplications = async () => {
            if (id) {
                setLoading(true);
                try {
                    const [jobRes, appsRes] = await Promise.all([
                        fetch(`/api/jobs/${id}`),
                        fetch(`/api/applications?jobId=${id}`)
                    ]);

                    if (jobRes.ok) {
                        const jobData = await jobRes.json();
                        setJob(jobData);
                    } else {
                        console.error("Failed to fetch job details");
                    }
                    
                    if (appsRes.ok) {
                        const appsData = await appsRes.json();
                        setApplications(Array.isArray(appsData) ? appsData : []);
                    } else {
                         console.error("Failed to fetch applications");
                    }

                } catch (error) {
                    console.error("Error fetching data", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchJobAndApplications();
    }, [id]);
    
     const getStatusBadge = (status: Application['statusName']) => {
        switch (status) {
            case 'Profile Viewed':
                return <Badge variant="secondary">In Review</Badge>;
            case 'Selected':
                return <Badge className="bg-blue-100 text-blue-800">Selected</Badge>;
            case 'Not Suitable': 
                return <Badge variant="destructive">Not Suitable</Badge>;
            default: return <Badge variant="outline">Applied</Badge>;
        }
    };
    
    const handleStatusChange = async (applicationId: string, statusId: number, statusName: string) => {
        try {
            const response = await fetch(`/api/applications/${applicationId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusId }),
            });
            if (!response.ok) {
                throw new Error('Failed to update status');
            }
            setApplications(prev => 
                prev.map(app => 
                    app.id === applicationId ? { ...app, statusId, statusName } : app
                )
            );
            toast({
                title: "Status Updated",
                description: `Applicant marked as ${statusName}.`,
            });
        } catch (error) {
             toast({
                title: "Error",
                description: "Failed to update status. Please try again.",
                variant: "destructive",
            });
            console.error(error);
        }
    }


    if (loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    if (!job) {
        return <div className="container mx-auto p-4">Job not found.</div>;
    }

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardHeader>
                    <CardTitle>Applications for {job.title}</CardTitle>
                    <CardDescription>
                       {applications.length} {applications.length === 1 ? 'applicant' : 'applicants'} found for this position.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {applications.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium flex items-center gap-3">
                                             <Avatar className="h-8 w-8">
                                                <AvatarFallback>{app.applicantName?.charAt(0)}</AvatarFallback>
                                             </Avatar>
                                             <div>
                                                <div>{app.applicantName}</div>
                                                <div className="text-xs text-muted-foreground">{app.applicantHeadline}</div>
                                             </div>
                                        </TableCell>
                                        <TableCell>{app.applicantEmail}</TableCell>
                                        <TableCell>{getStatusBadge(app.statusName)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/profile/${app.applicantId}`}>
                                                            <User className="mr-2 h-4 w-4" />
                                                            View Profile
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Resume
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(app.id, 4, 'Selected')}>
                                                        <CheckCircle className="mr-2 h-4 w-4 text-green-500"/>
                                                        Mark as Selected
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(app.id, 3, 'Not Suitable')} className="text-destructive">
                                                        <XCircle className="mr-2 h-4 w-4"/>
                                                        Mark as Not Suitable
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">No applications received yet for this job.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
