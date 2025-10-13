import { Link, useRouterState } from '@tanstack/react-router';
import type { RemoteApp } from '@one-portal/types';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@one-portal/ui';
import { cn } from '@one-portal/ui';

/**
 * TopNavigation Component
 * Displays navigation links to available remote applications using shadcn NavigationMenu
 * Requirements: FR-002
 */

interface TopNavigationProps {
  apps?: RemoteApp[];
  className?: string;
}

export function TopNavigation({ apps = [], className = '' }: TopNavigationProps) {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <div className={`border-b ${className}`}>
      <div className="px-4">
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
      </div>
    </div>
  );
}
