'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Label, Pie, PieChart } from 'recharts';

const chartConfig = {
  visitors: {
    label: 'Visitors',
  },
  empleados: {
    label: 'Empleados',
    color: '#8DB9D7',
  },
  equipos: {
    label: 'Equipos',
    color: '#1F4A67',
  },
} satisfies ChartConfig;

type ChartData = {
  totalResourses: any;
  employees: any;
  vehicles: any;
};

export async function ResoursesChart({
  employees,
  equipments,
}: {
  employees: Employee[];
  equipments: VehicleWithBrand[];
}) {
  const dataChart = [
    {
      browser: 'empleados',
      visitors: employees?.length,
      fill: '#8DB9D7',
    },
    {
      browser: 'equipos',
      visitors: equipments?.length,
      fill: '#1F4A67',
    },
  ];

  const today = new Date().toLocaleDateString();

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Recursos totales de la empresa</CardTitle>
        <CardDescription>{today}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={dataChart} dataKey="visitors" nameKey="browser" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {employees?.length + equipments?.length}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground">
                          Recursos Totales
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
