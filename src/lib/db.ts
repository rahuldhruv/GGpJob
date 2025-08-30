import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import type { User, Job, Application } from './types';

let db = null;

const usersData: User[] = [
  { id: "user-1", name: "Alice Johnson", email: "alice@example.com", avatarUrl: "https://picsum.photos/id/1005/100/100", role: "Job Seeker", headline: "Frontend Developer" },
  { id: "user-2", name: "Bob Williams", email: "bob@example.com", avatarUrl: "https://picsum.photos/id/1011/100/100", role: "Recruiter" },
  { id: "user-3", name: "Charlie Brown", email: "charlie@example.com", avatarUrl: "https://picsum.photos/id/1012/100/100", role: "Employee" },
  { id: "user-4", name: "Diana Prince", email: "diana@example.com", avatarUrl: "https://picsum.photos/id/1027/100/100", role: "Admin" },
];

const jobsData: Job[] = [
  {
    id: "job-1",
    title: "Senior Frontend Engineer",
    companyName: "Innovate Inc.",
    companyLogoUrl: "https://picsum.photos/id/20/100/100",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$150,000 - $180,000",
    description: "Innovate Inc. is seeking a Senior Frontend Engineer to build and maintain our cutting-edge web applications using React and TypeScript.",
    postedAt: new Date("2024-05-20T10:00:00Z"),
    recruiterId: "user-2",
  },
  {
    id: "job-2",
    title: "Product Manager",
    companyName: "Creative Solutions",
    companyLogoUrl: "https://picsum.photos/id/30/100/100",
    location: "New York, NY",
    type: "Full-time",
    description: "Creative Solutions is looking for a Product Manager to lead the development of our new suite of design tools.",
    postedAt: new Date("2024-05-18T14:30:00Z"),
    recruiterId: "user-2",
  },
  {
    id: "job-3",
    title: "Data Scientist (Referral)",
    companyName: "Data Insights Co.",
    companyLogoUrl: "https://picsum.photos/id/40/100/100",
    location: "Remote",
    type: "Full-time",
    salary: "$130,000 - $160,000",
    description: "Join our data science team and work on challenging problems in machine learning and data analysis.",
    postedAt: new Date("2024-05-21T09:00:00Z"),
    isReferral: true,
    employeeId: "user-3",
  },
  {
    id: "job-4",
    title: "UX/UI Designer",
    companyName: "Innovate Inc.",
    companyLogoUrl: "https://picsum.photos/id/20/100/100",
    location: "San Francisco, CA",
    type: "Contract",
    description: "We need a talented UX/UI Designer for a 6-month contract to help redesign our flagship product.",
    postedAt: new Date("2024-05-19T11:00:00Z"),
    recruiterId: "user-2",
  },
  {
    id: "job-5",
    title: "Backend Developer (Referral)",
    companyName: "Data Insights Co.",
    companyLogoUrl: "https://picsum.photos/id/40/100/100",
    location: "Remote",
    type: "Full-time",
    description: "Experienced with Node.js and GraphQL? Join our growing backend team and build scalable services.",
    postedAt: new Date("2024-05-22T16:00:00Z"),
    isReferral: true,
    employeeId: "user-3",
  },
];

const applicationsData: Application[] = [
  {
    id: "app-1",
    jobId: "job-1",
    jobTitle: "Senior Frontend Engineer",
    companyName: "Innovate Inc.",
    userId: "user-1",
    status: "In Review",
    appliedAt: new Date("2024-05-21T10:00:00Z"),
  },
  {
    id: "app-2",
    jobId: "job-2",
    jobTitle: "Product Manager",
    companyName: "Creative Solutions",
    userId: "user-1",
    status: "Applied",
    appliedAt: new Date("2024-05-19T15:00:00Z"),
  },
];

export async function getDb() {
    if (!db) {
        db = await open({
            filename: './file.db',
            driver: sqlite3.Database
        });

        await db.exec('PRAGMA journal_mode = WAL;');

        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'jobs', 'applications')");

        if (tables.length < 3) {
            await db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    email TEXT,
                    avatarUrl TEXT,
                    role TEXT,
                    headline TEXT
                );

                CREATE TABLE IF NOT EXISTS jobs (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    companyName TEXT,
                    companyLogoUrl TEXT,
                    location TEXT,
                    type TEXT,
                    salary TEXT,
                    description TEXT,
                    postedAt TEXT,
                    isReferral BOOLEAN,
                    recruiterId TEXT,
                    employeeId TEXT,
                    vacancies INTEGER,
                    contactEmail TEXT,
                    contactPhone TEXT
                );

                CREATE TABLE IF NOT EXISTS applications (
                    id TEXT PRIMARY KEY,
                    jobId TEXT,
                    jobTitle TEXT,
                    companyName TEXT,
                    userId TEXT,
                    status TEXT,
                    appliedAt TEXT
                );
            `);

            const userStmt = await db.prepare('INSERT INTO users (id, name, email, avatarUrl, role, headline) VALUES (?, ?, ?, ?, ?, ?)');
            for (const user of usersData) {
                await userStmt.run(user.id, user.name, user.email, user.avatarUrl, user.role, user.headline);
            }
            await userStmt.finalize();

            const jobStmt = await db.prepare('INSERT INTO jobs (id, title, companyName, companyLogoUrl, location, type, salary, description, postedAt, isReferral, recruiterId, employeeId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            for (const job of jobsData) {
                await jobStmt.run(job.id, job.title, job.companyName, job.companyLogoUrl, job.location, job.type, job.salary, job.description, (job.postedAt as Date).toISOString(), job.isReferral, job.recruiterId, job.employeeId);
            }
            await jobStmt.finalize();

            const appStmt = await db.prepare('INSERT INTO applications (id, jobId, jobTitle, companyName, userId, status, appliedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
            for (const app of applicationsData) {
                await appStmt.run(app.id, app.jobId, app.jobTitle, app.companyName, app.userId, app.status, (app.appliedAt as Date).toISOString());
            }
            await appStmt.finalize();
        }
    }
    return db;
}
