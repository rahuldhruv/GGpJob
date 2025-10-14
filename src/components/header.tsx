
"use client"

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  Settings,
  User,
  LogOut,
  LogIn,
  UserPlus,
  LayoutGrid,
  Menu,
  SlidersHorizontal,
  MessageSquareQuote,
  ArrowLeft,
  Share2,
  Building,
  Layers,
  UserCog,
  BarChart3,
  Award,
  Network,
  MapPin
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useUser } from "@/contexts/user-context";
import { Sheet, SheetContent, SheetClose, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "./ui/separator";
import { JobFilters } from "./job-filters";
import { useEffect, useState, Suspense } from "react";
import { ShareButton } from "./share-button";
import { useIsMobile } from "@/hooks/use-mobile";
import HeaderSearch from "./header-search";

export default function Header() {
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { loading } = useUser();
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isJobSearchPage = pathname === '/jobs';
  const isJobDetailsPage = /^\/jobs\/[^/]+$/.test(pathname) && !pathname.includes('/applications');
  const isProfileSectionEditPage = /^\/profile\/(education|employment|projects|languages|skills)\/(add|edit\/[^/]+)$/.test(pathname);
  const isJobApplicationsPage = /^\/jobs\/[^/]+\/applications$/.test(pathname);
  const isPublicProfilePage = /^\/profile\/[^/]+$/.test(pathname);
  const isAdminAddPage = /^\/admin\/(users|domains|locations)\/add$/.test(pathname);
  const isAdminEditPage = /^\/admin\/(domains|locations)\/edit\/[^/]+$/.test(pathname);
  
  const getProfileSectionTitle = () => {
    if (!isProfileSectionEditPage) return '';
    const parts = pathname.split('/');
    const action = parts.includes('edit') ? 'Edit' : 'Add';
    const section = parts[2].charAt(0).toUpperCase() + parts[2].slice(1);
    const sectionName = section.endsWith('s') ? section.slice(0,-1) : section;

    return `${action} ${sectionName}`;
  }


  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  const showSearchBar = isClient && !loading && user && (
    user.role === 'Job Seeker' &&
    (pathname === '/' || pathname === '/jobs' || (pathname.startsWith('/jobs')))
  );

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/users", label: "Manage Users", icon: UserCog },
    { href: "/admin/jobs", label: "Manage Jobs", icon: BriefcaseBusiness },
    { href: "/admin/domains", label: "Manage Domains", icon: Layers },
    { href: "/admin/locations", label: "Manage Locations", icon: MapPin },
    { href: "/admin/employment-types", label: "Employment Types", icon: Network },
    { href: "/admin/workplace-types", label: "Workplace Types", icon: Building },
    { href: "/admin/experience-levels", label: "Experience Levels", icon: Award },
  ];

  if (user?.role === 'Super Admin') {
    adminNavItems.push({ href: "/admin/feedback", label: "Platform Feedback", icon: MessageSquareQuote });
  }
  
  const getMobileHeaderTitle = () => {
    if (isProfileSectionEditPage) return getProfileSectionTitle();
    if (isAdminAddPage) {
      if (pathname.includes('/users')) return 'Create New Admin';
      if (pathname.includes('/domains')) return 'Add New Domain';
      if (pathname.includes('/locations')) return 'Add New Location';
    }
    if (isAdminEditPage) {
        if(pathname.includes('/domains')) return 'Edit Domain';
        if(pathname.includes('/locations')) return 'Edit Location';
    }
    return '';
  }

  const renderMobileLeftButton = () => {
    const isRecruiterOrEmployee = user?.role === 'Recruiter' || user?.role === 'Employee';
    const showRecruiterBack = isRecruiterOrEmployee && (isJobApplicationsPage || isPublicProfilePage);

    const showBackButton = (isJobDetailsPage && user?.role === 'Job Seeker') || isProfileSectionEditPage || showRecruiterBack || (isMobile && (isAdminAddPage || isAdminEditPage));

    if (isClient && showBackButton) {
      return (
        <Button variant="outline" size="icon" className="shrink-0 md:hidden" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
        </Button>
      );
    }
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
                <nav className="grid gap-6 text-lg font-medium">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <BriefcaseBusiness className="h-6 w-6 text-primary" />
                        <span className="text-lg">GGP Portal</span>
                    </Link>
                    {isClient && !loading && user && (user.role === 'Admin' || user.role === 'Super Admin') ? (
                       <>
                        {adminNavItems.map(item => (
                           <SheetClose asChild key={item.href}>
                             <Link href={item.href} className="text-muted-foreground hover:text-foreground">
                                {item.label}
                              </Link>
                           </SheetClose>
                        ))}
                       </>
                    ) : (
                      <>
                        {isClient && !loading && user && (
                          <SheetClose asChild>
                              <Link href="/" className="text-muted-foreground hover:text-foreground">
                                  Dashboard
                              </Link>
                          </SheetClose>
                        )}
                         {isClient && !loading && user?.role === 'Job Seeker' && (
                           <>
                            <SheetClose asChild>
                                <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
                                    Jobs
                                </Link>
                            </SheetClose>
                            {user.domainId && (
                                <SheetClose asChild>
                                   <Link href={`/jobs?domain=${user.domainId}`} className="text-muted-foreground hover:text-foreground">
                                        Recommended Jobs
                                   </Link>
                                </SheetClose>
                            )}
                           </>
                        )}
                      </>
                    )}
                </nav>
                {isClient && !loading && user && (
                    <>
                        <Separator className="my-4" />
                        <nav className="grid gap-4 text-lg font-medium">
                           <div className="text-sm font-semibold text-muted-foreground px-1">My Account</div>
                            <SheetClose asChild>
                                <Link href="/profile" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                    <User className="h-5 w-5" />
                                    Profile
                                </Link>
                            </SheetClose>
                            {user.role === 'Job Seeker' && (
                                <SheetClose asChild>
                                    <Link href="/applications" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                        <LayoutGrid className="h-5 w-5" />
                                        My Applications
                                    </Link>
                                </SheetClose>
                            )}
                             {['Job Seeker', 'Recruiter', 'Employee'].includes(user.role) && (
                                <SheetClose asChild>
                                    <Link href="/feedback" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                        <MessageSquareQuote className="h-5 w-5" />
                                        Feedback
                                    </Link>
                                </SheetClose>
                            )}
                             {user.role === 'Super Admin' && (
                                <SheetClose asChild>
                                    <Link href="/" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                        <MessageSquareQuote className="h-5 w-5" />
                                        Feedback
                                    </Link>
                                </SheetClose>
                            )}
                             <SheetClose asChild>
                                <Link href="#" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                                    <Settings className="h-5 w-5" />
                                    Settings
                                </Link>
                            </SheetClose>
                        </nav>
                         <div className="mt-auto">
                            <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-lg text-muted-foreground">
                                <LogOut className="mr-3 h-5 w-5" />
                                Logout
                            </Button>
                        </div>
                    </>
                )}
                 {isClient && !loading && !user && (
                  <div className="mt-auto flex flex-col gap-2">
                     <Button asChild>
                        <Link href="/login">
                          <LogIn className="mr-2 h-4 w-4" />
                          Login
                        </Link>
                      </Button>
                      <Button asChild variant="secondary">
                        <Link href="/signup">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Sign Up
                        </Link>
                      </Button>
                  </div>
                 )}
            </SheetContent>
        </Sheet>
    );
  }

  const renderMobileRightButton = () => {
    if (isClient && isJobDetailsPage && user?.role === 'Job Seeker') {
        const jobId = pathname.split('/')[2];
        return (
            <div className="md:hidden">
                <ShareButton jobId={jobId} jobTitle={""} />
            </div>
        );
    }
     if (isClient && !loading && isJobSearchPage) {
        return (
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open filters</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80%] rounded-t-lg">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <JobFilters isSheet={true} />
                </SheetContent>
              </Sheet>
            </div>
        )
     }
     return null;
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
       <div className="flex items-center gap-4">
        {renderMobileLeftButton()}
        <Link href="/" className="hidden md:flex items-center gap-2 font-semibold whitespace-nowrap">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />
            <span className="text-lg">GGP Portal</span>
        </Link>
        {isClient && (isProfileSectionEditPage || (isMobile && (isAdminAddPage || isAdminEditPage))) && (
          <div className="md:hidden text-lg font-semibold whitespace-nowrap">
            {getMobileHeaderTitle()}
          </div>
        )}
      </div>


      <nav className="ml-6 hidden md:flex items-center gap-6 text-sm font-medium">
        {isClient && !loading && user && (user.role === 'Admin' || user.role === 'Super Admin') ? (
          <>
            {adminNavItems.map(item => (
              <Link key={item.href} href={item.href} className={`transition-colors hover:text-foreground ${pathname === item.href ? "text-foreground" : "text-foreground/60"}`}>
                {item.label}
              </Link>
            ))}
          </>
        ) : (
          <>
            {isClient && !loading && user && (
              <Link href="/" className={`transition-colors hover:text-foreground ${pathname === "/" ? "text-foreground" : "text-foreground/60"}`}>
                Dashboard
              </Link>
            )}
            {isClient && !loading && user?.role === 'Job Seeker' && (
                <Suspense>
                    <Link href="/jobs" className={`transition-colors hover:text-foreground ${pathname === "/jobs" ? "text-foreground" : "text-foreground/60"}`}>
                        Jobs
                    </Link>
                    {user.domainId && (
                         <Link href={`/jobs?domain=${user.domainId}`} className={`transition-colors hover:text-foreground ${pathname.startsWith("/jobs?domain") ? "text-foreground" : "text-foreground/60"}`}>
                            Recommended Jobs
                        </Link>
                    )}
                </Suspense>
            )}
          </>
        )}
      </nav>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {showSearchBar && (
            <Suspense fallback={null}>
                <HeaderSearch />
            </Suspense>
        )}
        <div className="ml-auto flex items-center gap-2">
           {renderMobileRightButton()}
           {isClient && !loading && user ? (
            <div className="hidden md:block">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar>
                        <AvatarFallback>{getInitials(user.firstName, user.lastName)}</AvatarFallback>
                    </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                    <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                    </DropdownMenuItem>
                    {user.role === 'Job Seeker' && (
                    <DropdownMenuItem asChild>
                        <Link href="/applications">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <span>My Applications</span>
                        </Link>
                    </DropdownMenuItem>
                    )}
                    {['Job Seeker', 'Recruiter', 'Employee'].includes(user.role) && (
                        <DropdownMenuItem asChild>
                            <Link href="/feedback">
                                <MessageSquareQuote className="mr-2 h-4 w-4" />
                                <span>Feedback</span>
                            </Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
            </div>
          ) : (
             isClient && !loading && (
                <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost">
                    <Link href="/login">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/signup">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Sign Up
                    </Link>
                </Button>
                </div>
             )
          )}
        </div>
      </div>
    </header>
  );
}
