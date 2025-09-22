
"use client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}
