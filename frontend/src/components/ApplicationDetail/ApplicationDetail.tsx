import { Application } from "@/@types/application";
import { getApplicationDetails } from "@/service/ApplicationService";
import { formatDate } from "@/util/date";
import { useQuery } from "@tanstack/react-query";
import { Check, FileText, UserCircle } from "lucide-react";
import InfoComponent from "../custom/InfoComponet";
import ApplicationDetailsSkeleton from "../Skeletons/ApplicationDetailsSkeleton";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader } from "../ui/card";

interface ApplicationDetailProps {
  row: {
    original: any;
  };
}

interface ApplicationData extends Application{
  nextStage?: string;
}

const ApplicationDetail = ({row} : ApplicationDetailProps) => {

  // get application details
  const { data, isLoading, error } = useQuery({
    queryKey: [`getApplicationDetails${row.original.application_id}`],
    queryFn: () => getApplicationDetails(row.original.application_id),
    enabled: !!row.original.application_id
  })

  // it show skeleton while data is loading
  if(isLoading) {
    return <ApplicationDetailsSkeleton />
  }

  // if error comes in any situation
  if (error) {
    return <InfoComponent type="error" message="Please try again later" title="Failed to load application details" />;
  }

  // destructure the Application Data
  const applicationData:ApplicationData = data?.data?.data;

  // if candidate data not comes in any situation
  if (!applicationData) {
    return <InfoComponent type="error" message="No data available" title="Application not found" />;
  }

  return (
    <div>
        <Card className="w-full mx-auto">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-[16px] md:text-2xl font-semibold">Application Status</h2>
                <p className="text-sm text-gray-500">
                  Applied on {formatDate(applicationData.applied_at)}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <Badge variant={`${applicationData.status === 'Hired' ? "success" : applicationData.status === 'Rejected' ? 'destructive' : 'pending'}`}>
                  {applicationData.status}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6 p-2 md:p-6">
            <div className="relative">
              {/* Application submission entry */}
              <div className="flex mb-8 relative">
                <div className="absolute left-6 top-8 w-0.5 h-full" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 md:w-12 md:h-12">
                    <FileText className="w-5 h-5 text-purple-600 md:w-6 md:h-6" />
                  </div>
                </div>
                <div className="ml-2 flex-1 md:ml-6">
                  <div className="p-3 rounded-lg shadow-sm border md:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold md:text-lg">Application Submitted</h3>
                      <span className="text-xs text-gray-500 md:text-sm">
                        {formatDate(applicationData.applied_at)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Initial Application
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {applicationData.notes?.map((note, index) => (
                <div key={index} className="flex mb-8 relative">
                  {applicationData.notes && index !== applicationData.notes.length - 1 && (
                    <div className="absolute left-6 top-8 w-0.5 h-full " />
                  )}
                  
                  <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-green-100 md:w-12 md:h-12`}>
                      <Check className="w-4 h-4 text-green-600 md:w-6 md:h-6" />
                  </div>
                  </div>

                  <div className="ml-2 flex-1 md:ml-6">
                    <div className="rounded-lg p-3 shadow-sm border">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold md:text-lg">
                          {note.title || "Initial Screening"}
                        </h3>
                        <span className="text-xs text-gray-500 md:text-sm">
                          {formatDate(note.created_at || '')}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{note.notes}</p>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <UserCircle className="w-4 h-4 mr-1" />
                        <span>{note.created_by || ''}</span>
                        {note.result && (
                          <span className={`ml-4 px-2 py-1 rounded-full text-xs font-medium ${note.result === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {note.result}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

export default ApplicationDetail