import { UUID } from "crypto";

// Enum for job status
type JobStatus = 'Open' | 'Closed';

// Enum for shift type
type ShiftType = 'Full Time' | 'Part Time';

// Enum for work mode
type WorkMode = 'Work From Home' | 'On-site' | 'Hybrid';

interface Job {
    id: UUID;
    title: string;
    description?: string;
    requirements?: string;
    department: string;
    work_expierence: string;
    status: JobStatus;
    created_by?: UUID; 
    created_at?: EpochTimeStamp;
    updated_at: EpochTimeStamp;
    salary_range: string;
    shift_type: ShiftType;
    city: string;
    state: string;
    country: string;
    work_mode: WorkMode;
    updated_by?: UUID;
    total_vacancy: string;
    total_hired: string;
    selection_process: Array<Object>;
}

export {
    JobStatus,
    Job,
    ShiftType,
    WorkMode
}