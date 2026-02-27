// Weverse-inspired light theme for 댓글 넛지 커뮤니티
export const lightTheme = {
    // Backgrounds
    bgPrimary: '#f8f9fa',
    bgSecondary: '#ffffff',
    bgTertiary: '#f0f2f5',
    bgHover: '#f0f2f5',

    // Borders
    borderColor: '#e5e7eb',
    borderLight: '#d1d5db',

    // Text
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textTertiary: '#9ca3af',

    // Accent — Weverse Mint/Teal
    accent: '#00dfc2',
    accentDim: 'rgba(0, 223, 194, 0.15)',
    accentText: '#059688', // Darker teal for text readability on light background

    // Like
    likeColor: '#ff6b8a',
    likeBg: 'rgba(255, 107, 138, 0.12)',

    // Nudge Colors
    warnBg: 'rgba(245, 158, 11, 0.12)',
    warnBorder: '#f59e0b',
    warnText: '#d97706', // Darker text for readability
    dangerBg: 'rgba(239, 68, 68, 0.12)',
    dangerBorder: '#ef4444',
    dangerText: '#dc2626', // Darker text for readability

    // Safe (nudge pass)
    safeBg: 'rgba(34, 197, 94, 0.12)',
    safeBorder: '#22c55e',
    safeText: '#16a34a',

    // Layout
    sidebarWidth: '72px',
    rightSidebarWidth: '280px',
    headerHeight: '56px',
    radius: '16px',
    radiusSm: '10px',
    transition: '0.25s cubic-bezier(0.4, 0, 0.2, 1)',
};

// Exporting as darkTheme as well to align with existing App.js without needing to modify it,
// though we'll update App.js to use lightTheme for clarity.
export const darkTheme = lightTheme; 
