'use server';

/**
 * @fileOverview Provides automated job recommendations based on user profile and search history.
 *
 * - getJobRecommendations - A function that generates job recommendations.
 * - JobRecommendationsInput - The input type for the getJobRecommendations function.
 * - JobRecommendationsOutput - The return type for the getJobRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobRecommendationsInputSchema = z.object({
  profileSummary: z
    .string()
    .describe("A summary of the job seeker's profile, including skills and experience."),
  searchHistory: z
    .string()
    .describe('A summary of the job seeker\s recent job search history.'),
});
export type JobRecommendationsInput = z.infer<typeof JobRecommendationsInputSchema>;

const JobRecommendationsOutputSchema = z.object({
  jobRecommendations: z
    .array(z.string())
    .describe('A list of recommended job titles based on the profile and search history.'),
});
export type JobRecommendationsOutput = z.infer<typeof JobRecommendationsOutputSchema>;

export async function getJobRecommendations(input: JobRecommendationsInput): Promise<JobRecommendationsOutput> {
  return jobRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'jobRecommendationsPrompt',
  input: {schema: JobRecommendationsInputSchema},
  output: {schema: JobRecommendationsOutputSchema},
  prompt: `You are an expert job recommendation system.

  Based on the job seeker's profile summary and search history, provide a list of job recommendations.

  Profile Summary: {{{profileSummary}}}
  Search History: {{{searchHistory}}}

  The job recommendations should be relevant to the job seeker's skills and interests.
  Return only an array of strings representing recommended job titles.
  `,
});

const jobRecommendationsFlow = ai.defineFlow(
  {
    name: 'jobRecommendationsFlow',
    inputSchema: JobRecommendationsInputSchema,
    outputSchema: JobRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
