import { UserRole } from "@/@types/user";
import { useUser } from "@/app/store";
import CreateCandidate from "@/components/CreateCandidate/CreateCandidate";
import ScreenLoader from "@/components/custom/ScreenLoader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { logout } from "@/service/AuthService";
import { getUser } from "@/service/UserService";
import { AvatarImage } from "@radix-ui/react-avatar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LockKeyholeIcon, LogOut, Moon, PlusCircle, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AppSidebar } from "./AppSidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ChangePassword from "@/components/ChangePassword/ChangePassword";

export default function Layout() {
  const addUser = useUser((state) => state.addUser);
  const stateUser = useUser((state) => state.user);
  const removeUser = useUser((state) => state.removeUser);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [CreateUserdialogOpen, setCreateUserdialogOpen] = useState(false);
  const [ChangePassdialogOpen, setChangePassdialogOpen] = useState(false);
  
  const { data: userData, isLoading } = useQuery({
    queryKey: ['getuser'],
    queryFn: getUser,
    retry: 0
  });

  useEffect(() => {    
    if(userData) {
      addUser(userData.data?.user);
    }
    else {
      removeUser();
    }
  }, [userData, addUser, removeUser]);

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ['logout'],
    mutationFn: logout,
    onSuccess: (data) => {
      if (data?.status === 200) {
        queryClient.invalidateQueries({ queryKey: ['getuser'] });
        removeUser();
        navigate('/');
      }
    }
  });

  const handleLogout = () => {
  toast.promise(mutateAsync(), {
    loading: 'Loading...',
    success: 'Logged Out Successfully',
    error: data => `${data?.message}`
  })
  }; 

  
  const showSidebar = stateUser && stateUser?.role !== UserRole.Interviewer;

  // Modified theme state logic with localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Initialize theme from localStorage or default to system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) {
      return savedTheme === 'dark';
    } else {
      // Check system preference as fallback
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  });

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    // Save to localStorage
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // Apply theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);
  
  
  // Show loading state while checking user
  if (isLoading) {
    return <ScreenLoader />;
  }
  return (
    showSidebar ? 
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
      <header className="sticky flex h-14 top-0 z-10 w-full bg-background/95 shadow-sm backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </div>
        <div className="flex space-x-2">
          <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost"
              className="rounded-[100%] border border-input w-8 h-8"
              onClick={toggleTheme}
              >
              <div className="transition-transform duration-300 transform rotate-0 dark:rotate-180">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Switch Theme</TooltipContent>
          </Tooltip>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage 
                  src=""
                />
                <AvatarFallback>
                  {userData?.data?.user.username[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>  
            <DropdownMenuContent className="max-w-64">
              <DropdownMenuLabel className="flex flex-col">
                <span>Signed in as</span>
                <span className="text-foreground text-xs font-normal">{userData?.data?.user.email}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    Quick Actions
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                  {
                    stateUser.role === 'HR' &&
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setCreateUserdialogOpen(true)}>
                      <PlusCircle />
                      Create Credential
                    </DropdownMenuItem>
                  }
                  {(stateUser.role === 'HR' || stateUser.role === 'Candidate') &&
                    <DropdownMenuItem className="cursor-pointer" onClick={() => setChangePassdialogOpen(true)}>
                      <LockKeyholeIcon />
                      Change Password
                    </DropdownMenuItem>
                  }
                </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-black" 
                onClick={handleLogout}
                disabled={isPending}
                >
                  <LogOut className=" text-red-600 group-hover:text-black" />
                  <span>Sign out</span>
                </Button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
  </div>
      </header>

        <div className="flex flex-1 flex-col gap-4 md:p-2">
          <Outlet />
        </div>

        {/* Dialogs */}
        <CreateCandidate 
          dialogopen={CreateUserdialogOpen}
          setDialogOpen={setCreateUserdialogOpen}
        />
        <ChangePassword 
          dialogopen={ChangePassdialogOpen}
          setDialogOpen={setChangePassdialogOpen}
        />
      </SidebarInset>
    </SidebarProvider>
    : 
    <Outlet />
  )
}
