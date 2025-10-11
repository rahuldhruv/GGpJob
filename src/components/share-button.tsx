
"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
    jobId: string;
    jobTitle: string;
}

export function ShareButton({ jobId, jobTitle }: ShareButtonProps) {
    const { toast } = useToast();

    const copyToClipboard = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            toast({
                title: "Link Copied!",
                description: "The job link has been copied to your clipboard.",
            });
        } catch (error) {
            console.error("Error copying to clipboard:", error);
            toast({
                title: "Error",
                description: "Could not copy link to clipboard.",
                variant: "destructive",
            });
        }
    };

    const handleShare = async () => {
        const jobUrl = `${window.location.origin}/jobs/${jobId}`;
        const shareData = {
            title: `Job Opening: ${jobTitle}`,
            text: `Check out this job: ${jobTitle}`,
            url: jobUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (error: any) {
                // If the user cancels the share, it might throw an AbortError.
                // In other cases of failure, fall back to clipboard.
                if (error.name !== 'AbortError') {
                    console.error("Error sharing:", error);
                    await copyToClipboard(jobUrl);
                }
            }
        } else {
            await copyToClipboard(jobUrl);
        }
    };

    return (
        <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share this job</span>
        </Button>
    );
}
