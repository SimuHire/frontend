type StepIconProps = {
  name: 'create' | 'build' | 'evidence';
};

export function StepIcon({ name }: StepIconProps) {
  const paths = {
    create: (
      <>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    build: (
      <>
        <path d="M8 18l-4-4 4-4" />
        <path d="M16 6l4 4-4 4" />
        <path d="M12 4v16" />
      </>
    ),
    evidence: (
      <>
        <path d="M6 5h12v14H6z" />
        <path d="M9 9h6M9 12h6M9 15h4" />
        <circle cx="17" cy="17" r="3" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-wheat-700"
    >
      {paths[name]}
    </svg>
  );
}
