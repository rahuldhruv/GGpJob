
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";

export default function JobDetailsLoading() {
    return (
        <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <Skeleton className="h-8 w-3/4 mb-2" />
                                    <Skeleton className="h-6 w-1/2" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                                        <Skeleton className="h-5 w-5 mt-1 rounded-full"/>
                                        <div className="space-y-1">
                                            <Skeleton className="h-3 w-16" />
                                            <Skeleton className="h-5 w-24" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <Skeleton className="h-6 w-48 mb-4 mt-6" />
                            <div className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/6" />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-11 w-full" />
                        </CardFooter>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                     <Card>
                        <CardHeader>
                           <Skeleton className="h-7 w-3/4" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                    </Card>
                    <div>
                        <Skeleton className="h-8 w-40 mb-4" />
                        <div className="space-y-4">
                           {[...Array(3)].map((_, i) => (
                               <Card key={i}>
                                   <CardHeader>
                                       <Skeleton className="h-5 w-3/4" />
                                       <Skeleton className="h-4 w-1/2" />
                                   </CardHeader>
                                   <CardContent className="space-y-2">
                                       <Skeleton className="h-4 w-full" />
                                       <Skeleton className="h-4 w-5/6" />
                                   </CardContent>
                                    <CardFooter className="flex justify-between items-center">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-8 w-24" />
                                    </CardFooter>
                               </Card>
                           ))}
                        </div>
                    </div>
                </div>
            </div>
       </div>
    );
}
