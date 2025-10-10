
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Briefcase, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Domain, JobType, WorkplaceType, ExperienceLevel, Job, Location } from "@/lib/types";
import { useUser } from "@/contexts/user-context";

const formSchema = z.object({
  jobTitle: z.string().min(5, "Job title must be at least 5 characters long."),
  companyName: z.string().min(2, "Company name must be at least 2 characters long."),
  locationId: z.string().min(1, "Job location is required."),
  role: z.string().min(2, "Role must be at least 2 characters long."),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters long."),
  experienceLevelId: z.string().min(1, "Please select an experience level."),
  jobTypeId: z.string().min(1, "Please select a job type."),
  workplaceTypeId: z.string().min(1, "Please select a workplace type."),
  domainId: z.string().min(1, "Please select a domain."),
  vacancies: z.coerce.number().min(1, "There must be at least one vacancy."),
  contactEmail: z.string().email("Please enter a valid email address."),
  contactPhone: z.string().length(10, "Please enter a valid 10-digit phone number."),
  salary: z.string().optional(),
});

type JobFormValues = z.infer<typeof formSchema>;

interface JobFormProps {
  job?: Job | null;
}

export function JobForm({ job }: JobFormProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [workplaceTypes, setWorkplaceTypes] = useState<WorkplaceType[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchSelectData = async () => {
        try {
            const [domainsRes, jobTypesRes, workplaceTypesRes, experienceLevelsRes, locationsRes] = await Promise.all([
                fetch('/api/domains'),
                fetch('/api/job-types'),
                fetch('/api/workplace-types'),
                fetch('/api/experience-levels'),
                fetch('/api/locations')
            ]);
            
            setDomains(await domainsRes.json());
            setJobTypes(await jobTypesRes.json());
            setWorkplaceTypes(await workplaceTypesRes.json());
            setExperienceLevels(await experienceLevelsRes.json());
            setLocations(await locationsRes.json());
        } catch (error) {
            console.error("Failed to fetch form select data", error);
            toast({
                title: "Error fetching form data",
                description: "Could not load all select options. Please try again later.",
                variant: "destructive",
            });
        }
    }
    fetchSelectData();
  }, [toast]);

  const form = useForm<JobFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: job?.title || "",
      companyName: job?.companyName || "",
      locationId: String(job?.locationId || ''),
      role: job?.role || "",
      jobDescription: job?.description || "",
      vacancies: job?.vacancies || 1,
      contactEmail: job?.contactEmail || "",
      contactPhone: job?.contactPhone || "",
      salary: job?.salary || "",
      jobTypeId: String(job?.jobTypeId || ''),
      workplaceTypeId: String(job?.workplaceTypeId || ''),
      experienceLevelId: String(job?.experienceLevelId || ''),
      domainId: String(job?.domainId || ''),
    },
  });

   useEffect(() => {
    if (job) {
      form.reset({
        jobTitle: job.title || "",
        companyName: job.companyName || "",
        locationId: String(job.locationId || ''),
        role: job.role || "",
        jobDescription: job.description || "",
        vacancies: job.vacancies || 1,
        contactEmail: job.contactEmail || "",
        contactPhone: job.contactPhone || "",
        salary: job.salary || "",
        jobTypeId: String(job.jobTypeId || ''),
        workplaceTypeId: String(job.workplaceTypeId || ''),
        experienceLevelId: String(job.experienceLevelId || ''),
        domainId: String(job.domainId || ''),
      });
    }
  }, [job, form]);

  const onSubmit = async (data: JobFormValues) => {
    if (!user) {
        toast({ title: "Authentication Error", description: "You must be logged in to post a job.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const url = job ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = job ? 'PUT' : 'POST';
      
      const payload = {
        ...data,
        title: data.jobTitle,
        description: data.jobDescription,
        isReferral: false,
        recruiterId: user.id, // Ensure recruiterId is set
        postedAt: job?.postedAt || new Date().toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${job ? 'update' : 'post'} job`);
      }

      toast({
        title: `Job ${job ? 'Updated' : 'Posted'}!`,
        description: `Your job posting has been successfully ${job ? 'updated' : 'posted'}.`,
      });
      router.push('/');
    } catch (error: any) {
       toast({
        title: "Error",
        description: error.message || `There was an error ${job ? 'updating' : 'posting'} your job. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Acme Inc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Location</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value || '')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job location" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.isArray(locations) && locations.map(loc => <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                    <Input placeholder="e.g. Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
          control={form.control}
          name="jobDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the role and responsibilities..." className="min-h-[120px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField
            control={form.control}
            name="jobTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employment Type</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value || '')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.isArray(jobTypes) && jobTypes.map(jt => <SelectItem key={jt.id} value={String(jt.id)}>{jt.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="workplaceTypeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workplace Type</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value || '')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select workplace type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                     {Array.isArray(workplaceTypes) && workplaceTypes.map(wt => <SelectItem key={wt.id} value={String(wt.id)}>{wt.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="experienceLevelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Experience Level</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value || '')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.isArray(experienceLevels) && experienceLevels.map(el => <SelectItem key={el.id} value={String(el.id)}>{el.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="domainId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Domain</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value || '')}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.isArray(domains) && domains.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="vacancies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Vacancies</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="salary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Salary (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. $100,000 - $120,000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input placeholder="hiring.manager@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(123) 456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
         </div>
        <div className="flex justify-end pt-4">
           <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin mr-2 h-4 w-4"/> : (job ? <Save className="mr-2 h-4 w-4" /> : <Briefcase className="mr-2 h-4 w-4" />)}
              {job ? "Save Changes" : "Post Job"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
