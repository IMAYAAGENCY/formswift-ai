import { Skeleton } from "@/components/ui/skeleton";

export const HeroSkeleton = () => (
  <section className="pt-32 pb-20 px-4">
    <div className="container mx-auto max-w-7xl">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-20 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    </div>
  </section>
);

export const FeaturesSkeleton = () => (
  <section className="py-20 px-4">
    <div className="container mx-auto max-w-7xl">
      <div className="text-center mb-16">
        <Skeleton className="h-12 w-96 mx-auto mb-4" />
        <Skeleton className="h-6 w-full max-w-2xl mx-auto" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    </div>
  </section>
);

export const CardSkeleton = () => (
  <div className="space-y-4 p-6 border rounded-lg">
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-10 w-32 mt-4" />
  </div>
);

export const FormSkeleton = () => (
  <div className="space-y-4 max-w-md">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="grid md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
    <Skeleton className="h-96 w-full rounded-lg" />
  </div>
);
