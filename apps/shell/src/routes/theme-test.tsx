import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@one-portal/ui';

export const Route = createFileRoute('/theme-test')({
    component: ThemeTestPage,
});

function ThemeTestPage() {
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Theme System Test</h1>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">System 1: tokens.ts (Tailwind Utilities)</h2>
                <p className="text-sm text-muted-foreground">
                    Uses colors from packages/tailwind-config/src/tokens.ts
                </p>

                <div className="flex gap-4">
                    <div className="bg-brand-primary-500 text-white p-4 rounded">
                        bg-brand-primary-500
                        <br />
                        (Sky Blue #0ea5e9)
                    </div>
                    <div className="bg-brand-secondary-500 text-white p-4 rounded">
                        bg-brand-secondary-500
                        <br />
                        (Purple #a855f7)
                    </div>
                    <div className="bg-success-500 text-white p-4 rounded">
                        bg-success-500
                        <br />
                        (Green #22c55e)
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-semibold">System 2: theme.css (shadcn Components)</h2>
                <p className="text-sm text-muted-foreground">
                    Uses CSS variables from packages/ui/src/theme.css
                </p>

                <div className="flex gap-4">
                    <Button variant="default">
                        Primary Button
                        <br />
                        (uses --primary)
                    </Button>
                    <Button variant="secondary">
                        Secondary Button
                        <br />
                        (uses --secondary)
                    </Button>
                    <Button variant="destructive">
                        Destructive Button
                        <br />
                        (uses --destructive)
                    </Button>
                </div>

                <div className="flex gap-4">
                    <div className="bg-primary text-primary-foreground p-4 rounded">
                        bg-primary
                        <br />
                        (CSS variable)
                    </div>
                    <div className="bg-secondary text-secondary-foreground p-4 rounded">
                        bg-secondary
                        <br />
                        (CSS variable)
                    </div>
                    <div className="bg-accent text-accent-foreground p-4 rounded">
                        bg-accent
                        <br />
                        (CSS variable)
                    </div>
                </div>
            </section>

            <section className="space-y-4 border-t pt-4">
                <h2 className="text-xl font-semibold">How to Change Themes:</h2>

                <div className="space-y-2 text-sm">
                    <div className="bg-muted p-4 rounded">
                        <strong>To change System 1 (tokens.ts):</strong>
                        <ol className="list-decimal ml-6 mt-2 space-y-1">
                            <li>Edit <code>packages/tailwind-config/src/tokens.ts</code></li>
                            <li>Change hex colors (e.g., primary 500: '#0ea5e9' → '#10b981')</li>
                            <li>Rebuild: <code>pnpm --filter @one-portal/ui build</code></li>
                            <li>Refresh browser - top row changes color</li>
                        </ol>
                    </div>

                    <div className="bg-muted p-4 rounded">
                        <strong>To change System 2 (theme.css):</strong>
                        <ol className="list-decimal ml-6 mt-2 space-y-1">
                            <li>Edit <code>packages/ui/src/theme.css</code></li>
                            <li>Change CSS variables (e.g., --primary: oklch(...))</li>
                            <li>With HMR running: Changes appear in ~2 seconds automatically</li>
                            <li>Without HMR: Rebuild and refresh - buttons/bottom row change color</li>
                        </ol>
                    </div>
                </div>
            </section>
        </div>
    );
}
