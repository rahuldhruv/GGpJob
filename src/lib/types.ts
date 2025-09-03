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
  resume?: string;
  // Joined fields
  location?: string;
}

export interface JobType {
  id: number;
  name: "Full-time" | "Part-time" | "Contract" | "Internship";
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
  domainId?: string;
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
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  userId: number;
  status: "Applied" | "In Review" | "Interview" | "Offered" | "Rejected";
  appliedAt: Date | string;
}

export interface Domain {
  id: string;
  name: string;
}

    