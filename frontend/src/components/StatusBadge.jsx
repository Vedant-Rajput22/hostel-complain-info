export default function StatusBadge({ status, type = 'complaint' }) {
    const getStatusConfig = () => {
        const statusLower = status?.toLowerCase() || '';

        if (type === 'complaint') {
            if (statusLower === 'pending')
                return {
                    class: 'badge-pending',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                };
            if (statusLower === 'in progress')
                return {
                    class: 'badge-in-progress',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                };
            if (statusLower === 'resolved')
                return {
                    class: 'badge-resolved',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                };
        }

        if (type === 'cleaning') {
            if (statusLower === 'pending')
                return {
                    class: 'badge-pending',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                };
            if (statusLower === 'in progress')
                return {
                    class: 'badge-in-progress',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                };
            if (statusLower === 'completed')
                return {
                    class: 'badge-completed',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                };
        }

        if (type === 'internet') {
            if (statusLower === 'open')
                return {
                    class: 'badge-open',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                };
            if (statusLower === 'in progress')
                return {
                    class: 'badge-in-progress',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                };
            if (statusLower === 'resolved')
                return {
                    class: 'badge-resolved',
                    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                };
        }

        return {
            class: 'badge-pending',
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        };
    };

    const config = getStatusConfig();

    return (
        <span className={`badge ${config.class} flex items-center gap-1 px-3 py-1.5 font-semibold shadow-sm`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {config.icon}
            </svg>
            {status}
        </span>
    );
}


