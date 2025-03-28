'use client';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function ContactFormSkeleton() {
  return (
    <section className={cn('md:mx-7')}>
      <Card className="mt-6 p-8">
        {/* Título skeleton */}
        <div className="h-10 bg-gray-200 rounded animate-pulse w-1/3 mb-3"></div>
        
        {/* Descripción skeleton */}
        <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2 mb-6"></div>
        
        <div className="mt-6 rounded-xl flex w-full">
          <div className="w-full">
            {/* Campos del formulario skeleton */}
            <div className="flex flex-wrap gap-3 items-center w-full">
              {[...Array(5)].map((_, index) => (
                <FieldSkeleton key={index} />
              ))}
            </div>

            {/* Botón skeleton */}
            <div className="h-10 bg-gray-200 rounded animate-pulse w-1/5 mt-5"></div>
          </div>
        </div>
      </Card>
    </section>
  );
}

// Componente interno para campos individuales
function FieldSkeleton() {
  return (
    <div>
      <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4 mb-2"></div>
      <div className="h-10 bg-gray-200 rounded animate-pulse max-w-[350px] w-[300px]"></div>
    </div>
  );
}