
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/user-context";
import type { Application } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ApplicationFeedbackForm } from "@/components/application-feedback-form";

export default function FeedbackPage() {
    const { user, loading: userLoading } = useUser();
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

    const fetchApplications = async () => {
        if (user) {
            try {
                setLoading(true);
                const res = await fetch(`/api/applications?userId=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    const eligibleApps = (Array.isArray(data) ? data : []).filter(
                        (app: Application) => app.statusId === 3 || app.statusId === 4
                    );
                    setApplications(eligibleApps);
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
         if (!userLoading && user && user.role !== 'Job Seeker') {
            router.push('/');
        }
    }, [user, userLoading, router]);

    useEffect(() => {
        if (user) {
            fetchApplications();
        }
    }, [user]);

    const handleOpenFeedback = (app: Application) => {
        setSelectedApp(app);
        setIsFeedbackFormOpen(true);
    }
    
    if (userLoading || loading) {
        return <div className="container mx-auto p-4">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
             <Dialog open={isFeedbackFormOpen} onOpenChange={setIsFeedbackFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Leave Feedback</DialogTitle>
                        <DialogDescription>
                            Let us know about your experience applying for {selectedApp?.jobTitle} at {selectedApp?.companyName}.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedApp && (
                        <ApplicationFeedbackForm 
                            application={selectedApp} 
                            onSuccess={() => {
                                setIsFeedbackFormOpen(false);
                                fetchApplications();
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader>
                    <CardTitle>Application Feedback</CardTitle>
                    <CardDescription>Rate your experience for your past applications.</CardDescription>
                </CardHeader>
                <CardContent>
                    {applications.length > 0 ? (
                        <div className="space-y-4">
                            {applications.map((app) => (
                                <Card key={app.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4">
                                    <div className="mb-4 sm:mb-0">
                                        <h3 className="font-semibold">{app.jobTitle}</h3>
                                        <p className="text-sm text-muted-foreground">{app.companyName}</p>
                                        {app.statusId === 3 && <Badge variant="destructive" className="mt-1">Not Suitable</Badge>}
                                        {app.statusId === 4 && <Badge className="bg-blue-100 text-blue-800 mt-1">Selected</Badge>}
                                    </div>
                                    <div>
                                        { !app.rating && (
                                            <Button variant="outline" size="sm" onClick={() => handleOpenFeedback(app)}>
                                                Leave Feedback
                                            </Button>
                                        )}
                                        { app.rating && (
                                                <div className="flex items-center justify-end text-sm text-muted-foreground">
                                                <Star className="w-4 h-4 mr-1 text-yellow-400 fill-yellow-400" />
                                                Rated {app.rating}
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            You have no applications that are ready for feedback yet.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

