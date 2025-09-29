import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AvatarUploadProps {
  currentAvatarUrl?: string | null;
  onAvatarUpdate: (url: string | null) => void;
  fallbackText: string;
}

export const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate, fallbackText }: AvatarUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para upload.');
      }

      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos.');
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('A imagem deve ter no máximo 2MB.');
      }

      if (!user) {
        throw new Error('Usuário não autenticado.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = data.publicUrl;

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      onAvatarUpdate(avatarUrl);

      toast({
        title: "Avatar atualizado",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);

      if (!user || !currentAvatarUrl) return;

      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      onAvatarUpdate(null);

      toast({
        title: "Avatar removido",
        description: "Sua foto de perfil foi removida com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao remover avatar:', error);
      toast({
        title: "Erro ao remover",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
        <AvatarImage src={currentAvatarUrl || ''} alt="Avatar" />
        <AvatarFallback className="text-sm sm:text-lg">
          {fallbackText}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col sm:flex-row gap-2 w-full justify-center">
          <Button
            variant="outline"
            size="sm"
            disabled={uploading}
            asChild
            className="w-full sm:w-auto"
          >
            <label className="cursor-pointer flex items-center justify-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="text-xs sm:text-sm">{uploading ? 'Enviando...' : 'Alterar Foto'}</span>
              <Input
                type="file"
                accept="image/*"
                onChange={uploadAvatar}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </Button>
          
          {currentAvatarUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={removeAvatar}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4" />
              <span className="sm:hidden ml-2 text-xs">Remover</span>
            </Button>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          JPG, PNG ou WEBP. Máximo 2MB.
        </p>
      </div>
    </div>
  );
};