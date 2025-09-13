

export type Role = "Job Seeker" | "Recruiter" | "Employee" | "Admin" | "Super Admin";

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  password?: string;
  headline?: string;
  locationId?: number;
  domainId?: number;
  resume?: string;
  // Joined fields
  location?: string;
}

export interface JobType {
  id: number;
  name: "Full-time" | "Part-time" | "Contract" | "Internship" | "Walk-in Interview";
}

export interface WorkplaceType {
    id: number;
    name: "On-site" | "Hybrid" | "Remote";
}

export interface ExperienceLevel {
    id: number;
    name: "Entry Level" | "Mid Level" | "Senior Level";
}

export interface Location {
    id: number;
    name: string;
}

export interface Job {
  id:string;
  title: string;
  companyName: string;
  locationId: number;
  jobTypeId: number;
  workplaceTypeId?: number;
  salary?: string;
  description: string;
  postedAt: Date | string;
  experienceLevelId?: number;
  domainId?: number;
  isReferral?: boolean;
  recruiterId?: number;
  employeeId?: number;
  employeeLinkedIn?: string;
  vacancies?: number;
  contactEmail?: string;
  contactPhone?: string;
  // Joined fields
  location?: string;
  type?: string;
  workplaceType?: string;
  experienceLevel?: string;
  domain?: string;
  applicantCount?: number;
}

export interface ApplicationStatus {
  id: number;
  name: "Applied" | "Profile Viewed" | "Not Suitable" | "Selected";
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  userId: number;
  statusId: number;
  appliedAt: Date | string;
  // Joined fields
  statusName?: ApplicationStatus['name'];
  applicantName?: string;
  applicantEmail?: string;
  applicantHeadline?: string;
  applicantId?: number;
}

export interface Domain {
  id: number;
  name: string;
}

export interface Education {
    id: number;
    userId: number;
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface Project {
    id: number;
    userId: number;
    name: string;
    description?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
}

export interface Employment {
    id: number;
    userId: number;
    company: string;
    title: string;
    employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface Language {
    id: number;
    userId: number;
    language: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
}
