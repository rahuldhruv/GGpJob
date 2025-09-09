"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Application, Job } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";


export default function JobApplicationsPage() {
    const params = useParams();
    const id = params.id as string;
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
                                        <TableCell className="text-right">
                                             <Button variant="ghost" size="sm">
                                                <Download className="mr-2 h-4 w-4" />
                                                Resume
                                            </Button>
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
