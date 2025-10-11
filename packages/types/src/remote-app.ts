/**
 * Function type for mounting a remote application
 * @param containerId The ID of the DOM element where the app should mount
 * @returns Root instance for cleanup
 */
export type MountFunction = (containerId: string) => any;

/**
 * Function type for unmounting a remote application
 * @param container The HTML element to unmount from (optional, may not be used)
 */
export type UnmountFunction = (container?: HTMLElement) => Promise<void> | void;
