
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
import type { Application } from "@/lib/types";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DialogClose } from "./ui/dialog";

const formSchema = z.object({
  rating: z.number().min(1, "Please select a rating.").max(5),
  feedback: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof formSchema>;

interface ApplicationFeedbackFormProps {
  application: Application;
  onSuccess: () => void;
}

export function ApplicationFeedbackForm({ application, onSuccess }: ApplicationFeedbackFormProps) {
  const { toast } = useToast();
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      feedback: "",
    },
  });

  const { isSubmitting, watch } = form.formState;
  const currentRating = watch("rating");

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      const response = await fetch(`/api/applications/${application.id}/feedback`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }
      
      toast({
        title: "Feedback Submitted!",
        description: "Thank you for your feedback.",
      });
      onSuccess();
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
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Rating</FormLabel>
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
              <FormLabel>Feedback (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us more about your experience..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2 gap-2">
            <DialogClose asChild>
                <Button type="button" variant="outline">
                    Cancel
                </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Submit
            </Button>
        </div>
      </form>
    </Form>
  );
}
