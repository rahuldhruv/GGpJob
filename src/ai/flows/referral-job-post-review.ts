'use server';
/**
 * @fileOverview Reviews referral job posts for clarity and adherence to company standards.
 *
 * - reviewReferralJobPost - A function that reviews a referral job post description.
 * - ReviewReferralJobPostInput - The input type for the reviewReferralJobPost function.
 * - ReviewReferralJobPostOutput - The return type for the reviewReferralJobPost function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReviewReferralJobPostInputSchema = z.object({
  jobDescription: z
    .string()
    .describe('The job description to review for clarity and completeness.'),
  companyTemplate: z
    .string()
    .optional()
    .describe('The standard company template for job descriptions.'),
});
export type ReviewReferralJobPostInput = z.infer<typeof ReviewReferralJobPostInputSchema>;

const ReviewReferralJobPostOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'Suggestions for improving the job description, focusing on clarity, completeness, and adherence to the company template.'
    ),
  isApproved: z.boolean().describe('Whether the job post is approved or not.'),
});
export type ReviewReferralJobPostOutput = z.infer<typeof ReviewReferralJobPostOutputSchema>;

export async function reviewReferralJobPost(
  input: ReviewReferralJobPostInput
): Promise<ReviewReferralJobPostOutput> {
  return reviewReferralJobPostFlow(input);
}

const reviewReferralJobPostPrompt = ai.definePrompt({
  name: 'reviewReferralJobPostPrompt',
  input: {schema: ReviewReferralJobPostInputSchema},
  output: {schema: ReviewReferralJobPostOutputSchema},
  prompt: `You are an AI assistant reviewing a referral job post description to ensure it is clear, complete, and adheres to company standards.

  Job Description: {{{jobDescription}}}
  {{#if companyTemplate}}
  Company Template: {{{companyTemplate}}}
  {{/if}}

  Provide suggestions for improvement, and make a determination as to whether the job post is approved or not, and set the isApproved output field appropriately.  If the job description is very bad, do not approve it.
  Focus on clarity, completeness, and adherence to the company template (if provided).
  Return suggestions that are very specific and actionable.
  Always return a value for isApproved.
`,
});

const reviewReferralJobPostFlow = ai.defineFlow(
  {
    name: 'reviewReferralJobPostFlow',
    inputSchema: ReviewReferralJobPostInputSchema,
    outputSchema: ReviewReferralJobPostOutputSchema,
  },
  async input => {
    const {output} = await reviewReferralJobPostPrompt(input);
    return output!;
  }
);
