
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Job } from "@/lib/types";
import { MapPin, Briefcase, Clock, Star, CheckCircle, BadgeDollarSign } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  isApplied?: boolean;
}

export default function JobCard({ job, isApplied = false }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{job.title}</CardTitle>
            <CardDescription>{job.companyName}</CardDescription>
          </div>
          {job.isReferral && (
            <Badge variant="outline" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
              <Star className="h-3 w-3" />
              Referral
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>{job.type}</span>
          </div>
          {job.salary && (
             <div className="flex items-center gap-2">
                <BadgeDollarSign className="h-4 w-4" />
                <span className="font-semibold text-primary/80">{job.salary}</span>
             </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(job.postedAt), { addSuffix: true })}
        </div>
        <div className="flex items-center gap-2">
            {isApplied && (
                <Badge variant="secondary" className="flex items-center gap-1.5 border-green-300 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    Applied
                </Badge>
            )}
            <Button asChild variant="secondary" size="sm">
                <Link href={`/jobs/${job.id}`}>View Details</Link>
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
