
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { LoaderCircle, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  rating: z.number().min(1, "Please select a rating.").max(5),
  feedback: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof formSchema>;

interface PortalFeedbackFormProps {
  userId: number;
}

export function PortalFeedbackForm({ userId }: PortalFeedbackFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      feedback: "",
    },
  });

  const { watch } = form;
  const { isSubmitting } = form.formState;
  const currentRating = watch("rating");

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      const response = await fetch(`/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }
      
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for helping us improve the portal.",
      });
      router.push('/');
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How would you rate your overall experience with the portal?</FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, index) => {
                    const ratingValue = index + 1;
                    return (
                      <button
                        type="button"
                        key={ratingValue}
                        onClick={() => field.onChange(ratingValue)}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 cursor-pointer transition-colors",
                            ratingValue <= (hoverRating || currentRating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Do you have any suggestions for us? (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us what you liked or where we can improve..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isSubmitting || currentRating === 0}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
            </Button>
        </div>
      </form>
    </Form>
  );
}
