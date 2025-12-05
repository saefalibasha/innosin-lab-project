import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const SkeletonCard = () => {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="aspect-video bg-muted" />
      <CardHeader className="pb-2">
        <div className="h-5 bg-muted rounded w-3/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-6 bg-muted rounded w-16" />
          <div className="h-6 bg-muted rounded w-20" />
        </div>
      </CardContent>
    </Card>
  );
};

export const SkeletonCardList = ({ count = 6 }: { count?: number }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </>
  );
};
