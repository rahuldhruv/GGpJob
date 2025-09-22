
"use client";

import { useState, useEffect } from "react";
import type { PortalFeedback } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";

export default function PlatformFeedbackPage() {
  const [portalFeedback, setPortalFeedback] = useState<PortalFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'Super Admin') {
        router.push('/admin/users');
    }
  }, [user, router]);


  useEffect(() => {
    const fetchPortalFeedback = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/feedback');
        const data = await res.json();
        setPortalFeedback(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch portal feedback", error);
        toast({ title: 'Error', description: 'Failed to fetch platform feedback.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'Super Admin') {
        fetchPortalFeedback();
    }
  }, [toast, user]);

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

  const renderContent = () => {
    if (loading) {
      return (
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
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-full" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (portalFeedback.length === 0) {
      return <p className="text-center text-muted-foreground py-8">No platform feedback has been submitted yet.</p>;
    }

    return (
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
              <TableCell className="max-w-xs truncate">{fb.feedback || 'No comment provided.'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (user?.role !== 'Super Admin') {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p>You do not have permission to view this page.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Feedback</CardTitle>
        <CardDescription>Review feedback submitted by users about their experience with the portal.</CardDescription>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
