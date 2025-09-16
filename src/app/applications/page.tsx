
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import type { Application } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, Calendar } from "lucide-react";
import { format } from 'date-fns';
import Link from "next/link";

export default function ApplicationsPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        if (user) {
            try {
                setLoading(true);
                const res = await fetch(`/api/applications?userId=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setApplications(Array.isArray(data) ? data : []);
                } else {
                    console.error("Failed to fetch applications");
                }
            } catch (error) {
                console.error("Error fetching applications", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!userLoading && !user) {
            router.push('/login');
        }
    }, [user, userLoading, router]);

    useEffect(() => {
        if (user) {
            fetchApplications();
        }
    }, [user]);

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
    
    if (userLoading || loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardHeader>
                    <CardTitle>My Applications</CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length > 0 ? (
                        <>
                            {/* Mobile View - Cards */}
                            <div className="md:hidden space-y-4">
                                {applications.map((app) => (
                                    <Card key={app.id} className="w-full">
                                        <CardHeader>
                                            <CardTitle className="text-base">{app.jobTitle}</CardTitle>
                                            <CardDescription className="flex items-center gap-2 pt-1">
                                                <Briefcase className="h-4 w-4" /> {app.companyName}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2">
                                                    <Calendar className="h-4 w-4"/> Date Applied
                                                </span>
                                                <span>{format(new Date(app.appliedAt), 'PPP')}</span>
                                            </div>
                                             <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Status</span>
                                                {getStatusBadge(app.statusName)}
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                             <Button asChild variant="secondary" size="sm" className="w-full">
                                                <Link href={`/jobs/${app.jobId}`}>
                                                    View Job <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                            
                            {/* Desktop View - Table */}
                            <div className="hidden md:block">
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
                                                <TableCell>{getStatusBadge(app.statusName)}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button asChild variant="ghost" size="sm">
                                                        <Link href={`/jobs/${app.jobId}`}>
                                                            View Job <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">You have not applied to any jobs yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
