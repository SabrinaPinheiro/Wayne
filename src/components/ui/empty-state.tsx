import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  children?: ReactNode;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) => {
  return (
    <Card className={cn('p-8 md:p-12', className)}>
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        {Icon && (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Icon className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground max-w-md">
            {description}
          </p>
        </div>

        {action && (
          <Button onClick={action.onClick} className="mt-4">
            {action.icon && <action.icon className="w-4 h-4 mr-2" />}
            {action.label}
          </Button>
        )}

        {children}
      </div>
    </Card>
  );
};

interface TableEmptyStateProps {
  message?: string;
  className?: string;
}

export const TableEmptyState = ({ 
  message = 'Nenhum registro encontrado',
  className 
}: TableEmptyStateProps) => {
  return (
    <div className={cn('text-center py-12', className)}>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};