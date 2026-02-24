import Link from "next/link"
import { IconCircleCheck, IconCircle } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface ProfileCheck {
  label: string
  done: boolean
  href?: string
}

interface ProfileCompletenessProps {
  checks: ProfileCheck[]
  percent: number
}

export function ProfileCompleteness({ checks, percent }: ProfileCompletenessProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Tu perfil</span>
          <span className="text-muted-foreground">{percent}%</span>
        </div>
        <Progress value={percent} className="h-1.5" />
      </div>
      <div className="space-y-0.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2.5 py-1.5">
            {check.done ? (
              <IconCircleCheck className="size-4 shrink-0 text-emerald-500" />
            ) : (
              <IconCircle className="size-4 shrink-0 text-muted-foreground/30" />
            )}
            {check.href && !check.done ? (
              <Link
                href={check.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {check.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "text-sm",
                  check.done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {check.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
