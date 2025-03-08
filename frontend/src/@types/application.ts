import { Job } from "./job";

export enum Application_status {
    Pending = 'Pending',
    InProcess = 'In Process',
    Rejected = 'Rejected',
    Hired = 'Hired'
}


interface Note {
    created_at?: string;
    created_by?: string;
    notes: string;
    result?: string;
    title?: string;
  }

export interface Application {
    id: string;
    job_id: string;
    candidate_id: string;
    applied_at: string;
    jobdetail: Job;
    status: Application_status;
    updated_by: string;
    updated_at: string;
    selection_pipeline_id?: string;
    notes?: Note[];
}