import React, { useState } from 'react';
import { Search, Filter, RefreshCcw, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePaymentStats } from '@/hooks/usePayments';
import * as paymentApi from '@/services/paymentApi';
import { useEffect } from 'react';

import type { Payment } from '@/services/paymentApi';

const PaymentsManager: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState<string>('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { stats } = usePaymentStats();

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const data = await paymentApi.getAllPayments({ estado: estado || undefined });
      setPayments(data.pagos);
    } catch (error) {
      console.error('Error cargando pagos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [estado]);

  const handleRefund = async (id: string) => {
    if (!confirm('¿Estás seguro de procesar el reembolso?')) return;
    try {
      await paymentApi.processRefund(id);
      fetchPayments();
    } catch (error) {
      console.error('Error procesando reembolso:', error);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <Badge className="bg-green-500/20 text-green-500">Completado</Badge>;
      case 'reembolsado':
        return <Badge className="bg-red-500/20 text-red-500">Reembolsado</Badge>;
      case 'fallido':
        return <Badge className="bg-red-500/20 text-red-500">Fallido</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-500">Pendiente</Badge>;
    }
  };

  const filteredPayments = payments.filter(p => 
    p.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-[#141419] border-[rgba(244,242,236,0.08)]">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold text-[#F4F2EC] truncate">${stats?.ingresosTotales?.toLocaleString() || 0}</p>
                <p className="text-[10px] md:text-xs text-[#B8B4AA]">Ingresos totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#141419] border-[rgba(244,242,236,0.08)]">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#C7A36D]/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-[#C7A36D]" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold text-[#F4F2EC]">{stats?.totalPagos || 0}</p>
                <p className="text-[10px] md:text-xs text-[#B8B4AA]">Total pagos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#141419] border-[rgba(244,242,236,0.08)]">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold text-[#F4F2EC]">{stats?.pagosCompletados || 0}</p>
                <p className="text-[10px] md:text-xs text-[#B8B4AA]">Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#141419] border-[rgba(244,242,236,0.08)]">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold text-[#F4F2EC]">{stats?.pagosPendientes || 0}</p>
                <p className="text-[10px] md:text-xs text-[#B8B4AA]">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#141419] border-[rgba(244,242,236,0.08)]">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-serif text-[#F4F2EC]">
              Historial de pagos
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8B4AA]" />
                <Input
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]"
                />
              </div>
              <div className="flex gap-2">
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger className="w-full sm:w-40 bg-[rgba(244,242,236,0.03)] border-[rgba(244,242,236,0.08)] text-[#F4F2EC]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="reembolsado">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={fetchPayments} className="border-[rgba(244,242,236,0.15)] shrink-0">
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-[#B8B4AA]">Cargando...</div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8 text-[#B8B4AA]">No hay pagos</div>
          ) : (
            <>
              {/* Vista de tabla en desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[rgba(244,242,236,0.08)]">
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#B8B4AA]">Estudiante</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#B8B4AA]">Monto</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#B8B4AA]">Estado</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-[#B8B4AA]">Fecha</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-[#B8B4AA]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((pago) => (
                      <tr key={pago.id} className="border-b border-[rgba(244,242,236,0.05)] hover:bg-[rgba(244,242,236,0.02)]">
                        <td className="py-3 px-4">
                          <div>                   
                            <p className="text-[#F4F2EC]">{pago.nombre || 'Sin nombre'}</p>
                            <p className="text-sm text-[#B8B4AA]">{pago.email || 'Sin email'}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#F4F2EC]">
                          ${pago.monto} {pago.moneda}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(pago.estado)}</td>
                        <td className="py-3 px-4 text-[#B8B4AA]">
                          {pago.fechaPago 
                            ? new Date(pago.fechaPago).toLocaleDateString('es-ES')
                            : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {pago.estado === 'completado' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRefund(pago.id)}
                              className="text-red-500"
                            >
                              Reembolsar
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vista de cards en mobile */}
              <div className="md:hidden space-y-3">
                {filteredPayments.map((pago) => (
                  <div
                    key={pago.id}
                    className="bg-[rgba(244,242,236,0.03)] border border-[rgba(244,242,236,0.08)] rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <p className="text-[#F4F2EC] font-medium truncate">{pago.nombre || 'Sin nombre'}</p>
                        <p className="text-sm text-[#B8B4AA] truncate">{pago.email || 'Sin email'}</p>
                      </div>
                      {getStatusBadge(pago.estado)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#B8B4AA] text-sm">Monto</span>
                      <span className="text-[#F4F2EC] font-medium">${pago.monto} {pago.moneda}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#B8B4AA] text-sm">Fecha</span>
                      <span className="text-[#B8B4AA] text-sm">
                        {pago.fechaPago 
                          ? new Date(pago.fechaPago).toLocaleDateString('es-ES')
                          : 'N/A'}
                      </span>
                    </div>
                    {pago.estado === 'completado' && (
                      <div className="pt-2 border-t border-[rgba(244,242,236,0.06)]">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRefund(pago.id)}
                          className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10"
                        >
                          Reembolsar
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsManager;