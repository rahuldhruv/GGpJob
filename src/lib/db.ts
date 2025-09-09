
import * as sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import type { User, Job, Application, Domain } from './types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

const saltRounds = 10;

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

const usersData: Omit<User, 'id' | 'password'> & { passwordPlain: string }[] = [
  { firstName: "Alice", lastName: "Johnson", name: "Alice Johnson", email: "alice@example.com", role: "Job Seeker", headline: "Frontend Developer", phone: "111-222-3333", passwordPlain: "password123", locationId: 4 },
  { firstName: "Bob", lastName: "Williams", name: "Bob Williams", email: "bob@example.com", role: "Recruiter", phone: "222-333-4444", passwordPlain: "password123" },
  { firstName: "Charlie", lastName: "Brown", name: "Charlie Brown", email: "charlie@example.com", role: "Employee", phone: "333-444-5555", passwordPlain: "password123" },
  { firstName: "Super", lastName: "Admin", name: "Super Admin", email: "admin@gmail.com", role: "Super Admin", phone: "444-555-6666", passwordPlain: "admin123", headline: "Platform Administrator" },
];

const jobsData: Omit<Job, 'id' | 'postedAt'>[] = [
  {
    title: "Senior Frontend Engineer",
    companyName: "Innovate Inc.",
    locationId: 4, 
    jobTypeId: 1, 
    workplaceTypeId: 2, 
    salary: "$150,000 - $180,000",
    description: "Innovate Inc. is seeking a Senior Frontend Engineer to build and maintain our cutting-edge web applications using React and TypeScript.",
    recruiterId: 2,
    experienceLevelId: 3,
    domainId: 1, 
    vacancies: 1,
    contactEmail: "recruiter@innovate.com",
    contactPhone: "123-456-7890",
  },
  {
    title: "Product Manager",
    companyName: "Creative Solutions",
    locationId: 2,
    jobTypeId: 1, 
    workplaceTypeId: 1,
    description: "Creative Solutions is looking for a Product Manager to lead the development of our new suite of design tools.",
    recruiterId: 2,
    experienceLevelId: 2, 
    domainId: 2,
    vacancies: 1,
    contactEmail: "recruiter@creative.com",
    contactPhone: "123-456-7890",
  },
  {
    title: "Data Scientist (Referral)",
    companyName: "Data Insights Co.",
    locationId: 1, 
    jobTypeId: 1, 
    workplaceTypeId: 3, 
    salary: "$130,000 - $160,000",
    description: "Join our data science team and work on challenging problems in machine learning and data analysis.",
    isReferral: true,
    employeeId: 3,
    employeeLinkedIn: "https://linkedin.com/in/charliebrown",
    experienceLevelId: 2, 
    domainId: 3,
    vacancies: 1,
    contactEmail: "referrals@data-insights.com",
    contactPhone: "123-456-7890",
  },
  {
    title: "UX/UI Designer",
    companyName: "Innovate Inc.",
    locationId: 4, 
    jobTypeId: 3, 
    workplaceTypeId: 1, 
    description: "We need a talented UX/UI Designer for a 6-month contract to help redesign our flagship product.",
    recruiterId: 2,
    experienceLevelId: 1, 
    domainId: 4,
    vacancies: 1,
    contactEmail: "recruiter@innovate.com",
    contactPhone: "123-456-7890",
  },
  {
    title: "Backend Developer (Referral)",
    companyName: "Data Insights Co.",
    locationId: 5, 
    jobTypeId: 1,
    workplaceTypeId: 2, 
    description: "Experienced with Node.js and GraphQL? Join our growing backend team and build scalable services.",
    isReferral: true,
    employeeId: 3,
    employeeLinkedIn: "https://linkedin.com/in/charliebrown",
    experienceLevelId: 3,
    domainId: 1,
    vacancies: 1,
    contactEmail: "referrals@data-insights.com",
    contactPhone: "123-456-7890",
  },
];

const applicationsData: Omit<Application, 'id' | 'appliedAt' | 'jobId' | 'statusId'>[] = [
  { jobTitle: "Senior Frontend Engineer", companyName: "Innovate Inc.", userId: 1, statusName: "In Review" },
  { jobTitle: "Product Manager", companyName: "Creative Solutions", userId: 1, statusName: "Applied" },
];

const domainsData: Omit<Domain, ''>[] = [
  { id: 1, name: "Software Engineering" },
  { id: 2, name: "Product Management" },
  { id: 3, name: "Data Science" },
  { id: 4, name: "Design" },
  { id: 5, name: "Marketing" },
  { id: 6, name: "Sales" },
  { id: 7, name: "Human Resources" },
];

const jobTypesData = [ {id: 1, name: "Full-time"}, {id: 2, name: "Part-time"}, {id: 3, name: "Contract"}, {id: 4, name: "Internship"} ];
const workplaceTypesData = [ {id: 1, name: "On-site"}, {id: 2, name: "Hybrid"}, {id: 3, name: "Remote"} ];
const experienceLevelsData = [ {id: 1, name: "Entry Level"}, {id: 2, name: "Mid Level"}, {id: 3, name: "Senior Level"} ];
const locationsData = [
    { id: 1, name: 'Remote' },
    { id: 2, name: 'Delhi, India' },
    { id: 3, name: 'Gurgaon, India' },
    { id: 4, name: 'Mumbai, India' },
    { id: 5, name: 'Bengaluru, India' },
    { id: 6, name: 'Hyderabad, India' },
    { id: 7, name: 'Chennai, India' },
    { id: 8, name: 'Pune, India' },
    { id: 9, name: 'Kolkata, India' },
    { id: 10, name: 'Ahmedabad, India' },
    { id: 11, name: 'Jaipur, India' },
    { id: 12, name: 'Noida, India' },
    { id: 13, name: 'Chandigarh, India' },
    { id: 14, name: 'Lucknow, India' },
    { id: 15, name: 'Kochi, India' },
];
const applicationStatusesData = [
  { id: 1, name: 'Applied' },
  { id: 2, name: 'Profile Viewed' },
  { id: 3, name: 'Not Suitable' },
  { id: 4, name: 'Selected' },
];


export async function getDb() {
  if (db) return db;

  db = await open({
    filename: './file.db',
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA journal_mode = WAL;');
  await db.exec('PRAGMA foreign_keys = ON;');
  
  await db.exec('DROP TABLE IF EXISTS applications');
  await db.exec('DROP TABLE IF EXISTS jobs');
  await db.exec('DROP TABLE IF EXISTS users');
  await db.exec('DROP TABLE IF EXISTS domains');
  await db.exec('DROP TABLE IF EXISTS job_types');
  await db.exec('DROP TABLE IF EXISTS workplace_types');
  await db.exec('DROP TABLE IF EXISTS experience_levels');
  await db.exec('DROP TABLE IF EXISTS locations');
  await db.exec('DROP TABLE IF EXISTS application_statuses');


  // Create tables if not exist
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
      password TEXT,
      locationId INTEGER,
      resume TEXT,
      FOREIGN KEY(locationId) REFERENCES locations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS domains (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS job_types (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS workplace_types (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS experience_levels (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    );
    
    CREATE TABLE IF NOT EXISTS application_statuses (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT,
      companyName TEXT,
      locationId INTEGER,
      salary TEXT,
      description TEXT,
      postedAt TEXT,
      isReferral BOOLEAN,
      recruiterId INTEGER,
      employeeId INTEGER,
      employeeLinkedIn TEXT,
      vacancies INTEGER,
      contactEmail TEXT,
      contactPhone TEXT,
      jobTypeId INTEGER,
      workplaceTypeId INTEGER,
      experienceLevelId INTEGER,
      domainId INTEGER,
      FOREIGN KEY(recruiterId) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY(employeeId) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY(jobTypeId) REFERENCES job_types(id) ON DELETE SET NULL,
      FOREIGN KEY(workplaceTypeId) REFERENCES workplace_types(id) ON DELETE SET NULL,
      FOREIGN KEY(experienceLevelId) REFERENCES experience_levels(id) ON DELETE SET NULL,
      FOREIGN KEY(domainId) REFERENCES domains(id) ON DELETE SET NULL,
      FOREIGN KEY(locationId) REFERENCES locations(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      jobId TEXT,
      jobTitle TEXT,
      companyName TEXT,
      userId INTEGER,
      statusId INTEGER,
      appliedAt TEXT,
      FOREIGN KEY(jobId) REFERENCES jobs(id) ON DELETE CASCADE,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(statusId) REFERENCES application_statuses(id) ON DELETE SET NULL
    );
  `);

  // Check if already seeded
  const { count } = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if (count === 0) {
    console.log("Seeding database...");

    // Seed lookup tables
    const domainStmt = await db.prepare('INSERT INTO domains (id, name) VALUES (?, ?)');
    for (const domain of domainsData) {
      await domainStmt.run(domain.id, domain.name);
    }
    await domainStmt.finalize();
    
    const jobTypeStmt = await db.prepare('INSERT INTO job_types (id, name) VALUES (?, ?)');
    for (const type of jobTypesData) {
        await jobTypeStmt.run(type.id, type.name);
    }
    await jobTypeStmt.finalize();

    const workplaceTypeStmt = await db.prepare('INSERT INTO workplace_types (id, name) VALUES (?, ?)');
    for (const type of workplaceTypesData) {
        await workplaceTypeStmt.run(type.id, type.name);
    }
    await workplaceTypeStmt.finalize();

    const expLevelStmt = await db.prepare('INSERT INTO experience_levels (id, name) VALUES (?, ?)');
    for (const level of experienceLevelsData) {
        await expLevelStmt.run(level.id, level.name);
    }
    await expLevelStmt.finalize();

    const locationStmt = await db.prepare('INSERT INTO locations (id, name) VALUES (?, ?)');
    for (const loc of locationsData) {
        await locationStmt.run(loc.id, loc.name);
    }
    await locationStmt.finalize();

    const appStatusStmt = await db.prepare('INSERT INTO application_statuses (id, name) VALUES (?, ?)');
    for (const status of applicationStatusesData) {
        await appStatusStmt.run(status.id, status.name);
    }
    await appStatusStmt.finalize();

    // Users
    const userStmt = await db.prepare(
      'INSERT INTO users (id, firstName, lastName, name, email, role, headline, phone, password, locationId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    for (const [index, user] of usersData.entries()) {
      const hashedPassword = await bcrypt.hash(user.passwordPlain, saltRounds);
      await userStmt.run(
        index + 1,
        user.firstName,
        user.lastName,
        user.name,
        user.email,
        user.role,
        user.headline ?? null,
        user.phone,
        hashedPassword,
        user.locationId ?? null
      );
    }
    await userStmt.finalize();

    // Jobs
    const jobStmt = await db.prepare(
      'INSERT INTO jobs (id, title, companyName, locationId, salary, description, postedAt, isReferral, recruiterId, employeeId, employeeLinkedIn, vacancies, contactEmail, contactPhone, jobTypeId, workplaceTypeId, experienceLevelId, domainId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const jobIds: { [key: string]: string } = {};
    for (const [index, job] of jobsData.entries()) {
      const newId = `job-${index + 1}`;
      jobIds[job.title] = newId;
      const postedAt = new Date(Date.now() - (index + 1) * 2 * 24 * 60 * 60 * 1000).toISOString();
      await jobStmt.run(
        newId,
        job.title,
        job.companyName,
        job.locationId,
        job.salary ?? null,
        job.description,
        postedAt,
        job.isReferral ?? false,
        job.recruiterId ?? null,
        job.employeeId ?? null,
        job.employeeLinkedIn ?? null,
        job.vacancies ?? 0,
        job.contactEmail ?? null,
        job.contactPhone ?? null,
        job.jobTypeId,
        job.workplaceTypeId,
        job.experienceLevelId,
        job.domainId
      );
    }
    await jobStmt.finalize();

    // Applications
    const statusNameToId = applicationStatusesData.reduce((acc, status) => {
        acc[status.name] = status.id;
        return acc;
    }, {} as Record<string, number>);

    const appStmt = await db.prepare(
      'INSERT INTO applications (id, jobId, jobTitle, companyName, userId, statusId, appliedAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const [index, app] of applicationsData.entries()) {
      const newId = `app-${index + 1}`;
      const jobId = jobIds[app.jobTitle];
      // The status 'In Review' is not in the new list, so this will fail.
      // I'll update the seed data for applications as well.
      // 'In Review' -> 'Profile Viewed'
      const statusName = app.statusName === 'In Review' ? 'Profile Viewed' : app.statusName;
      const statusId = statusNameToId[statusName as string];
      if (jobId && statusId) {
        const appliedAt = new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString();
        await appStmt.run(newId, jobId, app.jobTitle, app.companyName, app.userId, statusId, appliedAt);
      }
    }
    await appStmt.finalize();
  }

  return db;
}

    