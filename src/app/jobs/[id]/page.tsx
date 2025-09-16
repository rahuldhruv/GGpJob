
import { notFound } from 'next/navigation';
import type { Job, Application, User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, MapPin, Building, Calendar, Users, FileText, BadgeDollarSign, Workflow, Clock, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ApplyButton } from './apply-button';
import JobCard from '@/components/job-card';
import { headers } from 'next/headers';
import { getDb } from '@/lib/db';
import { getServerSession } from '@/lib/auth'; // A helper to get user session on server

async function getJobData(id: string): Promise<{ job: Job | null; relatedJobs: Job[], userApplications: Application[], user: User | null }> {
    const headersList = headers();
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const host = headersList.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    const jobRes = await fetch(`${baseUrl}/api/jobs/${id}`, { cache: 'no-store' });
    if (!jobRes.ok) {
        if (jobRes.status === 404) return { job: null, relatedJobs: [], userApplications: [], user: null };
        throw new Error('Failed to fetch job data');
    }
    const job: Job = await jobRes.json();

    
    // This part is a placeholder for getting the logged-in user's data.
    // In a real app with auth, you would get this from the session.
    // For now, we'll assume a way to get the user and their applications.
    const session = await getServerSession();
    let userApplications: Application[] = [];
    if (session?.user?.id) {
       const db = await getDb();
       userApplications = await db.all('SELECT * FROM applications WHERE userId = ?', session.user.id);
    }

    const relatedJobsRes = await fetch(`${baseUrl}/api/jobs?domain=${job.domainId}&limit=10`, { cache: 'no-store' });
    let relatedJobs: Job[] = [];
    if (relatedJobsRes.ok) {
        const allRelated = await relatedJobsRes.json();
        const appliedJobIds = new Set(userApplications.map(app => app.jobId));
        relatedJobs = allRelated
            .filter((j: Job) => j.id !== job.id && !appliedJobIds.has(j.id))
            .slice(0, 3);
    }
    
    return { job, relatedJobs, userApplications, user: session?.user || null };
}

export default async function JobDetailsPage({ params }: { params: { id: string } }) {
    const { job, relatedJobs, userApplications, user } = await getJobData(params.id);

    if (!job) {
        notFound();
    }
    
    const detailItems = [
        { icon: MapPin, label: "Location", value: job.location },
        { icon: Briefcase, label: "Job Type", value: job.type },
        { icon: BadgeDollarSign, label: "Salary", value: job.salary },
        { icon: Workflow, label: "Domain", value: job.domain },
        { icon: UserCheck, label: "Role", value: job.role },
        { icon: Building, label: "Workplace", value: job.workplaceType },
        { icon: Users, label: "Experience", value: job.experienceLevel },
        { icon: Calendar, label: "Posted On", value: format(new Date(job.postedAt), "PPP") },
        { icon: Clock, label: "Vacancies", value: job.vacancies },
    ];

    const appliedJobIds = new Set(userApplications.map(app => app.jobId));

    return (
       <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl font-bold">{job.title}</CardTitle>
                                    <CardDescription className="text-xl text-muted-foreground">{job.companyName}</CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                     {job.isReferral && <Badge variant="secondary">Referral</Badge>}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {detailItems.map(item => item.value ? (
                                    <div key={item.label} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                        <item.icon className="h-5 w-5 mt-1 text-primary"/>
                                        <div>
                                            <p className="text-xs text-muted-foreground">{item.label}</p>
                                            <p className="font-semibold">{item.value}</p>
                                        </div>
                                    </div>
                                ) : null)}
                            </div>
                            
                            <h3 className="text-xl font-semibold mb-2 mt-6 flex items-center gap-2">
                                <FileText className="h-5 w-5"/>
                                Job Description
                            </h3>
                            <div className="prose prose-sm max-w-none text-muted-foreground">
                                {job.description.split('\\n').map((line, index) => (
                                    <p key={index}>{line}</p>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <ApplyButton job={job} userApplications={userApplications} />
                        </CardFooter>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle>About {job.companyName}</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground">
                            Contact for more info: <span className="font-semibold text-foreground">{job.contactEmail}</span>
                           </p>
                            {user?.role !== 'Job Seeker' && job.contactPhone && (
                                <p className="text-sm text-muted-foreground">
                                    Phone: <span className="font-semibold text-foreground">{job.contactPhone}</span>
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    {relatedJobs.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold mb-4">Related Jobs</h3>
                            <div className="space-y-4">
                                {relatedJobs.map(relatedJob => (
                                    <JobCard key={relatedJob.id} job={relatedJob} isApplied={appliedJobIds.has(relatedJob.id)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
       </div>
    );
}
