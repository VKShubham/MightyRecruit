// import cron from 'node-cron';
// import pool from '../config/db';
// import { isTodaydate } from './moment';
// import sendMail from './mailer';
// import { CandidateInterviewLinkTemplate, InterviewLinkTemplate } from './mail_template';

// async function getInterviews() {
//   const query = `
//     SELECT i.*, 
//            u.email AS interviewer_email, 
//            u.username AS interviewer_name, 
//            c.lastname AS candidate_lastname, 
//            cu.email AS candidate_email,
//            j.title AS job_title, 
//            sp.stage_name 
//     FROM interviews i
//     JOIN users u ON u.id = i.interviewer_id
//     JOIN applications a ON a.id = i.application_id
//     JOIN candidate c ON c.id = a.candidate_id
//     JOIN users cu ON cu.id = c.userid
//     JOIN jobs j ON j.id = a.job_id
//     JOIN selection_pipeline sp ON sp.id = i.selection_pipeline_id
//     WHERE i.status NOT IN ('Completed', 'Cancelled', 'Under Review')
//   `;

//   const { rows } = await pool.query(query);
//   return rows;
// }

// async function sendInterviewEmails(interview: any) {
//   if (!isTodaydate(interview.scheduled_at)) return;
  
//   const interviewerLink = `http://localhost:5173/interview/${interview.id}`;
  
//   await sendMail(
//     interview.interviewer_email,
//     'Interview Details',
//     InterviewLinkTemplate(
//       interview.interviewer_name,
//       interview.candidate_lastname,
//       interviewerLink,
//       interview.scheduled_at,
//       interview.job_title,
//       interview.stage_name
//     )
//   );

//   await sendMail(
//     interview.candidate_email,
//     'Meeting Link',
//     CandidateInterviewLinkTemplate(
//       interview.candidate_lastname,
//       interview.meeting_link,
//       interview.scheduled_at,
//       interview.job_title,
//       interview.stage_name
//     )
//   );
// }

// cron.schedule('00 08 * * 1-6', async () => {
//   const interviews = await getInterviews();
  
//   for (const interview of interviews) {
//     await sendInterviewEmails(interview);
//   }
// });
