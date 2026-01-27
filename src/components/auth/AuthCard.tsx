// src/components/auth/AuthCard.tsx
export default function AuthCard({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[calc(100vh-180px)] bg-bg text-text-1">
      <div className="mx-auto max-w-md px-4 py-10 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-8">
          <div className="text-xl font-semibold">{title}</div>
          {sub && <div className="mt-1 text-sm text-text-3">{sub}</div>}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
