
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { AdminCreationForm } from "@/components/admin-creation-form";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/user-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ManageUsersPage() {
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleAddAdminClick = () => {
    if (isMobile) {
      router.push('/admin/users/add');
    } else {
      setIsAdminFormOpen(true);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users", error);
      toast({ title: 'Error', description: 'Failed to fetch users.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const renderContent = () => {
    if (loading) {
      return (
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
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    return (
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setUserToDelete(u)}
                  disabled={u.id === user?.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>View, edit, and manage all users on the platform.</CardDescription>
            </div>
            {user?.role === 'Super Admin' && (
              <Button onClick={handleAddAdminClick}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Create Admin
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </>
  );
}
