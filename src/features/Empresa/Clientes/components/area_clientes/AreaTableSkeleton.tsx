'use client';
import { Skeleton } from '@/components/ui/skeleton';

export function AreaTableSkeleton() {
  // Número de filas esqueletos a mostrar
  const rows = 5;

  return (
    <div className="ml-4 space-y-4">
      <Skeleton className="h-8 w-[150px] mb-4" />

      {/* Filtros Skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full sm:w-[300px]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Tabla Skeleton */}
      <div className="rounded-md border">
        <div className="border-b">
          <div className="grid grid-cols-5 gap-4 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={`header-${i}`} className="h-6" />
            ))}
          </div>
        </div>

        <div className="space-y-4 p-4">
          {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, cellIndex) => (
                <Skeleton
                  key={`row-${rowIndex}-cell-${cellIndex}`}
                  className="h-8"
                  style={{
                    // Variación leve en el ancho para mayor realismo
                    width: cellIndex === 4 ? '80px' : '100%',
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Paginación Skeleton */}
      <div className="flex justify-center gap-2">
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
        <Skeleton className="h-10 w-10" />
      </div>
    </div>
  );
}
