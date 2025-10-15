import { ColumnDef } from "@one-portal/ui";
export type User  = {
    id:        string;
    username:  string;
    role:      string;
    firstName: string;
    lastName:  string;
    birthDate: string;
    bio:       string;
    profileReachStatus: string;  // API returns string not number
    hasAccount: boolean;           // API returns "true"/"false" not boolean
    salary:    number;
}

export  const userColumns: ColumnDef<User>[] = [
    {
      id: 'id',
      accessorKey: 'id',
      header: 'ID',
      // Not editable - read-only ID
    },
    {
      id: 'username',
      accessorKey: 'username',
      header: 'Username',
      enableSorting: false,
      editable: true,
      editType: 'text',
      validate: (value) => {
        if (!value || value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-z0-9_]+$/.test(value)) return 'Username can only contain lowercase, numbers, and underscores';
        return true;
      },
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: 'Role',
      editable: true,
      editType: 'select',
      editOptions: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ],
    },
    {
      id: 'firstName',
      accessorKey: 'firstName',
      header: 'First Name',
      editable: true,
      editType: 'text',
    },
    {
      id: 'lastName',
      accessorKey: 'lastName',
      header: 'Last Name',
      filterFn: 'includesString' as any, // Fix: Explicit filter function
      editable: true,
      editType: 'text',
    },
    {
      id: 'birthDate',
      accessorKey: 'birthDate',
      header: 'Birth Date',
      filterFn: 'includesString' as any, // Fix: Explicit filter function
      editable: true,
      editType: 'date',
    },
    {
      id: 'bio',
      accessorKey: 'bio',
      header: 'Bio',
      filterFn: 'includesString' as any, // Fix: Explicit filter function
      editable: true,
      editType: 'textarea',
      editProps: {
        rows: 3,
        maxLength: 500,
      },
    },
    {
      id: 'profileReachStatus',
      accessorKey: 'profileReachStatus',
      header: 'Profile Reach Status',
          meta: {
      filterOptions: [
        { label: 'Continue (100)', value: '100' },
        { label: 'Switching protocols (101)', value: '101' },
        { label: 'Processing (102)', value: '102' },
        { label: 'Pending (103)', value: '103' },
        { label: 'OK (200)', value: '200' },
        {label: 'Created (201)', value: '201' },
        {label: 'Accepted (202)', value: '202' },
        {label: 'No Content (204)', value: '204' },
        {label: 'Not Modified (214)', value: '214' },
        {label: 'Not Found (404)', value: '404' },
        {label: 'Method Not Allowed (405)', value: '405' },
        {label: 'I\'m a teapot (418)', value: '418' },
        {label: 'Internal Server Error (500)', value: '500' },
        {label: 'Bad Gateway (502)', value: '502' },
        {label: 'Service Unavailable (503)', value: '503' },
        {label: 'Gateway Timeout (504)', value: '504' },
        {label: 'Network Authentication Required (511)', value: '511' },
            ],
    }
},
    {
      id: 'hasAccount',
      accessorKey: 'hasAccount',
      header: 'Has Account',

    },
    {
      id: 'salary',
      accessorKey: 'salary',
      header: 'Salary',
      filterFn: 'numberRange' as any, // Fix: Explicit filter function
      editable: true,
      editType: 'number',
      validate: (value) => {
        if (value === null || value === undefined || value === '') return 'Salary is required';
        const num = Number(value);
        if (isNaN(num) || num < 0) return 'Salary must be a positive number';
        return true;
      },
    }
  ];