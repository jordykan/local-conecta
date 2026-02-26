"use client"

import { useMemo } from "react"

type ChartData = {
  date: string
  count: number
}

type SimpleChartProps = {
  data: ChartData[]
  color?: string
  height?: number
  showLabels?: boolean
}

export function SimpleChart({
  data,
  color = "oklch(0.65 0.19 35)", // Orange primary
  height = 200,
  showLabels = true,
}: SimpleChartProps) {
  const { bars, maxCount, labels } = useMemo(() => {
    if (data.length === 0) {
      return { bars: [], maxCount: 0, labels: [] }
    }

    const maxCount = Math.max(...data.map((d) => d.count), 1)
    const barWidth = 100 / data.length

    const bars = data.map((item, index) => ({
      x: index * barWidth,
      width: barWidth * 0.8,
      height: (item.count / maxCount) * 100,
      count: item.count,
    }))

    const labels = data.map((item) => {
      const date = new Date(item.date)
      return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })
    })

    return { bars, maxCount, labels }
  }, [data])

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No hay datos para mostrar</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Chart */}
      <div className="relative" style={{ height }}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          {bars.map((bar, index) => (
            <g key={index}>
              <rect
                x={`${bar.x}%`}
                y={`${100 - bar.height}%`}
                width={`${bar.width}%`}
                height={`${bar.height}%`}
                fill={color}
                opacity={0.8}
                className="transition-opacity hover:opacity-100"
              />
            </g>
          ))}
        </svg>

        {/* Value labels on hover */}
        <div className="absolute inset-0 flex items-end">
          {bars.map((bar, index) => (
            <div
              key={index}
              className="group relative flex-1 px-1"
              style={{ height: `${bar.height}%` }}
            >
              <div className="absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-popover px-2 py-1 text-xs font-medium shadow-sm group-hover:block">
                {bar.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {labels.map((label, index) => (
            <div key={index} className="flex-1 text-center">
              {index % Math.ceil(labels.length / 7) === 0 ? label : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
