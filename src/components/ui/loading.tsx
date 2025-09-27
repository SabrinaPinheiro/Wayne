import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCw } from 'lucide-react';

// Tipos de loading
type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'refresh';
type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps {
  variant?: LoadingVariant;
  size?: LoadingSize;
  className?: string;
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

// Componente principal de Loading
export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  className,
  text,
  fullScreen = false,
  overlay = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'refresh':
        return (
          <RefreshCw 
            className={cn(
              'animate-spin text-primary',
              sizeClasses[size]
            )} 
          />
        );
      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'bg-primary rounded-full animate-pulse',
                  size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return (
          <div
            className={cn(
              'bg-primary rounded-full animate-pulse',
              sizeClasses[size]
            )}
          />
        );
      case 'skeleton':
        return (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        );
      default:
        return (
          <Loader2 
            className={cn(
              'animate-spin text-primary',
              sizeClasses[size]
            )} 
          />
        );
    }
  };

  const content = (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-2',
      fullScreen && 'min-h-screen',
      className
    )}>
      {renderSpinner()}
      {text && (
        <p className={cn(
          'text-muted-foreground animate-pulse',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

// Componente de Loading para botões
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: LoadingSize;
  className?: string;
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  isLoading,
  children,
  loadingText,
  size = 'sm',
  className,
}) => {
  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Loader2 className={cn(
        'animate-spin',
        size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'
      )} />
      <span>{loadingText || 'Carregando...'}</span>
    </div>
  );
};

// Componente de Loading para tabelas
interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-gray-200 rounded animate-pulse flex-1"
              style={{
                animationDelay: `${(rowIndex * columns + colIndex) * 0.1}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Componente de Loading para cards
interface CardLoadingProps {
  count?: number;
  className?: string;
}

export const CardLoading: React.FC<CardLoadingProps> = ({
  count = 3,
  className,
}) => {
  return (
    <div className={cn('grid gap-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border rounded-lg p-4 space-y-3"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook para gerenciar estados de loading
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [loadingText, setLoadingText] = React.useState<string>('');

  const startLoading = React.useCallback((text?: string) => {
    setIsLoading(true);
    if (text) setLoadingText(text);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setLoadingText('');
  }, []);

  const withLoading = React.useCallback(
    async <T>(promise: Promise<T>, text?: string): Promise<T> => {
      startLoading(text);
      try {
        const result = await promise;
        return result;
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading]
  );

  return {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
    withLoading,
  };
};

// Componente de Loading Page
export const LoadingPage: React.FC<{ message?: string }> = ({ 
  message = 'Carregando...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loading size="lg" />
        <h2 className="text-xl font-semibold text-muted-foreground">
          {message}
        </h2>
      </div>
    </div>
  );
};

export default Loading;