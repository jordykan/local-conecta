"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type ChartDataPoint = {
  date: string
  count: number
}

type TrendChartProps = {
  viewsData: ChartDataPoint[]
  bookingsData: ChartDataPoint[]
  messagesData: ChartDataPoint[]
}

export function TrendChart({
  viewsData,
  bookingsData,
  messagesData,
}: TrendChartProps) {
  // Combinar todos los datos por fecha
  const dateMap = new Map<string, { visitas: number; reservas: number; mensajes: number }>()

  // Procesar visitas
  viewsData.forEach((item) => {
    const date = new Date(item.date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    })
    if (!dateMap.has(date)) {
      dateMap.set(date, { visitas: 0, reservas: 0, mensajes: 0 })
    }
    dateMap.get(date)!.visitas = item.count
  })

  // Procesar reservas
  bookingsData.forEach((item) => {
    const date = new Date(item.date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    })
    if (!dateMap.has(date)) {
      dateMap.set(date, { visitas: 0, reservas: 0, mensajes: 0 })
    }
    dateMap.get(date)!.reservas = item.count
  })

  // Procesar mensajes
  messagesData.forEach((item) => {
    const date = new Date(item.date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    })
    if (!dateMap.has(date)) {
      dateMap.set(date, { visitas: 0, reservas: 0, mensajes: 0 })
    }
    dateMap.get(date)!.mensajes = item.count
  })

  const chartData = Array.from(dateMap.entries())
    .map(([date, data]) => ({
      date,
      ...data,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      return dateA.getTime() - dateB.getTime()
    })

  const chartConfig = {
    visitas: {
      label: "Visitas",
      color: "oklch(0.65 0.19 35)",
    },
    reservas: {
      label: "Apartados",
      color: "oklch(0.60 0.15 145)",
    },
    mensajes: {
      label: "Mensajes",
      color: "oklch(0.60 0.18 260)",
    },
  } satisfies ChartConfig

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendencia general</CardTitle>
          <CardDescription>
            Evolución de todas las métricas en el tiempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              No hay datos para mostrar
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencia general</CardTitle>
        <CardDescription>
          Evolución de todas las métricas en el tiempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="visitas"
              type="natural"
              fill="var(--color-visitas)"
              fillOpacity={0.3}
              stroke="var(--color-visitas)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="reservas"
              type="natural"
              fill="var(--color-reservas)"
              fillOpacity={0.3}
              stroke="var(--color-reservas)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="mensajes"
              type="natural"
              fill="var(--color-mensajes)"
              fillOpacity={0.3}
              stroke="var(--color-mensajes)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
