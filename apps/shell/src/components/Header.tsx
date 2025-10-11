import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Settings,
  User,
  LogOut,
  Bell,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@one-portal/ui';
import { ThemeToggle } from './ThemeToggle';

/**
 * Header Component
 * Persistent branding and navigation bar for the OnePortal shell
 * Requirements: FR-001, UX-001
 */

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  return (
    <header className={`border-b bg-background ${className}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">OP</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold">OnePortal</h1>
            <p className="text-xs text-muted-foreground">Unified Application Hub</p>
          </div>
        </div>

        {/* User actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  aria-label="Notifications"
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-10 w-10 rounded-full"
                aria-label="User menu"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">User Name</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    user@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
