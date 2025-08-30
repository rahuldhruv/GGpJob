// IMPORTANT: This file is used to provide server-side actions that can be called from client components.
// It is NOT a public API endpoint.
// It should not be used for any other purpose.

'use server';

import {
  reviewReferralJobPost,
  type ReviewReferralJobPostInput,
  type ReviewReferralJobPostOutput,
} from '@/ai/flows/referral-job-post-review';
import {
  getJobRecommendations,
  type JobRecommendationsInput,
  type JobRecommendationsOutput,
} from '@/ai/flows/automated-job-recommendations';

/**
 * Reviews a referral job post using an AI model to ensure clarity and adherence to standards.
 * @param input - The job post details to review.
 * @returns A promise that resolves to the AI's review and suggestions.
 */
export async function reviewJobPostAction(
  input: ReviewReferralJobPostInput
): Promise<ReviewReferralJobPostOutput> {
  // In a real application, you might add validation, logging, or other checks here.
  const result = await reviewReferralJobPost(input);
  return result;
}

/**
 * Generates personalized job recommendations for a user based on their profile and activity.
 * @param input - The user's profile summary and search history.
 * @returns A promise that resolves to a list of recommended job titles.
 */
export async function getRecommendationsAction(
  input: JobRecommendationsInput
): Promise<JobRecommendationsOutput> {
  // In a real application, you might fetch user data from a database here instead of passing it in.
  const result = await getJobRecommendations(input);
  return result;
}
