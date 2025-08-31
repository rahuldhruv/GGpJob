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
}

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship";
export type WorkplaceType = "On-site" | "Hybrid" | "Remote";

export interface Job {
  id:string;
  title: string;
  companyName: string;
  location: string;
  type: JobType;
  workplaceType?: WorkplaceType;
  salary?: string;
  description: string;
  postedAt: Date | string;
  experienceLevel?: "Entry Level" | "Mid Level" | "Senior Level";
  domain?: string;
  isReferral?: boolean;
  recruiterId?: number;
  employeeId?: number;
  employeeLinkedIn?: string;
  vacancies?: number;
  contactEmail?: string;
  contactPhone?: string;
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
