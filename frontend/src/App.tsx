import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import CreateJob from './components/CreateJob/CreateJob'
import HRDashboard from './components/HRDashboard/HRDashboard'
import InterviewerFeedback from './components/InterviewerFeedback/InterviewerFeedback'
import JobApplications from './components/JobApplications/JobApplications'
import JobDetails from './components/JobDetail/JobDetail'
import JobList from './components/JobList/JobList'
import Login from './components/Login/Login'
import ManageApplications from './components/ManageApplications/ManageApplications'
import ManageBadges from './components/ManageBadges/ManageBadges'
import ManageInterViewers from './components/ManageInterViewers/ManageInterViewers'
import ManageInterviews from './components/ManageInterviews/ManageInterviews'
import ManageJob from './components/ManageJob/ManageJob'
import Profile from './components/Profile/Profile'
import UserApplications from './components/UserApplications/UserApplications'
import NotFoundPage from './components/custom/NotFoundPage'
import Layout from './shared/Layout'

const App = () => {

  const router = createBrowserRouter([
    {
      path: '',
      element: <Layout />,
      children: [
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/login/:id',
          element: <Login />
        },
        {
          path: '/',
          element: <JobList />
        },
        {
          path: '/userApplications',
          element: <UserApplications />
        },
        {
          path: '/profile',
          element: <Profile />
        },
        {
          path: '/:id',
          element: <JobDetails />
        },
        {
          path: '/interview/:id',
          element: <InterviewerFeedback />
        },
        {
          path: '/hr',
          element: <Outlet />,
          children:[
            {
              path: '/hr/createjob',
              element: <CreateJob />
            },
            {
              path: '/hr/managejob',
              element: <ManageJob />
            },
            {
              path: '/hr/applications',
              element: <JobApplications />
            },
            {
              path: '/hr/manage-applications',
              element: <ManageApplications/>
            },
            {
              path: '/hr/manage-interviews',
              element: <ManageInterviews />
            },
            {
              path: '/hr/interviewers',
              element: <ManageInterViewers />
            },
            {
              path: '/hr/dashboard',
              element: <HRDashboard />
            },
            {
              path: '/hr/badges',
              element: <ManageBadges />
            },
          ]
        }
      ],
    },
    {
      path: '*',
      element: <NotFoundPage />
    }
  ])

  const queryclient = new QueryClient();

  return (
    <QueryClientProvider client={queryclient}>
      <RouterProvider router={router}/>
      {/* <ReactQueryDevtools initialIsOpen/> */}
    </QueryClientProvider>
  )
}

export default App