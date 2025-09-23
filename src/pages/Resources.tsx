import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Search, Package, Car, Smartphone, Edit, Trash2 } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  type: 'equipamento' | 'veiculo' | 'dispositivo';
  description: string | null;
  status: 'disponivel' | 'em_uso' | 'manutencao' | 'indisponivel';
  location: string | null;
  created_at: string;
  updated_at: string;
}

const statusLabels = {
  disponivel: 'Disponível',
  em_uso: 'Em Uso',
  manutencao: 'Manutenção',
  indisponivel: 'Indisponível',
};

const statusVariants = {
  disponivel: 'default',
  em_uso: 'secondary',
  manutencao: 'destructive',
  indisponivel: 'outline',
} as const;

const typeLabels = {
  equipamento: 'Equipamento',
  veiculo: 'Veículo',
  dispositivo: 'Dispositivo',
};

const typeIcons = {
  equipamento: Package,
  veiculo: Car,
  dispositivo: Smartphone,
};

export const Resources = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'equipamento' as Resource['type'],
    description: '',
    status: 'disponivel' as Resource['status'],
    location: '',
  });

  const canModifyResources = profile?.role === 'admin' || profile?.role === 'gerente';

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources((data as Resource[]) || []);
    } catch (error) {
      console.error('Error loading resources:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível carregar os recursos.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingResource) {
        // Update existing resource
        const { error } = await supabase
          .from('resources')
          .update(formData)
          .eq('id', editingResource.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Recurso atualizado com sucesso!',
        });
      } else {
        // Create new resource
        const { error } = await supabase
          .from('resources')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Recurso criado com sucesso!',
        });
      }

      setIsDialogOpen(false);
      setEditingResource(null);
      resetForm();
      loadResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível salvar o recurso.',
      });
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      name: resource.name,
      type: resource.type,
      description: resource.description || '',
      status: resource.status,
      location: resource.location || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este recurso?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Recurso excluído com sucesso!',
      });

      loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível excluir o recurso.',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'equipamento',
      description: '',
      status: 'disponivel',
      location: '',
    });
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || resource.type === filterType;
    const matchesStatus = filterStatus === 'all' || resource.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recursos</h1>
          <p className="text-muted-foreground mt-1">
            Gerenciamento de equipamentos, veículos e dispositivos
          </p>
        </div>

        {canModifyResources && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingResource(null); }}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Recurso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingResource ? 'Editar Recurso' : 'Novo Recurso'}
                </DialogTitle>
                <DialogDescription>
                  {editingResource 
                    ? 'Atualize as informações do recurso.'
                    : 'Adicione um novo recurso ao sistema.'
                  }
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as Resource['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equipamento">Equipamento</SelectItem>
                      <SelectItem value="veiculo">Veículo</SelectItem>
                      <SelectItem value="dispositivo">Dispositivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as Resource['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disponivel">Disponível</SelectItem>
                      <SelectItem value="em_uso">Em Uso</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="indisponivel">Indisponível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingResource ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar recursos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="equipamento">Equipamento</SelectItem>
                <SelectItem value="veiculo">Veículo</SelectItem>
                <SelectItem value="dispositivo">Dispositivo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="em_uso">Em Uso</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="indisponivel">Indisponível</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-muted-foreground">Carregando recursos...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const Icon = typeIcons[resource.type];
            return (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                    </div>
                    <Badge variant={statusVariants[resource.status]}>
                      {statusLabels[resource.status]}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{typeLabels[resource.type]}</p>
                  </div>
                  
                  {resource.location && (
                    <div>
                      <p className="text-sm text-muted-foreground">Localização</p>
                      <p className="font-medium">{resource.location}</p>
                    </div>
                  )}
                  
                  {resource.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Descrição</p>
                      <p className="text-sm">{resource.description}</p>
                    </div>
                  )}

                  {canModifyResources && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(resource)}>
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      {profile?.role === 'admin' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDelete(resource.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Excluir
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredResources.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Nenhum recurso encontrado com os filtros aplicados.'
                : 'Nenhum recurso cadastrado ainda.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};