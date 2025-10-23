import type { MenuItem } from '../types/menu';

/**
 * Mock menu configuration for Domino application
 * 
 * In production, this would be fetched from an API endpoint.
 * The structure matches the expected API response format.
 */
export const menuItems: MenuItem[] = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'LayoutDashboard',
        order: 1,
        description: 'Overview and metrics',
        children: [
            {
                name: 'Events',
                path: '/dashboard/events',
                icon: 'Calendar',
                order: 1,
                description: 'Event management',
            },
            {
                name: 'Tasks',
                path: '/dashboard/tasks',
                icon: 'CheckSquare',
                order: 2,
                description: 'Task tracking',
            },
            {
                name: 'Workflows',
                path: '/dashboard/workflows',
                icon: 'Workflow',
                order: 3,
                description: 'Workflow automation',
            },
        ],
    },
];

/**
 * Fetch menu configuration from API
 * 
 * @returns Promise resolving to menu items
 */
export async function fetchMenuItems(): Promise<MenuItem[]> {
    // TODO: Replace with actual API call
    // const response = await fetch('/api/menu');
    // const data = await response.json();
    // return data.items;

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return menuItems;
}

/**
 * Get menu item by path
 * 
 * @param path - The route path to search for
 * @returns The matching menu item or undefined
 */
export function getMenuItemByPath(path: string): MenuItem | undefined {
    const findInItems = (items: MenuItem[]): MenuItem | undefined => {
        for (const item of items) {
            if (item.path === path) {
                return item;
            }
            if (item.children) {
                const found = findInItems(item.children);
                if (found) return found;
            }
        }
        return undefined;
    };

    return findInItems(menuItems);
}

/**
 * Get all menu items flattened (including children)
 * 
 * @returns Array of all menu items
 */
export function getAllMenuItems(): MenuItem[] {
    const flatten = (items: MenuItem[]): MenuItem[] => {
        return items.reduce<MenuItem[]>((acc, item) => {
            acc.push(item);
            if (item.children) {
                acc.push(...flatten(item.children));
            }
            return acc;
        }, []);
    };

    return flatten(menuItems);
}
