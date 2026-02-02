import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Spinner de chargement avec différentes tailles
 */
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = "md", className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin text-gold", sizeClasses[size])} />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
}

/**
 * Skeleton pour les cartes
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Skeleton pour les listes
 */
export function ListItemSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded" />
        </div>
      ))}
    </>
  );
}

/**
 * Skeleton pour les tableaux
 */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 bg-gray-50 border-b border-gray-200">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-gray-200 last:border-b-0 animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-gray-200 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Page de chargement avec animation
 */
export function PageLoading({ message = "Chargement..." }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-gold/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-gold rounded-full animate-spin" />
        </div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * Bouton avec état de chargement
 */
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({ 
  loading = false, 
  loadingText = "Chargement...", 
  children, 
  disabled,
  className,
  ...props 
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? loadingText : children}
    </button>
  );
}

/**
 * Overlay de chargement pour les formulaires
 */
export function FormLoadingOverlay({ message = "Enregistrement..." }: { message?: string }) {
  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

/**
 * Skeleton pour le dashboard
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton pour la page de profil
 */
export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-1" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-1" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Indicateur de progression
 */
interface ProgressIndicatorProps {
  progress: number; // 0-100
  message?: string;
  className?: string;
}

export function ProgressIndicator({ progress, message, className }: ProgressIndicatorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">{message || "Chargement..."}</span>
        <span className="font-medium text-gold">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gold h-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

/**
 * État vide avec illustration
 */
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-black mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6 max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-gold text-black rounded-lg hover:bg-gold/90 font-medium transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
