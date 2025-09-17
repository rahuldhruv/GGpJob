'use server';

/**
 * @fileOverview Generates an HTML resume from user profile data.
 * 
 * - generateResume - A function that takes user profile data and returns an HTML resume.
 * - GenerateResumeInput - The input type for the generateResume function.
 * - GenerateResumeOutput - The return type for the generateResume function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EducationSchema = z.object({
    institution: z.string().describe("The name of the educational institution."),
    degree: z.string().describe("The degree obtained."),
    fieldOfStudy: z.string().optional().describe("The field of study."),
    startDate: z.string().optional().describe("The start date of the education."),
    endDate: z.string().optional().describe("The end date of the education."),
    description: z.string().optional().describe("A description of the education.")
});

const EmploymentSchema = z.object({
    company: z.string().describe("The name of the company."),
    title: z.string().describe("The job title."),
    location: z.string().optional().describe("The location of the job."),
    startDate: z.string().optional().describe("The start date of the employment."),
    endDate: z.string().optional().describe("The end date of the employment."),
    description: z.string().optional().describe("A description of the responsibilities and achievements.")
});

const ProjectSchema = z.object({
    name: z.string().describe("The name of the project."),
    description: z.string().optional().describe("A description of the project."),
    url: z.string().optional().describe("A URL to the project."),
    startDate: z.string().optional().describe("The start date of the project."),
    endDate: z.string().optional().describe("The end date of the project.")
});

const LanguageSchema = z.object({
    language: z.string().describe("The language."),
    proficiency: z.string().describe("The proficiency level in the language.")
});


const GenerateResumeInputSchema = z.object({
    name: z.string().describe("The user's full name."),
    email: z.string().describe("The user's email address."),
    phone: z.string().describe("The user's phone number."),
    headline: z.string().optional().describe("The user's professional headline."),
    location: z.string().optional().describe("The user's location."),
    education: z.array(EducationSchema).optional().describe("A list of the user's educational background."),
    employment: z.array(EmploymentSchema).optional().describe("A list of the user's employment history."),
    projects: z.array(ProjectSchema).optional().describe("A list of the user's projects."),
    languages: z.array(LanguageSchema).optional().describe("A list of languages the user knows."),
});
export type GenerateResumeInput = z.infer<typeof GenerateResumeInputSchema>;

const GenerateResumeOutputSchema = z.object({
  resumeHtml: z.string().describe("The generated resume in HTML format."),
});
export type GenerateResumeOutput = z.infer<typeof GenerateResumeOutputSchema>;


export async function generateResume(input: GenerateResumeInput): Promise<GenerateResumeOutput> {
  return generateResumeFlow(input);
}


const prompt = ai.definePrompt({
  name: 'generateResumePrompt',
  input: { schema: GenerateResumeInputSchema },
  output: { schema: GenerateResumeOutputSchema },
  prompt: `
    You are an expert resume writer. Generate a professional and clean HTML resume based on the following user data.
    The HTML should be a single, self-contained block of HTML using inline styles for formatting. Do not include <html>, <head>, or <body> tags.
    Use a clean, modern, and professional design. Use a common font like Arial or Helvetica.

    User data:
    Name: {{{name}}}
    Email: {{{email}}}
    Phone: {{{phone}}}
    {{#if headline}}Headline: {{{headline}}}{{/if}}
    {{#if location}}Location: {{{location}}}{{/if}}

    ---

    {{#if employment}}
    ## Employment History
    {{#each employment}}
    - Company: {{company}}, Title: {{title}}{{#if location}}, Location: {{location}}{{/if}}, Dates: {{#if startDate}}{{startDate}}{{/if}} - {{#if endDate}}{{endDate}}{{else}}Present{{/if}}. Description: {{description}}
    {{/each}}
    {{/if}}

    ---
    
    {{#if education}}
    ## Education
    {{#each education}}
    - Institution: {{institution}}, Degree: {{degree}}, Field: {{fieldOfStudy}}, Dates: {{#if startDate}}{{startDate}}{{/if}} - {{#if endDate}}{{endDate}}{{/if}}. Description: {{description}}
    {{/each}}
    {{/if}}
    
    ---

    {{#if projects}}
    ## Projects
    {{#each projects}}
    - Name: {{name}}, Dates: {{#if startDate}}{{startDate}}{{/if}} - {{#if endDate}}{{endDate}}{{/if}}. URL: {{url}}. Description: {{description}}
    {{/each}}
    {{/if}}
    
    ---
    
    {{#if languages}}
    ## Languages
    {{#each languages}}
    - Language: {{language}}, Proficiency: {{proficiency}}
    {{/each}}
    {{/if}}

    ---
    
    Generate the HTML now based on the provided data.
    Organize it into clear sections: Contact Info, Employment History, Education, Projects, and Languages.
    For dates, if only a start date is provided, assume "Present" for the end date.
    Ensure the styling is professional and easy to read.
  `,
});

const generateResumeFlow = ai.defineFlow(
  {
    name: 'generateResumeFlow',
    inputSchema: GenerateResumeInputSchema,
    outputSchema: GenerateResumeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
