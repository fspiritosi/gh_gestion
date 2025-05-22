import { Skeleton } from '@/components/ui/skeleton';

export function HistorySkeleton() {
  // Crear un array para repetir el skeleton varias veces
  const skeletons = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="space-y-4">
      {skeletons.map((index) => (
        <div key={index} className="rounded-lg border border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-6 w-20" />
          </div>

          <Skeleton className="h-5 w-full mb-3" />

          <div className="pl-4 pt-2 border-l-2 border-gray-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-2/5" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
