"use client";

import { useState, useEffect } from "react";
import type { Job, User, Domain } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { UserCog, Briefcase, PlusCircle, Edit, Trash2, MoreHorizontal, Layers } from "lucide-react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { DomainForm } from "../domain-form";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const { toast } = useToast();

  const fetchDomains = async () => {
    try {
      const res = await fetch('/api/domains');
      const data = await res.json();
      setDomains(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch domains", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [jobsRes, usersRes] = await Promise.all([
          fetch('/api/jobs'),
          fetch('/api/users')
        ]);
        const jobsData = await jobsRes.json();
        const usersData = await usersRes.json();
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
        await fetchDomains();
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'Admin': return <Badge className="bg-red-100 text-red-800">{role}</Badge>;
      case 'Recruiter': return <Badge className="bg-blue-100 text-blue-800">{role}</Badge>;
      case 'Employee': return <Badge className="bg-yellow-100 text-yellow-800">{role}</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };
  
  const handleEditDomain = (domain: Domain) => {
    setSelectedDomain(domain);
    setIsFormOpen(true);
  };

  const handleAddDomain = () => {
    setSelectedDomain(null);
    setIsFormOpen(true);
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


  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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
              setIsFormOpen(false);
              fetchDomains();
            }}
          />
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader>
          <CardTitle>Admin Control Panel</CardTitle>
          <CardDescription>Manage platform users, job postings, and domains.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users">
            <TabsList className="mb-4 grid w-full grid-cols-1 md:grid-cols-3 h-auto">
              <TabsTrigger value="users">
                <UserCog className="mr-2 h-4 w-4" />
                Manage Users
              </TabsTrigger>
              <TabsTrigger value="jobs">
                <Briefcase className="mr-2 h-4 w-4" />
                Manage Jobs
              </TabsTrigger>
              <TabsTrigger value="domains">
                <Layers className="mr-2 h-4 w-4" />
                Manage Domains
              </TabsTrigger>
            </TabsList>
            <TabsContent value="users">
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
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl} alt={user.name}/>
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {user.name}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Edit User</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="jobs">
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
                         <Button variant="outline" size="sm">Edit Job</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="domains">
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
                            <DropdownMenuItem onClick={() => handleDeleteDomain(domain.id)} className="text-destructive">
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}
