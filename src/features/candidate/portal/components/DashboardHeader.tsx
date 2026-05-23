export function DashboardHeader({ email }: { email: string | null }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        Your portal
      </h1>
      <p className="text-sm text-gray-600">
        {email
          ? `Signed in as ${email}`
          : 'Sign in to open your Trial and saved work.'}
      </p>
    </div>
  );
}
