import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCcw, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const PaymentFailed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('message') || 'El pago no pudo ser procesado';

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#141419] border-[rgba(244,242,236,0.08)]">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-serif text-2xl text-[#F4F2EC] mb-2">Pago no completado</h2>
          <p className="text-[#B8B4AA] mb-4">
            {errorMessage}
          </p>
          <div className="bg-[rgba(244,242,236,0.03)] border border-[rgba(244,242,236,0.08)] rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-[#B8B4AA] mb-2">Posibles causas:</p>
            <ul className="text-sm text-[#B8B4AA] space-y-1 list-disc list-inside">
              <li>Fondos insuficientes</li>
              <li>Tarjeta rechazada por el banco</li>
              <li>Error de conexión</li>
              <li>Pago cancelado por el usuario</li>
            </ul>
          </div>
          <div className="space-y-3">
            <Link to="/login">
              <Button 
                variant="outline" 
                className="w-full border-[rgba(244,242,236,0.15)] text-[#F4F2EC] hover:bg-[rgba(244,242,236,0.05)]"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Intentar de nuevo
              </Button>
            </Link>
            <a 
              href="mailto:soporte@poeticadelamirada.com"
              className="inline-flex items-center justify-center w-full text-sm text-[#C7A36D] hover:underline"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Contactar soporte
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailed;
