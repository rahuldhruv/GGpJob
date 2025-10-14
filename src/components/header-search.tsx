
"use client"

import { useSearchParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function HeaderSearch() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchQuery = formData.get("search") as string;
        const newParams = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            newParams.set('search', searchQuery);
        } else {
            newParams.delete('search');
        }
        router.push(`/jobs?${newParams.toString()}`);
    }

    return (
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
    )
}
