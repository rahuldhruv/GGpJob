
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import type { User, Job, Application, Domain } from './types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const saltRounds = 10;

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

const usersData: Omit<User, 'id' | 'password'> & { passwordPlain: string }[] = [
  { firstName: "Alice", lastName: "Johnson", name: "Alice Johnson", email: "alice@example.com", role: "Job Seeker", headline: "Frontend Developer", phone: "111-222-3333", passwordPlain: "password123" },
  { firstName: "Bob", lastName: "Williams", name: "Bob Williams", email: "bob@example.com", role: "Recruiter", phone: "222-333-4444", passwordPlain: "password123" },
  { firstName: "Charlie", lastName: "Brown", name: "Charlie Brown", email: "charlie@example.com", role: "Employee", phone: "333-444-5555", passwordPlain: "password123" },
  { firstName: "Super", lastName: "Admin", name: "Super Admin", email: "admin@gmail.com", role: "Super Admin", phone: "444-555-6666", passwordPlain: "admin123", headline: "Platform Administrator" },
];

const jobsData: Omit<Job, 'id' | 'postedAt'>[] = [
  {
    title: "Senior Frontend Engineer",
    companyName: "Innovate Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$150,000 - $180,000",
    description: "Innovate Inc. is seeking a Senior Frontend Engineer to build and maintain our cutting-edge web applications using React and TypeScript.",
    recruiterId: 2,
    experienceLevel: "Senior Level",
    domain: "Software Engineering",
    vacancies: 1,
    contactEmail: "recruiter@innovate.com",
    contactPhone: "123-456-7890",
  },
  {
    title: "Product Manager",
    companyName: "Creative Solutions",
    location: "New York, NY",
    type: "Full-time",
    description: "Creative Solutions is looking for a Product Manager to lead the development of our new suite of design tools.",
    recruiterId: 2,
    experienceLevel: "Mid Level",
    domain: "Product Management",
     vacancies: 1,
    contactEmail: "recruiter@creative.com",
    contactPhone: "123-456-7890",
  },
  {
    title: "Data Scientist (Referral)",
    companyName: "Data Insights Co.",
    location: "Remote",
    type: "Full-time",
    salary: "$130,000 - $160,000",
    description: "Join our data science team and work on challenging problems in machine learning and data analysis.",
    isReferral: true,
    employeeId: 3,
    experienceLevel: "Mid Level",
    domain: "Data Science",
     vacancies: 1,
    contactEmail: "referrals@data-insights.com",
    contactPhone: "123-456-7890",
  },
  {
    title: "UX/UI Designer",
    companyName: "Innovate Inc.",
    location: "San Francisco, CA",
    type: "Contract",
    description: "We need a talented UX/UI Designer for a 6-month contract to help redesign our flagship product.",
    recruiterId: 2,
    experienceLevel: "Entry Level",
    domain: "Design",
     vacancies: 1,
    contactEmail: "recruiter@innovate.com",
    contactPhone: "123-456-7890",
  },
  {
    title: "Backend Developer (Referral)",
    companyName: "Data Insights Co.",
    location: "Austin, TX",
    type: "Full-time",
    description: "Experienced with Node.js and GraphQL? Join our growing backend team and build scalable services.",
    isReferral: true,
    employeeId: 3,
    experienceLevel: "Senior Level",
    domain: "Software Engineering",
     vacancies: 1,
    contactEmail: "referrals@data-insights.com",
    contactPhone: "123-456-7890",
  },
];

const applicationsData: Omit<Application, 'id' | 'appliedAt' | 'jobId'>[] = [
  {
    jobTitle: "Senior Frontend Engineer",
    companyName: "Innovate Inc.",
    userId: 1,
    status: "In Review",
  },
  {
    jobTitle: "Product Manager",
    companyName: "Creative Solutions",
    userId: 1,
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
    }

    await db.exec('PRAGMA journal_mode = WAL;');
    await db.exec('PRAGMA foreign_keys = ON;');

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            firstName TEXT,
            lastName TEXT,
            name TEXT,
            email TEXT UNIQUE,
            phone TEXT UNIQUE,
            role TEXT,
            headline TEXT,
            password TEXT
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
            domain TEXT,
            isReferral BOOLEAN,
            recruiterId INTEGER,
            employeeId INTEGER,
            vacancies INTEGER,
            contactEmail TEXT,
            contactPhone TEXT,
            FOREIGN KEY(recruiterId) REFERENCES users(id) ON DELETE SET NULL,
            FOREIGN KEY(employeeId) REFERENCES users(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            jobId TEXT,
            jobTitle TEXT,
            companyName TEXT,
            userId INTEGER,
            status TEXT,
            appliedAt TEXT,
            FOREIGN KEY(jobId) REFERENCES jobs(id) ON DELETE CASCADE,
            FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS domains (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
        );
    `);

    const userStmt = await db.prepare('INSERT INTO users (firstName, lastName, name, email, role, headline, phone, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    for (const user of usersData) {
        const hashedPassword = await bcrypt.hash(user.passwordPlain, saltRounds);
        await userStmt.run(user.firstName, user.lastName, user.name, user.email, user.role, user.headline, user.phone, hashedPassword);
    }
    await userStmt.finalize();

    const jobStmt = await db.prepare('INSERT INTO jobs (id, title, companyName, location, type, salary, description, postedAt, experienceLevel, domain, isReferral, recruiterId, employeeId, vacancies, contactEmail, contactPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const jobIds: { [key: string]: string } = {};
    for (const [index, job] of jobsData.entries()) {
        const newId = `job-${index + 1}`;
        jobIds[job.title] = newId;
        const postedAt = new Date(Date.now() - (index + 1) * 2 * 24 * 60 * 60 * 1000).toISOString();
        await jobStmt.run(newId, job.title, job.companyName, job.location, job.type, job.salary, job.description, postedAt, job.experienceLevel, job.domain, job.isReferral, job.recruiterId, job.employeeId, job.vacancies, job.contactEmail, job.contactPhone);
    }
    await jobStmt.finalize();

    const appStmt = await db.prepare('INSERT INTO applications (id, jobId, jobTitle, companyName, userId, status, appliedAt) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const [index, app] of applicationsData.entries()) {
        const newId = `app-${index + 1}`;
        const jobId = jobIds[app.jobTitle];
        if (jobId) {
            const appliedAt = new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString();
            await appStmt.run(newId, jobId, app.jobTitle, app.companyName, app.userId, app.status, appliedAt);
        }
    }
    await appStmt.finalize();

    const domainStmt = await db.prepare('INSERT INTO domains (id, name) VALUES (?, ?)');
    for (const domain of domainsData) {
        await domainStmt.run(uuidv4(), domain.name);
    }
    await domainStmt.finalize();
    
    return db;
}
