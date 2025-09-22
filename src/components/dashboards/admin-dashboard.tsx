
"use client";

import { useState, useEffect, useMemo } from "react";
import type { Job, User, Domain, PortalFeedback } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { UserCog, Briefcase, PlusCircle, Edit, Trash2, MoreHorizontal, Layers, ShieldCheck, Star, Building } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "../ui/avatar";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { DomainForm } from "../domain-form";
import { AdminCreationForm } from "../admin-creation-form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

type ActiveView = 'users' | 'jobs' | 'domains' | 'portal-feedback';

export default function AdminDashboard() {
  const { user } = useUser();
  const [activeView, setActiveView] = useState<ActiveView>('users');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [portalFeedback, setPortalFeedback] = useState<PortalFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDomainFormOpen, setIsDomainFormOpen] = useState(false);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };
  
  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/domains');
      const data = await res.json();
      setDomains(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch domains", error);
    }
  };
  
  const fetchJobs = async () => {
     try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch jobs", error);
      }
  }

  const fetchPortalFeedback = async () => {
    try {
      const res = await fetch('/api/feedback');
      const data = await res.json();
      setPortalFeedback(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch portal feedback", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchPromises = [fetchUsers(), fetchJobs(), fetchDomains()];
        if (user?.role === 'Super Admin') {
          fetchPromises.push(fetchPortalFeedback());
        }
        await Promise.all(fetchPromises);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const displayedUsers = useMemo(() => {
    if (user?.role === 'Admin') {
      return users.filter(u => u.role !== 'Super Admin' && u.role !== 'Admin');
    }
    return users;
  }, [users, user]);

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'Super Admin': return <Badge className="bg-purple-100 text-purple-800">{role}</Badge>;
      case 'Admin': return <Badge className="bg-red-100 text-red-800">{role}</Badge>;
      case 'Recruiter': return <Badge className="bg-blue-100 text-blue-800">{role}</Badge>;
      case 'Employee': return <Badge className="bg-yellow-100 text-yellow-800">{role}</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };
  
  const handleEditDomain = (domain: Domain) => {
    setSelectedDomain(domain);
    setIsDomainFormOpen(true);
  };

  const handleAddDomain = () => {
    setSelectedDomain(null);
    setIsDomainFormOpen(true);
  };
  
  const handleDeleteDomain = async (domainId: string) => {
    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete domain');
      }
      toast({ title: 'Success', description: 'Domain deleted successfully.' });
      await fetchDomains();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete domain.', variant: 'destructive' });
      console.error(error);
    }
  };
  
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      toast({ title: 'Success', description: 'User deleted successfully.' });
      await fetchUsers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete user.', variant: 'destructive' });
      console.error(error);
    } finally {
      setUserToDelete(null);
    }
  };

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

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };


  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="border rounded-lg p-4">
            <Skeleton className="h-40 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const navItems = [
    { id: 'users', label: 'Manage Users', icon: UserCog },
    { id: 'jobs', label: 'Manage Jobs', icon: Briefcase },
    { id: 'domains', label: 'Manage Domains', icon: Layers },
    ...(user?.role === 'Super Admin'
      ? [{ id: 'portal-feedback', label: 'Platform Feedback', icon: Building }]
      : []),
  ];

  return (
    <>
      <Dialog open={isDomainFormOpen} onOpenChange={setIsDomainFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedDomain ? "Edit Domain" : "Add New Domain"}</DialogTitle>
             <DialogDescription>
              {selectedDomain ? "Update the details of the job domain." : "Enter the name for the new job domain."}
            </DialogDescription>
          </DialogHeader>
          <DomainForm
            domain={selectedDomain}
            onSuccess={() => {
              setIsDomainFormOpen(false);
              fetchDomains();
            }}
          />
        </DialogContent>
      </Dialog>
      
       <Dialog open={isAdminFormOpen} onOpenChange={setIsAdminFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
             <DialogDescription>
              Enter the details for the new Admin user.
            </DialogDescription>
          </DialogHeader>
          <AdminCreationForm
            onSuccess={() => {
              setIsAdminFormOpen(false);
              fetchUsers();
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account for {userToDelete?.name} and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        <CardHeader>
          <CardTitle>Admin Control Panel</CardTitle>
          <CardDescription>Manage platform users, job postings, and domains.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                <nav className="flex flex-col space-y-2">
                    {navItems.map((item) => (
                        <Button
                            key={item.id}
                            variant={activeView === item.id ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setActiveView(item.id as ActiveView)}
                        >
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.label}
                        </Button>
                    ))}
                </nav>
                 <div className="overflow-x-auto">
                    {activeView === 'users' && (
                        <div>
                            {user?.role === 'Super Admin' && (
                                <div className="flex justify-end mb-4">
                                <Button onClick={() => setIsAdminFormOpen(true)}>
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Create Admin
                                </Button>
                                </div>
                            )}
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {displayedUsers.map((u) => (
                                    <TableRow key={u.id}>
                                    <TableCell className="font-medium flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {u.name}
                                    </TableCell>
                                    <TableCell>{u.email}</TableCell>
                                    <TableCell>{getRoleBadge(u.role)}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" disabled={u.id === user?.id}>
                                            <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setUserToDelete(u)} className="text-destructive">
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
                        </div>
                    )}
                    {activeView === 'jobs' && (
                         <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date Posted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {jobs.map((job) => (
                                <TableRow key={job.id}>
                                <TableCell className="font-medium">{job.title}</TableCell>
                                <TableCell>{job.companyName}</TableCell>
                                <TableCell>
                                    <Badge variant={job.isReferral ? "outline" : "default"}>
                                    {job.isReferral ? "Referral" : "Direct"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{format(new Date(job.postedAt), "PPP")}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
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
                    )}
                    {activeView === 'domains' && (
                        <div>
                            <div className="flex justify-end mb-4">
                                <Button onClick={handleAddDomain}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Domain
                                </Button>
                            </div>
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Domain Name</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {domains.map((domain) => (
                                    <TableRow key={domain.id}>
                                    <TableCell className="font-medium">{domain.name}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditDomain(domain)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteDomain(String(domain.id))} className="text-destructive">
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
                        </div>
                    )}
                    {activeView === 'portal-feedback' && user?.role === 'Super Admin' && (
                        <div>
                             <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Submitted On</TableHead>
                                    <TableHead>Rating</TableHead>
                                    <TableHead>Feedback</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {portalFeedback.map((fb) => (
                                    <TableRow key={fb.id}>
                                    <TableCell className="font-medium">{fb.userName || 'Anonymous'}</TableCell>
                                    <TableCell>{format(new Date(fb.submittedAt), "PPP")}</TableCell>
                                    <TableCell>{renderStars(fb.rating)}</TableCell>
                                    <TableCell>{fb.feedback || 'No comment provided.'}</TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                            {portalFeedback.length === 0 && (
                                <p className="text-center text-muted-foreground py-8">No platform feedback has been submitted yet.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
      </Card>
    </>
  );
}

    