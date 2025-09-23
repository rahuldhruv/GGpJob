
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    let dateCondition = '';
    const params: string[] = [];

    if (from && to) {
      dateCondition = 'WHERE createdAt >= ? AND createdAt <= ?';
      params.push(from, to);
    }

    // Since users don't have a createdAt, we can't filter them by date yet.
    // This would require a schema change. We will filter jobs and applications.
    
    let jobDateCondition = '';
    const jobParams: string[] = [];
    if(from && to) {
      jobDateCondition = 'WHERE postedAt >= ? AND postedAt <= ?';
      jobParams.push(from, to);
    }
    
    let appDateCondition = '';
    const appParams: string[] = [];
    if(from && to) {
      appDateCondition = 'WHERE appliedAt >= ? AND appliedAt <= ?';
      appParams.push(from, to);
    }

    const [
      totalUsersResult,
      totalJobsResult,
      totalApplicationsResult,
      jobsByDomainResult,
    ] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM users'), // Not filtered by date for now
      db.get(`SELECT COUNT(*) as count FROM jobs ${jobDateCondition}`, ...jobParams),
      db.get(`SELECT COUNT(*) as count FROM applications ${appDateCondition}`, ...appParams),
      db.all(`
        SELECT d.name, COUNT(j.id) as value
        FROM domains d
        JOIN jobs j ON d.id = j.domainId
        ${jobDateCondition}
        GROUP BY d.name
        HAVING value > 0
        ORDER BY value DESC
      `, ...jobParams),
    ]);

    const analyticsData = {
      totalUsers: totalUsersResult.count,
      totalJobs: totalJobsResult.count,
      totalApplications: totalApplicationsResult.count,
      jobsByDomain: jobsByDomainResult,
    };
    
    return NextResponse.json(analyticsData);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
