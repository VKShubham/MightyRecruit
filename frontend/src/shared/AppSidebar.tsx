import * as React from "react";

import { useUser } from "@/app/store";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import Application from "/application.svg";
import CreateBadge from "/badge-create.svg";
import Dashboard from "/data-governance.svg";
import ManageApplications from "/feature-selection.svg";
import Briefcase from "/hand-bag.svg";
import JobInterview from "/job-interview.svg";
import Management from "/management.svg";
import Plus from "/plus.svg";
import User from "/user.svg";



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  // Navigation items grouped by section with colors
  const NAV_ITEMS = {
    candidate: [
      { 
        name: 'Current Openings', 
        icon: Briefcase, 
        path: '/',
        roles: ["Candidate"],
        color: "#4f46e5"
      },
      { 
        name: 'Your Profile', 
        icon: User, 
        path: '/profile',
        roles: ['Candidate'],
        color: "#0ea5e9" 
      },
      { 
        name: 'Your Applications', 
        icon: Dashboard, 
        path: '/userApplications',
        roles: ["Candidate"],
        color: "#10b981" 
      },
    ],
    hr: [
      { 
        name: 'Dashboard', 
        icon: Dashboard, 
        path: '/hr/dashboard',
        roles: ['HR'],
        color: "#6366f1" 
      },
      { 
        name: 'Create Job', 
        icon: Plus, 
        path: '/hr/createjob',
        roles: ['HR'],
        color: "#22c55e"
      },
      { 
        name: 'Manage Jobs', 
        icon: Briefcase, 
        path: '/hr/managejob',
        roles: ['HR'],
        color: "#f59e0b"
      },
      { 
        name: 'Manage Applications', 
        icon: ManageApplications, 
        path: '/hr/manage-applications',
        roles: ['HR'],
        color: "#3b82f6" 
      },
      { 
        name: 'Job Applications', 
        icon: Application, 
        path: '/hr/applications',
        roles: ['HR'],
        color: "#ec4899"
      },
      { 
        name: 'Manage Interviews', 
        icon: JobInterview, 
        path: '/hr/manage-interviews',
        roles: ['HR'],
        color: "#8b5cf6"
      },
      { 
        name: 'Manage Interviewers', 
        icon: Management, 
        path: '/hr/interviewers',
        roles: ['HR'],
        color: "#14b8a6"
      },
      { 
        name: 'Manage Badges', 
        icon: CreateBadge, 
        path: '/hr/badges',
        roles: ['HR'],
        color: "#14b8a6"
      },
    ],
  };

  const user = useUser(state => state.user);

  // Get navigation items based on user role
  const getNavItems = () => {
    if (!user?.role) return [];
    
    return Object.values(NAV_ITEMS)
      .flat()
      .filter(item => item.roles?.includes(user.role));
  };



  return (
    <Sidebar collapsible="icon" {...props}> 
      <SidebarHeader className="bg-background/95 shadow-sm">
      <div className="flex justify-center items-center gap-2 my-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="22" viewBox="0 0 24 22" fill="none">
        <path d="M4.3871 18.3003V3.6997H7.48387L12.0645 9.11712L16.7742 3.6997V0H1.09677C0.438603 0.232694 0.208106 0.502832 0 1.18919V17.045C0.241954 17.7703 0.509843 18.0102 1.09677 18.3003H4.3871Z" fill="#0183FF"></path><path d="M8 9.31532V22H22.6452C23.414 21.8499 23.705 21.5822 24 20.8108V4.95495C23.7856 4.32159 23.5816 4.02257 22.9032 3.6997H19.8065V18.3003H16.1935V9.31532L12.4516 13.8739H11.8065L8 9.31532Z" fill="#464646"></path>
        </svg>
        <b className="text-lg tracking-[0.1em] group-data-[collapsible=icon]:hidden">mightyRecruit</b></div>
      </SidebarHeader>
      <SidebarContent className="bg-background/95 shadow-sm pt-4 group-data-[collapsible=icon]:px-1">
        <SidebarMenu className="flex flex-col space-y-2">
        {getNavItems().map((item) => {
          const isActive = location.pathname === item.path;
          return (
          <SidebarMenuItem className="mx-2" key={item.name}>
            <NavLink to={item.path}>
            <SidebarMenuButton tooltip={item.name} className={`cursor-pointer ${isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}>
              <img src={item.icon} alt="Dashboard" className="w-6 h-6 min-w-[24px] min-h-[24px]" />
              <span className="group-data-[collapsible=icon]:hidden">{item.name}</span>
            </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>
          )
      })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
