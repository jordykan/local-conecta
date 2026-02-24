import { IconCheck } from "@tabler/icons-react"
import { cn } from "@/lib/utils"

const STEPS = [
  "Informacion",
  "Contacto",
  "Imagenes",
  "Horarios",
  "Revision",
]

interface StepIndicatorProps {
  currentStep: number
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((label, i) => {
        const isCompleted = i < currentStep
        const isCurrent = i === currentStep

        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <IconCheck className="size-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "hidden text-sm font-medium sm:block",
                  isCurrent ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-8",
                  i < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
