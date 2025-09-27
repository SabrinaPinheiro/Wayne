import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ConfirmationType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmationDialogProps {
  children: React.ReactNode;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const typeConfig = {
  danger: {
    icon: Trash2,
    iconColor: 'text-red-500',
    confirmVariant: 'destructive' as const,
    confirmText: 'Excluir',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-yellow-500',
    confirmVariant: 'default' as const,
    confirmText: 'Continuar',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-500',
    confirmVariant: 'default' as const,
    confirmText: 'Confirmar',
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-green-500',
    confirmVariant: 'default' as const,
    confirmText: 'Confirmar',
  },
};

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  children,
  title,
  description,
  confirmText,
  cancelText = 'Cancelar',
  type = 'danger',
  onConfirm,
  onCancel,
  isLoading = false,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const config = typeConfig[type];
  const Icon = config.icon;

  const handleConfirm = async () => {
    try {
      await onConfirm();
      setOpen(false);
    } catch (error) {
      console.error('Erro na confirmação:', error);
      // Manter o diálogo aberto em caso de erro
    }
  };

  const handleCancel = () => {
    setOpen(false);
    onCancel?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild disabled={disabled}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <Icon className={cn('w-5 h-5', config.iconColor)} />
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              config.confirmVariant === 'destructive' && 'bg-red-600 hover:bg-red-700'
            )}
          >
            {isLoading ? 'Processando...' : (confirmText || config.confirmText)}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Hook para usar confirmação programaticamente
export const useConfirmation = () => {
  const [confirmationState, setConfirmationState] = React.useState<{
    isOpen: boolean;
    title: string;
    description: string;
    type: ConfirmationType;
    onConfirm: () => void | Promise<void>;
    onCancel?: () => void;
  } | null>(null);

  const confirm = React.useCallback(
    (options: {
      title: string;
      description: string;
      type?: ConfirmationType;
      onConfirm: () => void | Promise<void>;
      onCancel?: () => void;
    }) => {
      setConfirmationState({
        isOpen: true,
        type: 'danger',
        ...options,
      });
    },
    []
  );

  const closeConfirmation = React.useCallback(() => {
    setConfirmationState(null);
  }, []);

  const ConfirmationComponent = React.useMemo(() => {
    if (!confirmationState) return null;

    return (
      <AlertDialog
        open={confirmationState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeConfirmation();
            confirmationState.onCancel?.();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              {React.createElement(typeConfig[confirmationState.type].icon, {
                className: cn('w-5 h-5', typeConfig[confirmationState.type].iconColor),
              })}
              <AlertDialogTitle>{confirmationState.title}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left">
              {confirmationState.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                closeConfirmation();
                confirmationState.onCancel?.();
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  await confirmationState.onConfirm();
                  closeConfirmation();
                } catch (error) {
                  console.error('Erro na confirmação:', error);
                }
              }}
              className={cn(
                typeConfig[confirmationState.type].confirmVariant === 'destructive' &&
                  'bg-red-600 hover:bg-red-700'
              )}
            >
              {typeConfig[confirmationState.type].confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }, [confirmationState, closeConfirmation]);

  return {
    confirm,
    ConfirmationComponent,
  };
};

// Componentes pré-configurados para casos comuns
export const DeleteConfirmation: React.FC<{
  children: React.ReactNode;
  itemName: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}> = ({ children, itemName, onConfirm, isLoading }) => {
  return (
    <ConfirmationDialog
      title="Confirmar Exclusão"
      description={`Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`}
      type="danger"
      confirmText="Excluir"
      onConfirm={onConfirm}
      isLoading={isLoading}
    >
      {children}
    </ConfirmationDialog>
  );
};

export const LogoutConfirmation: React.FC<{
  children: React.ReactNode;
  onConfirm: () => void | Promise<void>;
}> = ({ children, onConfirm }) => {
  return (
    <ConfirmationDialog
      title="Confirmar Logout"
      description="Tem certeza que deseja sair da sua conta?"
      type="warning"
      confirmText="Sair"
      onConfirm={onConfirm}
    >
      {children}
    </ConfirmationDialog>
  );
};

export const UnsavedChangesConfirmation: React.FC<{
  children: React.ReactNode;
  onConfirm: () => void | Promise<void>;
}> = ({ children, onConfirm }) => {
  return (
    <ConfirmationDialog
      title="Alterações não salvas"
      description="Você tem alterações não salvas. Deseja continuar sem salvar?"
      type="warning"
      confirmText="Continuar sem salvar"
      onConfirm={onConfirm}
    >
      {children}
    </ConfirmationDialog>
  );
};

export default ConfirmationDialog;