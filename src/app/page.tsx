import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobSeekerDashboard from "@/components/dashboards/job-seeker-dashboard";
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard";
import EmployeeDashboard from "@/components/dashboards/employee-dashboard";
import AdminDashboard from "@/components/dashboards/admin-dashboard";
import { Briefcase, User, Users, Building, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Tabs defaultValue="job-seeker" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="job-seeker">
            <User className="mr-2 h-4 w-4" />
            Job Seeker
          </TabsTrigger>
          <TabsTrigger value="recruiter">
            <Building className="mr-2 h-4 w-4" />
            Recruiter
          </TabsTrigger>
          <TabsTrigger value="employee">
            <Briefcase className="mr-2 h-4 w-4" />
            Employee
          </TabsTrigger>
          <TabsTrigger value="admin">
            <Shield className="mr-2 h-4 w-4" />
            Admin
          </TabsTrigger>
        </TabsList>
        <TabsContent value="job-seeker">
          <JobSeekerDashboard />
        </TabsContent>
        <TabsContent value="recruiter">
          <RecruiterDashboard />
        </TabsContent>
        <TabsContent value="employee">
          <EmployeeDashboard />
        </TabsContent>
        <TabsContent value="admin">
          <AdminDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
