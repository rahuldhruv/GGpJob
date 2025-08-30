"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { reviewJobPostAction } from "@/app/actions";
import type { ReviewReferralJobPostOutput } from "@/ai/flows/referral-job-post-review";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LoaderCircle, Sparkles, CheckCircle2, XCircle, ThumbsUp } from "lucide-react";

const formSchema = z.object({
  jobTitle: z.string().min(5, "Job title must be at least 5 characters long."),
  jobDescription: z.string().min(50, "Job description must be at least 50 characters long."),
  referralBonus: z.string().optional(),
  companyTemplate: z.string().optional(),
});

type ReferralFormValues = z.infer<typeof formSchema>;

export function ReferralReviewForm() {
  const { toast } = useToast();
  const [reviewResult, setReviewResult] = useState<ReviewReferralJobPostOutput | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReferralFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: "",
      jobDescription: "",
      referralBonus: "$1,500",
      companyTemplate: "Our company values collaboration and innovation. The ideal candidate will have experience in [mention key skills] and a passion for [mention company mission]. Responsibilities include [list 2-3 key responsibilities].",
    },
  });

  const handleReview = async () => {
    const { jobDescription, companyTemplate } = form.getValues();
    if (!jobDescription || jobDescription.length < 50) {
        form.setError("jobDescription", { type: "manual", message: "Job description must be at least 50 characters long to be reviewed."})
        return;
    }

    setIsReviewing(true);
    setReviewResult(null);
    try {
      const result = await reviewJobPostAction({ jobDescription, companyTemplate });
      setReviewResult(result);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Review Failed",
        description: "Could not get AI feedback. Please try again.",
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const onSubmit = async (data: ReferralFormValues) => {
    setIsSubmitting(true);
    console.log(data); // In a real app, this would submit to a backend.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Referral Submitted!",
      description: "Your referral job post has been successfully submitted.",
    });
    form.reset();
    setReviewResult(null);
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

          <Button type="button" variant="outline" onClick={handleReview} disabled={isReviewing} className="w-full">
            {isReviewing ? <LoaderCircle className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
            Review with AI
          </Button>

          {reviewResult && (
            <Alert variant={reviewResult.isApproved ? "default" : "destructive"} className={reviewResult.isApproved ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}>
              {reviewResult.isApproved ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>{reviewResult.isApproved ? "Approved!" : "Needs Improvement"}</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">{reviewResult.suggestions}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end pt-4">
             <Button type="submit" disabled={isSubmitting || (reviewResult && !reviewResult.isApproved)}>
                {isSubmitting ? <LoaderCircle className="animate-spin mr-2"/> : <ThumbsUp className="mr-2"/>}
                Submit Referral
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
