/**
 * Feature icons — ported from skezzod-app's WelcomeScreen.tsx so the web
 * marketing page echoes the same visual language as the mobile app.
 */
export function IconSearch({ color = "#1B5EBF" }: { color?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <circle cx="10" cy="10" r="6" stroke={color} strokeWidth="2" />
      <line x1="15" y1="15" x2="21" y2="21" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPeople({ color = "#1B5EBF" }: { color?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke={color} strokeWidth="1.9" />
      <circle cx="15.5" cy="7" r="2.5" stroke={color} strokeWidth="1.7" />
      <path d="M2 20C2 16.7 5.1 14 9 14H12C15.9 14 19 16.7 19 20" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
      <path d="M17 14.5C18.6 15.2 20 16.8 20 20" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconBrain({ color = "#1B5EBF" }: { color?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 4C9.5 4 7.5 6 7.5 8.5C7.5 9.2 7.7 9.9 8 10.5C6.5 11 5.5 12.4 5.5 14C5.5 16.2 7.3 18 9.5 18H12V4Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M12 4C14.5 4 16.5 6 16.5 8.5C16.5 9.2 16.3 9.9 16 10.5C17.5 11 18.5 12.4 18.5 14C18.5 16.2 16.7 18 14.5 18H12V4Z"
        stroke={color}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <line x1="12" y1="4" x2="12" y2="18" stroke={color} strokeWidth="1.3" />
      <line x1="12" y1="19" x2="12" y2="21" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconChart({ color = "#1B5EBF" }: { color?: string }) {
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <path d="M4 20L8 14L12 16L17 9L21 11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="4" y1="20" x2="21" y2="20" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconCheck({ color = "#1A7A4A" }: { color?: string }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <path d="M4 12.5L9.5 18L20 6" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
