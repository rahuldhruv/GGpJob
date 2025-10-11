

export type Role = "Job Seeker" | "Recruiter" | "Employee" | "Admin" | "Super Admin";

export interface User {
  id: string; // Changed to string for Firestore UID
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  headline?: string;
  locationId?: string;
  domainId?: string;
  resumeUrl?: string;
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
    country?: string;
}

export interface Job {
  id:string;
  title: string;
  companyName: string;
  locationId: string;
  jobTypeId: string;
  workplaceTypeId?: string;
  salary?: string;
  description: string;
  postedAt: Date | string;
  experienceLevelId?: string;
  domainId?: string;
  role?: string;
  isReferral?: boolean;
  recruiterId?: string; // Changed to string for Firestore UID
  employeeId?: string; // Changed to string for Firestore UID
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
  jobTitle?: string;
  companyName?: string;
  userId: string; // Changed to string for Firestore UID
  statusId: number;
  appliedAt: Date | string;
  rating?: number;
  feedback?: string;
  // Joined fields
  statusName?: ApplicationStatus['name'];
  applicantName?: string;
  applicantEmail?: string;
  applicantHeadline?: string;
  applicantId?: string; // Changed to string for Firestore UID
  applicantSkills?: string;
}

export interface Domain {
  id: string; // Changed to string for Firestore ID
  name: string;
}

export interface Education {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface Project {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    name: string;
    description?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
}

export interface Employment {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    company: string;
    title: string;
    employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

export interface Language {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    language: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface Skill {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    name: string;
}

export interface PortalFeedback {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    rating: number;
    feedback?: string;
    submittedAt: string;
    // Joined fields
    userName?: string;
    userEmail?: string;
}
