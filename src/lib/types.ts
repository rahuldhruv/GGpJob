export type Role = "Job Seeker" | "Recruiter" | "Employee" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: Role;
  headline?: string;
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
  postedAt: Date;
  isReferral?: boolean;
  recruiterId?: string;
  employeeId?: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  userId: string;
  status: "Applied" | "In Review" | "Interview" | "Offered" | "Rejected";
  appliedAt: Date;
}
