import { UUID } from "crypto";

type ApplicationStatus = 'Pending' | 'In Process' | 'Hired' | 'Rejected';

interface Application {
  id?: UUID;
  job_id: UUID; 
  candidate_id: UUID;
  applied_at: Date; 
  status: ApplicationStatus;
  updated_by: UUID;
  updated_at: EpochTimeStamp;
  notes: object;
  selection_pipeline_id?: UUID;
}

export {
    Application,
    ApplicationStatus
}