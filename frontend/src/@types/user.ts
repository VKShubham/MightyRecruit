export enum UserRole {
    HR = 'HR',
    Candidate = 'Candidate',
    Interviewer = 'Interviewer'
}

export enum UserStatus {
    Active = 'Active',
    Blocked = 'Blocked'
}

export interface User {
    id: string,
    username: string,
    email: string,
    role: UserRole,
    created_at: string,
    updated_at: string,
    status: UserStatus
}