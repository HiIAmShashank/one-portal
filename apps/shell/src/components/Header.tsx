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
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
  cn,
} from '@one-portal/ui';
import { useMsal } from '@azure/msal-react';
import { ThemeToggle } from './ThemeToggle';
import { publishAuthEvent } from '@one-portal/auth/events';
import { Link, useRouterState } from '@tanstack/react-router';
import type { RemoteApp } from '@one-portal/types';
import { getAuthConfig } from '../auth/msalInstance';
import ShellIcon from '../shellIcon';

interface HeaderProps {
  apps?: RemoteApp[];
  className?: string;
}

export function Header({ apps = [], className = '' }: HeaderProps) {
  const { instance, accounts } = useMsal();
  const account = accounts[0];
  const isAuthenticated = accounts.length > 0;
  const router = useRouterState();
  const currentPath = router.location.pathname;

  const handleSignIn = async () => {
    try {
      // Store current path for post-login redirect
      sessionStorage.setItem('auth_return_url', currentPath);

      // Trigger MSAL login redirect
      await instance.loginRedirect({
        scopes: getAuthConfig().scopes,
        prompt: 'select_account',
      });
    } catch (error) {
      console.error('[Shell] Sign-in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      // Publish sign-out event to all remote apps before logout
      publishAuthEvent('auth:signed-out');

      if (import.meta.env.DEV) {
        console.log('[Shell] Published auth:signed-out event, initiating logout redirect');
      }

      // Small delay to ensure event is received by remote apps
      await new Promise(resolve => setTimeout(resolve, 100));

      // Perform MSAL logout (clears cache and redirects to Entra ID logout)
      // Add signed-out parameter to show confirmation message (T094: US5)
      // Always redirect to root with signed-out parameter (don't preserve current location)
      const postLogoutUrl = new URL(window.location.origin);
      postLogoutUrl.pathname = '/';
      postLogoutUrl.searchParams.set('signed-out', 'true');

      await instance.logoutRedirect({
        account,
        postLogoutRedirectUri: postLogoutUrl.toString(),
      });
    } catch (error) {
      console.error('[Shell] Logout error:', error);
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string | undefined): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>

      <header className={`flex h-16 border-b-1 shadow-2xl border-b-muted bg-background flex-col justify-center ${className}`}>
        <div className="flex items-center justify-between px-4">
          {/* Branding and Navigation */}
          <div className="flex items-center gap-6">
            {/* Logo and Brand */}
            <div className="flex items-center gap-2">
              <ShellIcon className="h-8 w-8" title="OnePortal Logo" />
              <div>
                <h1 className="text-lg font-semibold">OnePortal</h1>
              </div>
            </div>

            {/* Navigation Menu - Only show when authenticated */}
            {isAuthenticated && (
              <NavigationMenu>
                <NavigationMenuList>
                  {/* Home link */}
                  <NavigationMenuItem>
                    <Link to="/">
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          currentPath === '/' && 'bg-accent text-accent-foreground'
                        )}
                        aria-current={currentPath === '/' ? 'page' : undefined}
                      >
                        Home
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>

                  {/* Remote app links */}
                  {apps.map((app) => {
                    const appPath = `/apps/${app.id}`;
                    const isActive = currentPath === appPath;

                    return (
                      <NavigationMenuItem key={app.id}>
                        <Link to={appPath}>
                          <NavigationMenuLink
                            className={cn(
                              navigationMenuTriggerStyle(),
                              isActive && 'bg-accent text-accent-foreground'
                            )}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {app.name}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    );
                  })}
                </NavigationMenuList>
              </NavigationMenu>
            )}
          </div>

          {/* User actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle - Always visible */}
            <ThemeToggle />

            {/* Show Sign In button when not authenticated */}
            {!isAuthenticated && (
              <Button onClick={handleSignIn} variant="default">
                Sign In
              </Button>
            )}

            {/* User menu - Only show when authenticated */}
            {isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                    aria-label="User menu"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {account ? getInitials(account.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {account?.name || 'User Name'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {account?.username || 'user@example.com'}
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
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>
    </>

  );
}
