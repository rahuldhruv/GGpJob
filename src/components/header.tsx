

"use client"

import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  BriefcaseBusiness,
  Settings,
  User,
  LogOut,
  LogIn,
  UserPlus,
  LayoutGrid,
  Search,
  Menu,
  SlidersHorizontal,
  MessageSquareQuote
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
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useUser } from "@/contexts/user-context";
import { Sheet, SheetContent, SheetClose, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "./ui/separator";
import { JobFilters } from "./job-filters";
import { useEffect, useState } from "react";

export default function Header() {
  const { user, setUser, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const isJobSearchPage = pathname === '/jobs';

  const handleLogout = () => {
    setUser(null);
    router.push('/login');
  };
  
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get("search") as string;
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('search', searchQuery);
    router.push(`/jobs?${newParams.toString()}`);
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 sm:px-6">
       <div className="flex items-center gap-4">
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
                    {isClient && !loading && user && (
                      <SheetClose asChild>
                          <Link href="/" className="text-muted-foreground hover:text-foreground">
                              Dashboard
                          </Link>
                      </SheetClose>
                    )}
                    {isClient && !loading && user?.role === 'Job Seeker' && (
                        <SheetClose asChild>
                            <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
                                Jobs
                            </Link>
                        </SheetClose>
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
                             {user.role === 'Job Seeker' && (
                                <SheetClose asChild>
                                    <Link href="/applications" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
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
        <Link href="/" className="hidden md:flex items-center gap-2 font-semibold whitespace-nowrap">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />
            <span className="text-lg">GGP Portal</span>
        </Link>
      </div>


      <nav className="ml-6 hidden md:flex items-center gap-6 text-sm font-medium">
        {isClient && !loading && user && (
          <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
            Dashboard
          </Link>
        )}
        {isClient && !loading && user?.role === 'Job Seeker' && (
            <Link href="/jobs" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Jobs
            </Link>
        )}
      </nav>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {isClient && !loading && user && user?.role !== 'Recruiter' && (
         <form onSubmit={handleSearch} className="ml-auto flex-1 sm:flex-initial">
           <div className="relative">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               name="search"
               placeholder="Search jobs..."
               className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
               defaultValue={searchParams.get('search') || ''}
             />
           </div>
         </form>
        )}
        <div className="ml-auto flex items-center gap-2">
           {isClient && !loading && isJobSearchPage && (
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open filters</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle className="sr-only">Job Filters</SheetTitle>
                    </SheetHeader>
                    <JobFilters isSheet={true} />
                  </SheetContent>
                </Sheet>
              </div>
           )}
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
                <>
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
                </>
             )
          )}
        </div>
      </div>
    </header>
  );
}
