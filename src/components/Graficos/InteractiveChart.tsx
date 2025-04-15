'use client';

import { TrendingUp } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
} from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useState } from 'react';
const chartData = [
  { mes: 'Enero', activos: 300, inactivos: 160 },
  { mes: 'Febrero', activos: 250, inactivos: 210 },
  { mes: 'Marzo', activos: 280, inactivos: 180 },
  { mes: 'Abril', activos: 190, inactivos: 270 },
  { mes: 'Mayo', activos: 310, inactivos: 150 },
  { mes: 'Junio', activos: 320, inactivos: 140 },
  { mes: 'Julio', activos: 330, inactivos: 130 },
  { mes: 'Agosto', activos: 340, inactivos: 120 },
  { mes: 'Septiembre', activos: 350, inactivos: 110 },
  { mes: 'Octubre', activos: 200, inactivos: 260 },
  { mes: 'Noviembre', activos: 360, inactivos: 100 },
  { mes: 'Diciembre', activos: 370, inactivos: 90 },
];

const chartConfig = {
  activos: {
    label: 'Activos',
    color: 'hsl(var(--chart-6))',
  },
  inactivos: {
    label: 'Inactivos',
    color: 'hsl(var(--chart-7))',
  },
} satisfies ChartConfig;

const charts_types = [
  { value: 'bar', label: 'Barras' },
  { value: 'line', label: 'Lineas' },
  { value: 'area', label: 'Area' },
];

export function InteractiveChart() {
  const [chartType, setChartType] = useState('bar');

  const handleChartTypeChange = (value: string) => {
    setChartType(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Empleados</CardTitle>
        <CardDescription>Activos e Inactivos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <select
            value={chartType}
            onChange={(e) => handleChartTypeChange(e.target.value)}
            className="rounded-md border p-2"
          >
            {charts_types.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <ChartContainer config={chartConfig}>
          {chartType === 'bar' ? (
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="mes"
                tickLine={true}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <Bar dataKey="activos" fill="var(--color-activos)" radius={4} />
              <Bar dataKey="inactivos" fill="var(--color-inactivos)" radius={4} />
            </BarChart>
          ) : chartType === 'line' ? (
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 20,
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={true} />
              <XAxis
                dataKey="mes"
                tickLine={true}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
              <Line
                dataKey="activos"
                type="natural"
                stroke="var(--color-activos)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-activos)',
                }}
                activeDot={{
                  r: 6,
                }}
              >
                <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
              </Line>
              <Line
                dataKey="inactivos"
                type="natural"
                stroke="var(--color-inactivos)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-inactivos)',
                }}
                activeDot={{
                  r: 6,
                }}
              >
                <LabelList position="top" offset={12} className="fill-foreground" fontSize={12} />
              </Line>
            </LineChart>
          ) : (
            <RadarChart data={chartData}>
              <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="line" />} />
              <PolarAngleAxis dataKey="mes" />
              <PolarGrid />
              <Radar dataKey="activos" fill="var(--color-activos)" fillOpacity={0.6} />
              <Radar dataKey="inactivos" fill="var(--color-inactivos)" fillOpacity={0.6} />
            </RadarChart>
          )}
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          Tendencia de Empleados Activos <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">Se muestra un año calendario</div>
      </CardFooter>
    </Card>
  );
}
