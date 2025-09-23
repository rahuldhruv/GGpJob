
import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();
    
    // Using Promise.all to fetch data concurrently
    const [
      totalUsersResult,
      totalJobsResult,
      totalApplicationsResult,
      jobsByDomainResult,
    ] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM users'),
      db.get('SELECT COUNT(*) as count FROM jobs'),
      db.get('SELECT COUNT(*) as count FROM applications'),
      db.all(`
        SELECT d.name, COUNT(j.id) as value
        FROM domains d
        JOIN jobs j ON d.id = j.domainId
        GROUP BY d.name
        HAVING value > 0
        ORDER BY value DESC
      `),
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
