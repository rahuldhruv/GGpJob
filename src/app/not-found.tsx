"use client"

import { Suspense } from 'react';
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function NotFoundContent() {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-4xl">404</CardTitle>
                    <CardDescription>Page Not Found</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>Sorry, we couldn’t find the page you’re looking for.</p>
                    <Button asChild>
                        <Link href="/">Go to Homepage</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}


export default function NotFound() {
    return (
        <Suspense>
            <NotFoundContent />
        </Suspense>
    )
}
