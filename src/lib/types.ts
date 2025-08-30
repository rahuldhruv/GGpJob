export type Role = "Job Seeker" | "Recruiter" | "Employee" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
  headline?: string;
  _id?: string;
}

export interface Job {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  salary?: string;
  description: string;
  postedAt: Date | string;
  isReferral?: boolean;
  recruiterId?: string;
  employeeId?: string;
  _id?: string;
  vacancies?: number;
  contactEmail?: string;
  contactPhone?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  userId: string;
  status: "Applied" | "In Review" | "Interview" | "Offered" | "Rejected";
  appliedAt: Date | string;
  _id?: string;
}
