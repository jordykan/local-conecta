interface DashboardShellProps {
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
}

export function DashboardShell({
  description,
  action,
  children,
}: DashboardShellProps) {
  return (
    <div className="space-y-8">
      {(description || action) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
        {children}
      </div>
    </div>
  )
}
