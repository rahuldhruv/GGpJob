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
import { LoaderCircle, ThumbsUp, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Domain, JobType, WorkplaceType, ExperienceLevel, Job, Location } from "@/lib/types";

const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters long."),
  jobTitle: z.string().min(5, "Job title must be at least 5 characters long."),
  locationId: z.coerce.number().min(1, "Job location is required."),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters long."),
  experienceLevelId: z.coerce.number().min(1, "Please select an experience level."),
  jobTypeId: z.coerce.number().min(1, "Please select a job type."),
  workplaceTypeId: z.coerce.number().min(1, "Please select a workplace type."),
  domainId: z.coerce.number().min(1, "Please select a domain."),
  vacancies: z.coerce.number().min(1, "There must be at least one vacancy."),
  email: z.string().email("Please enter a valid email address."),
  phoneNumber: z.string().min(10, "Please enter a valid phone number."),
  employeeLinkedIn: z.string().url("Please enter a valid LinkedIn URL.").optional().or(z.literal('')),
  salary: z.string().optional(),
});

type ReferralFormValues = z.infer<typeof formSchema>;

interface ReferralFormProps {
  job?: Job | null;
}

export function ReferralForm({ job }: ReferralFormProps) {
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

  const form = useForm<ReferralFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: job?.companyName || "",
      jobTitle: job?.title || "",
      locationId: job?.locationId,
      jobDescription: job?.description || "",
      vacancies: job?.vacancies || 1,
      email: job?.contactEmail || "",
      phoneNumber: job?.contactPhone || "",
      employeeLinkedIn: job?.employeeLinkedIn || "",
      salary: job?.salary || "",
      jobTypeId: job?.jobTypeId,
      workplaceTypeId: job?.workplaceTypeId,
      experienceLevelId: job?.experienceLevelId,
      domainId: job?.domainId,
    },
  });

  useEffect(() => {
    if (job) {
      form.reset({
        companyName: job.companyName || "",
        jobTitle: job.title || "",
        locationId: job.locationId,
        jobDescription: job.description || "",
        vacancies: job.vacancies || 1,
        email: job.contactEmail || "",
        phoneNumber: job.contactPhone || "",
        employeeLinkedIn: job.employeeLinkedIn || "",
        salary: job.salary || "",
        jobTypeId: job.jobTypeId,
        workplaceTypeId: job.workplaceTypeId,
        experienceLevelId: job.experienceLevelId,
        domainId: job.domainId,
      });
    }
  }, [job, form]);

  const onSubmit = async (data: ReferralFormValues) => {
    setIsSubmitting(true);
    try {
      const url = job ? `/api/jobs/${job.id}` : '/api/jobs';
      const method = job ? 'PUT' : 'POST';
      
      const payload = {
        title: data.jobTitle,
        companyName: data.companyName,
        locationId: data.locationId,
        description: data.jobDescription,
        experienceLevelId: data.experienceLevelId,
        jobTypeId: data.jobTypeId,
        workplaceTypeId: data.workplaceTypeId,
        domainId: data.domainId,
        vacancies: data.vacancies,
        contactEmail: data.email,
        contactPhone: data.phoneNumber,
        employeeLinkedIn: data.employeeLinkedIn,
        salary: data.salary,
        isReferral: true,
        employeeId: 3, // Hardcoded for now
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
        throw new Error(errorData.error || `Failed to ${job ? 'update' : 'submit'} referral`);
      }

      toast({
        title: `Referral ${job ? 'Updated' : 'Submitted'}!`,
        description: `Your referral job post has been successfully ${job ? 'updated' : 'submitted'}.`,
      });
      router.push('/');
    } catch (error: any) {
       toast({
        title: "Error",
        description: error.message || `There was an error ${job ? 'updating' : 'submitting'} your referral. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
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
                      {locations.map(loc => <SelectItem key={loc.id} value={String(loc.id)}>{loc.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                      {jobTypes.map(jt => <SelectItem key={jt.id} value={String(jt.id)}>{jt.name}</SelectItem>)}
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
                       {workplaceTypes.map(wt => <SelectItem key={wt.id} value={String(wt.id)}>{wt.name}</SelectItem>)}
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
                      {experienceLevels.map(el => <SelectItem key={el.id} value={String(el.id)}>{el.name}</SelectItem>)}
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
                      {domains.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
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
                name="email"
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
              name="phoneNumber"
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
            <FormField
              control={form.control}
              name="employeeLinkedIn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your LinkedIn URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/your-profile" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          <div className="flex justify-end pt-4">
             <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="animate-spin mr-2 h-4 w-4"/> : (job ? <Save className="mr-2 h-4 w-4" /> : <ThumbsUp className="mr-2 h-4 w-4" />)}
                {job ? "Save Changes" : "Submit Referral"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

    
