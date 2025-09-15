
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import type { Application } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
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
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <Card>
                <CardHeader>
                    <CardTitle>My Applications</CardTitle>
                    <CardDescription>Here is a list of jobs you have applied for.</CardDescription>
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
                    ) : (
                        <p className="text-sm text-muted-foreground">You have not applied to any jobs yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
