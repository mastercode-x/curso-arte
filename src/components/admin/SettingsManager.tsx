import React, { useState, useEffect } from 'react';
import { Save, CreditCard, Mail, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import * as adminApi from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';

const SettingsManager: React.FC = () => {
  const [config, setConfig] = useState({
    nombreCurso: 'Poética de la Mirada',
    descripcionCurso: '',
    precioCurso: 100,
    moneda: 'ARS',
    bioProfesor: '',
    fotoProfesorUrl: '',
    googleFormUrl: '',
    emailContacto: '',
    whatsappNumero: '',
    notificarEmail: true,
    notificarWhatsApp: false
  });
  const [mpKeys, setMpKeys] = useState({
    mpAccessToken: '',
    mpPublicKey: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await adminApi.getConfig();
        if (data) {
          setConfig(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    };
    loadConfig();
  }, []);

  const handleSaveGeneral = async () => {
    setIsLoading(true);
    try {
      await adminApi.updateConfig(config);
      toast({ title: 'Configuración guardada', description: 'Los cambios se han guardado exitosamente.' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar la configuración.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMPKeys = async () => {
    setIsLoading(true);
    try {
      await adminApi.setMPKeys(mpKeys.mpAccessToken, mpKeys.mpPublicKey);
      toast({ title: 'Claves de Mercado Pago guardadas', description: 'Las claves se han configurado exitosamente.' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudieron guardar las claves.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-[#141419] border border-[rgba(244,242,236,0.08)]">
          <TabsTrigger value="general" className="data-[state=active]:bg-[#C7A36D] data-[state=active]:text-[#0B0B0D]">General</TabsTrigger>
          <TabsTrigger value="pagos" className="data-[state=active]:bg-[#C7A36D] data-[state=active]:text-[#0B0B0D]">Pagos</TabsTrigger>
          <TabsTrigger value="notificaciones" className="data-[state=active]:bg-[#C7A36D] data-[state=active]:text-[#0B0B0D]">Notificaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card className="bg-[#141419] border-[rgba(244,242,236,0.08)]">
            <CardHeader><CardTitle className="text-lg font-serif text-[#F4F2EC]">Configuración general</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#F4F2EC]">Nombre del curso</Label>
                <Input value={config.nombreCurso} onChange={(e) => setConfig({ ...config, nombreCurso: e.target.value })} className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]" />
              </div>
              <div>
                <Label className="text-[#F4F2EC]">Descripción del curso</Label>
                <Textarea value={config.descripcionCurso} onChange={(e) => setConfig({ ...config, descripcionCurso: e.target.value })} className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]" rows={3} />
              </div>
              <div>
                <Label className="text-[#F4F2EC]">Biografía del profesor</Label>
                <Textarea value={config.bioProfesor} onChange={(e) => setConfig({ ...config, bioProfesor: e.target.value })} className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]" rows={3} />
              </div>
              <div>
                <Label className="text-[#F4F2EC]">URL Foto del profesor</Label>
                <Input value={config.fotoProfesorUrl} onChange={(e) => setConfig({ ...config, fotoProfesorUrl: e.target.value })} placeholder="/images/instructor_portrait.jpg" className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#F4F2EC]">Precio del curso</Label>
                  <Input type="number" value={config.precioCurso} onChange={(e) => setConfig({ ...config, precioCurso: Number(e.target.value) })} className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]" />
                </div>
                <div>
                  <Label className="text-[#F4F2EC]">Moneda</Label>
                  <Input value={config.moneda} onChange={(e) => setConfig({ ...config, moneda: e.target.value })} className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]" />
                </div>
              </div>
              <div>
                <Label className="text-[#F4F2EC]">URL Formulario de Google</Label>
                <Input value={config.googleFormUrl} onChange={(e) => setConfig({ ...config, googleFormUrl: e.target.value })} placeholder="https://docs.google.com/forms/..." className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]" />
              </div>
              <Button onClick={handleSaveGeneral} disabled={isLoading} className="bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D]">
                <Save className="w-4 h-4 mr-2" />Guardar cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificaciones" className="mt-6">
          <Card className="bg-[#141419] border-[rgba(244,242,236,0.08)]">
            <CardHeader><CardTitle className="text-lg font-serif text-[#F4F2EC]">Configuración de notificaciones</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#F4F2EC]">Email de contacto</Label>
                <Input type="email" value={config.emailContacto} onChange={(e) => setConfig({ ...config, emailContacto: e.target.value })} className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]" />
              </div>
              <div>
                <Label className="text-[#F4F2EC]">Número de WhatsApp</Label>
                <Input value={config.whatsappNumero} onChange={(e) => setConfig({ ...config, whatsappNumero: e.target.value })} placeholder="+1234567890" className="bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#B8B4AA]" />
                  <div>
                    <p className="text-[#F4F2EC]">Notificaciones por email</p>
                    <p className="text-sm text-[#B8B4AA]">Recibir notificaciones de nuevas solicitudes</p>
                  </div>
                </div>
                <Switch checked={config.notificarEmail} onCheckedChange={(checked) => setConfig({ ...config, notificarEmail: checked })} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#B8B4AA]" />
                  <div>
                    <p className="text-[#F4F2EC]">Notificaciones por WhatsApp</p>
                    <p className="text-sm text-[#B8B4AA]">Recibir notificaciones por WhatsApp</p>
                  </div>
                </div>
                <Switch checked={config.notificarWhatsApp} onCheckedChange={(checked) => setConfig({ ...config, notificarWhatsApp: checked })} />
              </div>
              <Button onClick={handleSaveGeneral} disabled={isLoading} className="bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D]">
                <Save className="w-4 h-4 mr-2" />Guardar cambios
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManager;