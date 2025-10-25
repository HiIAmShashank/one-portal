import type { MenuItem } from "../types/menu";

/**
 * Menu configuration for One Portal Admin
 *
 * This defines the navigation structure displayed in the sidebar.
 * The menu can be dynamically loaded from an API or statically defined.
 */
export const menuItems: MenuItem[] = [
  {
    name: "Home",
    path: "/",
    icon: "Home",
    order: 1,
    description: "Home page",
  },
  {
    name: "About",
    path: "/about",
    icon: "Info",
    order: 2,
    description: "About this app",
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
  await new Promise((resolve) => setTimeout(resolve, 100));

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
