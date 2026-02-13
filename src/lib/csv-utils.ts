import { UserProfile } from '@/lib/firestore';

export function exportUsersToCSV(users: UserProfile[], filename: string = 'users-export.csv') {
    // Define CSV headers
    const headers = [
        'ID',
        'Name',
        'Email',
        'Plan',
        'Status',
        'Wallet Balance',
        'Referral Code',
        'Last Active',
        'Total Sessions',
        'Engagement Score',
        'Sessions (7d)',
        'Device Type',
        'Joined Date'
    ];

    // Convert users to CSV rows
    const rows = users.map(user => [
        user.id || '',
        user.name || '',
        user.email || '',
        user.plan || 'free',
        user.status || 'inactive',
        user.walletBalance?.toString() || '0',
        user.referralCode || '',
        user.activitySummary?.lastActive?.toDate?.().toISOString() || '',
        user.activitySummary?.totalSessions?.toString() || '0',
        user.activitySummary?.engagementScore?.toString() || '0',
        user.metrics?.sessionCount7d?.toString() || '0',
        user.activitySummary?.deviceType || '',
        user.createdAt ? (typeof user.createdAt === 'string' ? user.createdAt : user.createdAt.toDate?.().toISOString() || '') : ''
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function parseCSVToUsers(csvText: string): Partial<UserProfile>[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    const users: Partial<UserProfile>[] = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const user: Partial<UserProfile> = {
            name: values[1] || '',
            email: values[2] || '',
            plan: values[3] as any || 'free',
            walletBalance: parseFloat(values[5]) || 0,
            referralCode: values[6] || ''
        };

        users.push(user);
    }

    return users;
}
