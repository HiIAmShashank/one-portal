// Shadcn UI Components - Layout & Navigation
export { Button, buttonVariants, type ButtonProps } from './components/ui/button';
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from './components/ui/navigation-menu';

// Shadcn UI Components - Display
export { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar';
export { Alert, AlertTitle, AlertDescription } from './components/ui/alert';
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from './components/ui/card';
export { Badge, badgeVariants } from './components/ui/badge';
export { Separator } from './components/ui/separator';
export { Skeleton } from './components/ui/skeleton';
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './components/ui/tooltip';
export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from './components/ui/empty';

// Shadcn UI Components - Overlays
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from './components/ui/dropdown-menu';
export { Toaster as Sonner } from './components/ui/sonner';
export { toast } from 'sonner';

// Shadcn UI Components - Forms
export { Input } from './components/ui/input';
export { Label } from './components/ui/label';
export { Switch } from './components/ui/switch';

// Legacy components (deprecated - use shadcn equivalents)
export { Spinner, type SpinnerProps } from './components/spinner';

// Auth Components
export { SignInPrompt } from '../components/auth/SignInPrompt';
export { AuthLoadingSpinner } from '../components/auth/AuthLoadingSpinner';

// Utilities
export { cn } from './lib/utils';

// Icons (re-export from lucide-react for convenience)
export { 
  AlertCircle, 
  RefreshCw, 
  Settings, 
  User,
  Moon,
  Sun,
  Laptop,
  ChevronDown,
  LogOut,
  UserCircle,
  Bell,
  Search,
} from 'lucide-react';
