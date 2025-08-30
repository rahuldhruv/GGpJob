import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import type { User, Job, Application, Domain } from './types';
import { v4 as uuidv4 } from 'uuid';

let db = null;

const usersData: User[] = [
  { id: "user-1", name: "Alice Johnson", email: "alice@example.com", role: "Job Seeker", headline: "Frontend Developer" },
  { id: "user-2", name: "Bob Williams", email: "bob@example.com", role: "Recruiter" },
  { id: "user-3", name: "Charlie Brown", email: "charlie@example.com", role: "Employee" },
  { id: "user-4", name: "Diana Prince", email: "diana@example.com", role: "Admin" },
];

const jobsData: Omit<Job, 'id' | 'postedAt'>[] = [
  {
    title: "Senior Frontend Engineer",
    companyName: "Innovate Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$150,000 - $180,000",
    description: "Innovate Inc. is seeking a Senior Frontend Engineer to build and maintain our cutting-edge web applications using React and TypeScript.",
    recruiterId: "user-2",
    experienceLevel: "Senior Level",
  },
  {
    title: "Product Manager",
    companyName: "Creative Solutions",
    location: "New York, NY",
    type: "Full-time",
    description: "Creative Solutions is looking for a Product Manager to lead the development of our new suite of design tools.",
    recruiterId: "user-2",
    experienceLevel: "Mid Level",
  },
  {
    title: "Data Scientist (Referral)",
    companyName: "Data Insights Co.",
    location: "Remote",
    type: "Full-time",
    salary: "$130,000 - $160,000",
    description: "Join our data science team and work on challenging problems in machine learning and data analysis.",
    isReferral: true,
    employeeId: "user-3",
    experienceLevel: "Mid Level",
  },
  {
    title: "UX/UI Designer",
    companyName: "Innovate Inc.",
    location: "San Francisco, CA",
    type: "Contract",
    description: "We need a talented UX/UI Designer for a 6-month contract to help redesign our flagship product.",
    recruiterId: "user-2",
    experienceLevel: "Entry Level",
  },
  {
    title: "Backend Developer (Referral)",
    companyName: "Data Insights Co.",
    location: "Austin, TX",
    type: "Full-time",
    description: "Experienced with Node.js and GraphQL? Join our growing backend team and build scalable services.",
    isReferral: true,
    employeeId: "user-3",
    experienceLevel: "Senior Level",
  },
];

const applicationsData: Omit<Application, 'id' | 'appliedAt'>[] = [
  {
    jobId: "job-1",
    jobTitle: "Senior Frontend Engineer",
    companyName: "Innovate Inc.",
    userId: "user-1",
    status: "In Review",
  },
  {
    jobId: "job-2",
    jobTitle: "Product Manager",
    companyName: "Creative Solutions",
    userId: "user-1",
    status: "Applied",
  },
];

const domainsData: Omit<Domain, 'id'>[] = [
    { name: "Software Engineering" },
    { name: "Product Management" },
    { name: "Data Science" },
    { name: "Design" },
];

export async function getDb() {
    if (!db) {
        db = await open({
            filename: './file.db',
            driver: sqlite3.Database
        });

        await db.exec('PRAGMA journal_mode = WAL;');

        const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('users', 'jobs', 'applications', 'domains')");

        if (tables.length < 4) {
            await db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    name TEXT,
                    email TEXT,
                    role TEXT,
                    headline TEXT
                );

                CREATE TABLE IF NOT EXISTS jobs (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    companyName TEXT,
                    location TEXT,
                    type TEXT,
                    salary TEXT,
                    description TEXT,
                    postedAt TEXT,
                    experienceLevel TEXT,
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

                CREATE TABLE IF NOT EXISTS domains (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE
                );
            `);

            const userStmt = await db.prepare('INSERT INTO users (id, name, email, role, headline) VALUES (?, ?, ?, ?, ?)');
            for (const user of usersData) {
                await userStmt.run(user.id, user.name, user.email, user.role, user.headline);
            }
            await userStmt.finalize();

            const jobStmt = await db.prepare('INSERT INTO jobs (id, title, companyName, location, type, salary, description, postedAt, experienceLevel, isReferral, recruiterId, employeeId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            for (const [index, job] of jobsData.entries()) {
                const newId = `job-${index + 1}`;
                const postedAt = new Date(Date.now() - (index + 1) * 2 * 24 * 60 * 60 * 1000).toISOString();
                await jobStmt.run(newId, job.title, job.companyName, job.location, job.type, job.salary, job.description, postedAt, job.experienceLevel, job.isReferral, job.recruiterId, job.employeeId);
                
                // Assign jobId to applicationsData based on title
                const appToUpdate = applicationsData.find(app => app.jobTitle === job.title);
                if (appToUpdate) {
                    (appToUpdate as any).jobId = newId;
                }
            }
            await jobStmt.finalize();

            const appStmt = await db.prepare('INSERT INTO applications (id, jobId, jobTitle, companyName, userId, status, appliedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
            for (const [index, app] of applicationsData.entries()) {
                const newId = `app-${index + 1}`;
                const appliedAt = new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString();
                await appStmt.run(newId, (app as any).jobId, app.jobTitle, app.companyName, app.userId, app.status, appliedAt);
            }
            await appStmt.finalize();

            const domainStmt = await db.prepare('INSERT INTO domains (id, name) VALUES (?, ?)');
            for (const domain of domainsData) {
                await domainStmt.run(uuidv4(), domain.name);
            }
            await domainStmt.finalize();
        }
    }
    return db;
}
