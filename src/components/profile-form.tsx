
"use client";

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
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, FileText, Upload } from "lucide-react";
import { User, Location, Domain } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useEffect, useState } from "react";
import Link from "next/link";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  headline: z.string().optional(),
  locationId: z.coerce.number().optional(),
  domainId: z.coerce.number().optional(),
  resume: z.any().optional(), // Using `any` to handle FileList from input
});

type ProfileFormValues = z.infer<typeof formSchema>;

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const { setUser } = useUser();
  const [locations, setLocations] = useState<Location[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [locationsRes, domainsRes] = await Promise.all([
                fetch('/api/locations'),
                fetch('/api/domains')
            ]);
            setLocations(await locationsRes.json());
            setDomains(await domainsRes.json());
        } catch (error) {
            console.error("Failed to fetch form data", error);
        }
    }
    fetchData();
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      headline: user.headline || "",
      locationId: user.locationId,
      domainId: user.domainId,
    },
  });
  
  const { register } = form;

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const formData = {
        ...data,
        resume: data.resume?.[0], // Extract the file from the FileList
      };

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      const updatedUser = await response.json();
      
      setUser({ ...user, ...updatedUser });

      toast({
        title: "Profile Updated!",
        description: "Your profile information has been successfully updated.",
      });
      
      const { resume, ...resetData } = updatedUser;
      form.reset({...resetData, resume: null });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="headline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Headline</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Senior Software Engineer at Acme Inc." {...field} />
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
                <FormLabel>Location</FormLabel>
                <Select onValueChange={field.onChange} value={String(field.value || '')}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select your location" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        {Array.isArray(locations) && locations.map(loc => <SelectItem key={loc.id} value={String(loc.id)}>{loc.name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
          )}
        />
        {user.role === 'Job Seeker' && (
            <>
                <FormField
                control={form.control}
                name="domainId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Preferred Domain</FormLabel>
                        <Select onValueChange={field.onChange} value={String(field.value || '')}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your preferred domain" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {Array.isArray(domains) && domains.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
                />
                <FormItem>
                  <FormLabel>Resume</FormLabel>
                   {user.resume ? (
                     <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4" />
                          <span className="font-medium">{user.resume.split('/').pop()}</span>
                        </div>
                        <Link href={user.resume} target="_blank" className="text-sm text-primary hover:underline">
                            View
                        </Link>
                     </div>
                   ) : (
                    <p className="text-sm text-muted-foreground">No resume uploaded yet.</p>
                   )}
                   <FormControl>
                    <div className="relative">
                        <Button asChild variant="outline" className="w-full">
                           <label htmlFor="resume-upload">
                             <Upload className="mr-2 h-4 w-4"/>
                             {user.resume ? 'Upload a New Resume' : 'Upload Resume'}
                           </label>
                        </Button>
                        <Input 
                            id="resume-upload"
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            {...register("resume")}
                        />
                    </div>
                   </FormControl>
                   <FormMessage>{form.formState.errors.resume?.message as React.ReactNode}</FormMessage>
                </FormItem>
            </>
        )}
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
