
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Since users don't have a createdAt, we can't filter them by date yet.
    // This would require a schema change. We will filter jobs and applications.
    
    let jobDateCondition = '';
    const jobParams: string[] = [];
    if(from && to) {
      jobDateCondition = 'WHERE j.postedAt >= ? AND j.postedAt <= ?';
      jobParams.push(from, to);
    }
    
    let appDateCondition = '';
    const appParams: string[] = [];
    if(from && to) {
      appDateCondition = 'WHERE a.appliedAt >= ? AND a.appliedAt <= ?';
      appParams.push(from, to);
    }

    const [
      totalUsersResult,
      totalJobsResult,
      totalApplicationsResult,
      jobsByDomainResult,
      usersByDomainResult,
      applicationsByDomainResult,
    ] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM users'), // Not filtered by date
      db.get(`SELECT COUNT(*) as count FROM jobs j ${jobDateCondition}`, ...jobParams),
      db.get(`SELECT COUNT(*) as count FROM applications a ${appDateCondition}`, ...appParams),
      db.all(`
        SELECT d.name, COUNT(j.id) as value
        FROM domains d
        LEFT JOIN jobs j ON d.id = j.domainId
        ${jobDateCondition}
        GROUP BY d.name
        HAVING value > 0
        ORDER BY value DESC
      `, ...jobParams),
      db.all(`
        SELECT d.name, COUNT(u.id) as value
        FROM domains d
        LEFT JOIN users u ON d.id = u.domainId
        GROUP BY d.name
        HAVING value > 0
        ORDER BY value DESC
      `), // Not filtered by date
      db.all(`
        SELECT d.name, COUNT(a.id) as value
        FROM domains d
        LEFT JOIN jobs j ON d.id = j.domainId
        LEFT JOIN applications a ON j.id = a.jobId
        ${appDateCondition.replace('a.appliedAt', 'a.appliedAt')}
        GROUP BY d.name
        HAVING value > 0
        ORDER BY value DESC
      `, ...appParams),
    ]);

    const analyticsData = {
      totalUsers: totalUsersResult.count,
      totalJobs: totalJobsResult.count,
      totalApplications: totalApplicationsResult.count,
      jobsByDomain: jobsByDomainResult,
      usersByDomain: usersByDomainResult,
      applicationsByDomain: applicationsByDomainResult,
    };
    
    return NextResponse.json(analyticsData);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
