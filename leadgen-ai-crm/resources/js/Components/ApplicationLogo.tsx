export default function ApplicationLogo(props: any) {
    return (
        <svg {...props} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="bar-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.6} />
                </linearGradient>
            </defs>
            {/* Refined growth bars with consistent spacing and radii */}
            <rect x="22" y="58" width="14" height="22" rx="6" fill="#2563eb" opacity="0.3" />
            <rect x="43" y="40" width="14" height="40" rx="6" fill="#2563eb" opacity="0.6" />
            <rect x="64" y="22" width="14" height="58" rx="6" fill="url(#bar-gradient)" />
            
            {/* Optimized AI Sparkle for better legibility and balance */}
            <path d="M71 4 L73.5 12 L81 14.5 L73.5 17 L71 24.5 L68.5 17 L61 14.5 L68.5 12 Z" fill="#2563eb" />
            
            {/* Subtle baseline for grounding the mark */}
            <rect x="20" y="85" width="60" height="3" rx="1.5" fill="#2563eb" opacity="0.1" />
        </svg>
    );
}
