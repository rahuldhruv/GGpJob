
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import type { User, Job, Application, Domain } from '@/lib/types';

// Helper function to create a map from an array of documents
const createMap = (docs: any[], key = 'id') => {
    const map = new Map();
    for (const doc of docs) {
        map.set(doc[key], doc);
    }
    return map;
};


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from') ? new Date(searchParams.get('from') as string) : null;
    const toDate = searchParams.get('to') ? new Date(searchParams.get('to') as string) : null;

    // Fetch all necessary data in parallel
    const [usersSnap, jobsSnap, applicationsSnap, domainsSnap] = await Promise.all([
        db.collection('users').get(),
        db.collection('jobs').get(),
        db.collection('applications').get(),
        db.collection('domains').get()
    ]);

    const allUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[];
    let allJobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[];
    let allApplications = applicationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Application[];
    const domains = domainsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Domain[];

    // Create a map for quick domain name lookup
    const domainMap = createMap(domains);

    // Filter by date range if provided
    if (fromDate && toDate) {
        allJobs = allJobs.filter(job => {
            const postedAt = new Date(job.postedAt);
            return postedAt >= fromDate && postedAt <= toDate;
        });
        allApplications = allApplications.filter(app => {
            const appliedAt = app.appliedAt instanceof Date ? app.appliedAt : new Date(app.appliedAt);
            return appliedAt >= fromDate && appliedAt <= toDate;
        });
    }

    // 1. User role counts
    const totalJobSeekers = allUsers.filter(u => u.role === 'Job Seeker').length;
    const totalRecruiters = allUsers.filter(u => u.role === 'Recruiter').length;
    const totalEmployees = allUsers.filter(u => u.role === 'Employee').length;

    // 2. Job type counts
    const totalDirectJobs = allJobs.filter(j => !j.isReferral).length;
    const totalReferralJobs = allJobs.filter(j => j.isReferral).length;
    
    // 3. Total applications
    const totalApplications = allApplications.length;

    // 4. Group by domain functions
    const groupByDomain = (items: any[], domainIdField: string) => {
        const counts: { [key: string]: number } = {};
        for (const item of items) {
            const domainId = item[domainIdField];
            if (domainId) {
                const domainName = domainMap.get(String(domainId))?.name || 'Other';
                counts[domainName] = (counts[domainName] || 0) + 1;
            }
        }
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };
    
    // 5. Jobs by domain
    const directJobsByDomain = groupByDomain(allJobs.filter(j => !j.isReferral), 'domainId');
    const referralJobsByDomain = groupByDomain(allJobs.filter(j => j.isReferral), 'domainId');

    // 6. Users by domain
    const usersByDomain = groupByDomain(allUsers.filter(u => u.role === 'Job Seeker'), 'domainId');
    
    // 7. Applications by domain
    // To do this, we need to map applications to jobs to find the domain.
    const jobsMap = createMap(allJobs);
    const applicationsWithDomain = allApplications.map(app => {
        const job = jobsMap.get(app.jobId);
        return { ...app, domainId: job?.domainId };
    });
    const applicationsByDomain = groupByDomain(applicationsWithDomain, 'domainId');


    const analyticsData = {
      totalJobSeekers,
      totalRecruiters,
      totalEmployees,
      totalDirectJobs,
      totalReferralJobs,
      totalApplications,
      directJobsByDomain,
      referralJobsByDomain,
      usersByDomain,
      applicationsByDomain,
    };
    
    return NextResponse.json(analyticsData);
  } catch (e: any) {
    console.error('[API_ANALYTICS] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch analytics data', details: e.message }, { status: 500 });
  }
}
