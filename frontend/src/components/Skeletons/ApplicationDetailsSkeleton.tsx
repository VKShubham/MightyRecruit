import { Card, CardContent } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

const ApplicationDetailsSkeleton = () => {
  return (
    <div>
        <Card className="w-full h-full mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-3/4 h-8" />
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="w-full h-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApplicationDetailsSkeleton