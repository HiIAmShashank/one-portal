import {
  AlertCircle,
  RefreshCw,
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@one-portal/ui';

interface ErrorFallbackProps {
  error?: Error | string;
  appName?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorFallback({
  error,
  appName = 'Application',
  onRetry,
  className = '',
}: ErrorFallbackProps) {
  const errorMessage =
    typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';

  return (
    <div className={`flex items-center justify-center min-h-[400px] p-4 ${className}`}>
      <Card className="max-w-lg w-full border-destructive/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">Failed to Load {appName}</CardTitle>
              <CardDescription>
                We encountered a problem loading this application
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Details</AlertTitle>
            <AlertDescription className="mt-2 text-sm">
              {errorMessage}
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">What you can try:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex gap-3">
          {onRetry && (
            <Button onClick={onRetry} variant="default" className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => (window.location.href = '/')}
          >
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
