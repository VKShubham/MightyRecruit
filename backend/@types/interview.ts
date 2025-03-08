export enum Interview_result {
    Pass = "Pass",
    Fail = "Fail"
}

export enum interview_status {
    Ongoing = "Ongoing",
    Rescheduled = "Rescheduled",
    Scheduled = "Scheduled",
    UnderReview = "Under Review",
    Cancelled = "Cancelled",
    Completed = "Completed"
}

export type InterviewData = {
    id?: string;
    application_id: string;
    interviewer_id: string;
    candidate_id: string;
    result: Interview_result;
    feedback?: string;
    created_at?:string;
    created_by?:string;
    scheduled_at: string;
    meeting_link: string;
    status: interview_status;
    status_change_reason?: string;
    selection_pipeline_id?: string;
    stage_name?: string;
    updated_by?: string;
    updated_at?: string;
  }

export type UpdateInterviewData = {
    interview_id: string;
    interviewer_id?: string;
    scheduled_at?: string;
    meeting_link?: string;
    status_change_reason: string;
  }