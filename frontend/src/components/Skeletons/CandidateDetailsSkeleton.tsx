import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

const CandidateDetailSkeleton = () => {
    return (
      <Card className="border-none shadow-xl dark:bg-gray-800 p-0">
        <CardContent className="p-0">
          {/* Header Skeleton */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 p-8 rounded-t-xl">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full dark:bg-gray-700" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48 dark:bg-gray-700" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-28 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-36 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          </div>
  
          {/* Salary Skeleton */}
          <div className="grid grid-cols-2 gap-4 p-6 bg-gray-50 dark:bg-gray-900">
            <div>
              <Skeleton className="h-4 w-24 mb-2 dark:bg-gray-700" />
              <Skeleton className="h-6 w-32 dark:bg-gray-700" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2 dark:bg-gray-700" />
              <Skeleton className="h-6 w-32 dark:bg-gray-700" />
            </div>
          </div>
  
          <div className="p-6 space-y-6">
            {/* Skills Skeleton */}
            <div>
              <Skeleton className="h-6 w-24 mb-4 dark:bg-gray-700" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-full dark:bg-gray-700" />
                ))}
              </div>
            </div>
  
            <Separator className="dark:bg-gray-700" />
  
            {/* Experience Skeleton */}
            <div>
              <Skeleton className="h-6 w-32 mb-4 dark:bg-gray-700" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-48 dark:bg-gray-700" />
                        <Skeleton className="h-4 w-36 dark:bg-gray-700" />
                      </div>
                      <Skeleton className="h-4 w-32 dark:bg-gray-700" />
                    </div>
                    <Skeleton className="h-16 w-full mt-2 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            </div>
  
            <Separator className="dark:bg-gray-700" />
  
            {/* Education Skeleton */}
            <div>
              <Skeleton className="h-6 w-32 mb-4 dark:bg-gray-700" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="pl-4 border-l-2 border-blue-200 dark:border-blue-700">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-6 w-40 dark:bg-gray-700" />
                        <Skeleton className="h-4 w-48 dark:bg-gray-700" />
                        <Skeleton className="h-4 w-32 dark:bg-gray-700" />
                      </div>
                      <Skeleton className="h-4 w-32 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
  
            <Separator className="dark:bg-gray-700" />
  
            {/* Resume Skeleton */}
            <div>
              <Skeleton className="h-6 w-24 mb-4 dark:bg-gray-700" />
              <Skeleton className="w-full h-[600px] rounded-lg dark:bg-gray-700" />
            </div>
  
            {/* Notes Skeleton */}
            <div>
              <Skeleton className="h-6 w-24 mb-4 dark:bg-gray-700" />
              <Skeleton className="w-full h-32 rounded-lg dark:bg-gray-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
};

export default CandidateDetailSkeleton;