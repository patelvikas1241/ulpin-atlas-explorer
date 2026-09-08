import * as React from "react";
import type { Property } from "@/lib/ulpin";

const PropertyScene = React.lazy(() => import("./three/PropertyScene"));

type Props = {
  properties: Property[];
  selectedId?: string | null;
  activeFloor?: number | null;
  onSelect?: (id: string) => void;
  onFloor?: (f: number) => void;
  single?: boolean;
  className?: string;
};

export function ClientScene({ className, ...rest }: Props) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className={className}>
      {mounted ? (
        <React.Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Loading 3D scene…
            </div>
          }
        >
          <PropertyScene {...rest} />
        </React.Suspense>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Preparing 3D scene…
        </div>
      )}
    </div>
  );
}
