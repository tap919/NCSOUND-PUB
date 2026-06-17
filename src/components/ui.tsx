// Shared UI components for loading, error, and empty states
import { AlertCircle, RefreshCw, Database, LucideIcon } from 'lucide-react';

export function LoadingSkeleton({ lines = 4, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`animate-pulse space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-neutral-800 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 animate-pulse">
      <div className="h-4 w-24 bg-neutral-800 mb-4" />
      <div className="h-8 w-32 bg-neutral-800" />
    </div>
  );
}

export function ErrorFallback({
  message = 'Something went wrong',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-neutral-900 border border-red-500/30 p-8 text-center flex flex-col items-center gap-4">
      <AlertCircle className="w-10 h-10 text-red-500" />
      <p className="text-sm font-sans text-neutral-300 max-w-md">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="flex items-center gap-2 bg-neutral-950 border border-neutral-700 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-neutral-800 transition-colors">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon: IconProp = Database,
  title = 'No data yet',
  description = 'Nothing to display here yet.',
  action,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  const IconComponent = IconProp;
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-12 text-center flex flex-col items-center gap-4">
      {IconComponent ? <IconComponent className="w-12 h-12 text-neutral-700" /> : null}
      <h3 className="text-xl font-heading uppercase tracking-wider text-white">{title}</h3>
      <p className="text-sm font-sans text-neutral-500 max-w-md">{description}</p>
      {action && (
        <button type="button" onClick={action.onClick} className="bg-orange-500 text-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-orange-400 transition-colors mt-2">
          {action.label}
        </button>
      )}
    </div>
  );
}
