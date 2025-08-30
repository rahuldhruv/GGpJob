"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, ThumbsUp } from "lucide-react";

const formSchema = z.object({
  jobTitle: z.string().min(5, "Job title must be at least 5 characters long."),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters long."),
  referralBonus: z.string().optional(),
});

type ReferralFormValues = z.infer<typeof formSchema>;

export function ReferralReviewForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReferralFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
      referralBonus: "$1,500",
    },
  });

  const onSubmit = async (data: ReferralFormValues) => {
    setIsSubmitting(true);
    console.log(data); // In a real app, this would submit to a backend.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Referral Submitted!",
      description: "Your referral job post has been successfully submitted.",
    });
    form.reset();
    setIsSubmitting(false);
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
           <FormField
            control={form.control}
            name="referralBonus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referral Bonus</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. $2,000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
             <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <LoaderCircle className="animate-spin mr-2"/> : <ThumbsUp className="mr-2"/>}
                Submit Referral
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
