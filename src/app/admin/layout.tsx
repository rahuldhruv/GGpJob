
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Building, Layers, UserCog } from "lucide-react";
import { useUser } from "@/contexts/user-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { href: "/admin/users", label: "Manage Users", icon: UserCog },
    { href: "/admin/jobs", label: "Manage Jobs", icon: Briefcase },
    { href: "/admin/domains", label: "Manage Domains", icon: Layers },
    ...(user?.role === 'Super Admin'
      ? [{ href: "/admin/feedback", label: "Platform Feedback", icon: Building }]
      : []),
  ];

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8">
        <aside>
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  pathname === item.href
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
