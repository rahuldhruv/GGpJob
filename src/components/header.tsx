
"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  Settings,
  User,
  LogOut,
  LogIn,
  UserPlus,
  LayoutGrid,
  Search,
  Menu
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const { user, setUser } = useUser();
  const router = useRouter();

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
    router.push(`/jobs?search=${searchQuery}`);
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
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <BriefcaseBusiness className="h-6 w-6 text-primary" />
                        <span className="text-lg">GGP Portal</span>
                    </Link>
                    <Link href="/" className="text-muted-foreground hover:text-foreground">
                        Dashboard
                    </Link>
                    {user?.role === 'Job Seeker' && (
                        <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
                            Jobs
                        </Link>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
        <Link href="/" className="hidden md:flex items-center gap-2 font-semibold whitespace-nowrap">
            <BriefcaseBusiness className="h-6 w-6 text-primary" />
            <span className="text-lg">GGP Portal</span>
        </Link>
      </div>


      <nav className="ml-6 hidden md:flex items-center gap-6 text-sm font-medium">
        <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
          Dashboard
        </Link>
        {user?.role === 'Job Seeker' && (
            <Link href="/jobs" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Jobs
            </Link>
        )}
      </nav>

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        {user?.role !== 'Recruiter' && (
         <form onSubmit={handleSearch} className="ml-auto flex-1 sm:flex-initial">
           <div className="relative">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               type="search"
               name="search"
               placeholder="Search jobs..."
               className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
             />
           </div>
         </form>
        )}
        <div className="ml-auto flex items-center gap-2">
           {user ? (
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
          ) : (
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
          )}
        </div>
      </div>
    </header>
  );
}
