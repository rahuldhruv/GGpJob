
"use client";

import { useState, useEffect } from "react";
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
import { LoaderCircle, FileText, Link as LinkIcon, ExternalLink } from "lucide-react";
import { User } from "@/lib/types";
import { useUser } from "@/contexts/user-context";
import Link from "next/link";

const formSchema = z.object({
  resumeUrl: z.string().url("Please enter a valid URL.").or(z.literal('')),
});

type ResumeFormValues = z.infer<typeof formSchema>;

interface ResumeFormProps {
  user: User;
}

export function ResumeForm({ user: initialUser }: ResumeFormProps) {
  const { toast } = useToast();
  const { user, setUser } = useUser();

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        resumeUrl: user?.resumeUrl || "",
    },
  });

  const { formState: { isSubmitting }, reset } = form;
  
  useEffect(() => {
    reset({ resumeUrl: user?.resumeUrl || "" });
  }, [user, reset]);


  const onSubmit = async (data: ResumeFormValues) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/users/${user.id}/resume`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeUrl: data.resumeUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update resume");
      }
      
      const updatedData = await response.json();
      setUser({ ...user, resumeUrl: updatedData.resumeUrl });

      toast({
        title: "Resume Updated!",
        description: "Your new resume link has been successfully saved.",
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  const currentResumeUrl = user?.resumeUrl;

  return (
    <div className="space-y-4">
        {currentResumeUrl && (
             <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
                    <span className="font-medium">Current Resume Link</span>
                </div>
                <Button asChild variant="ghost" size="sm">
                    <Link href={currentResumeUrl} target="_blank">
                        View Resume <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
        )}
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
            control={form.control}
            name="resumeUrl"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Resume Link</FormLabel>
                <FormControl>
                    <div className="relative">
                       <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="https://example.com/my-resume.pdf"
                            className="pl-8"
                            {...field}
                        />
                    </div>
                </FormControl>
                 <FormMessage />
                </FormItem>
            )}
            />
            <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}
