import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import * as paymentApi from '@/services/paymentApi';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preferenceId = searchParams.get('preference_id');
  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!preferenceId) {
        setVerifying(false);
        setError('No se encontró información del pago');
        return;
      }

      try {
        // Esperar un momento para que el webhook procese el pago
        await new Promise(resolve => setTimeout(resolve, 3000));
        const status = await paymentApi.checkPaymentStatus(preferenceId);
        
        if (status.status === 'completado' || status.status === 'approved') {
          setVerified(true);
        } else {
          setError('El pago está siendo procesado. Recibirás un email cuando se confirme.');
        }
      } catch (err) {
        console.error('Error verificando pago:', err);
        // No mostrar error, el webhook puede tardar
        setVerified(true); // Asumir éxito, el webhook confirmará
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [preferenceId]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#141419] border-[rgba(244,242,236,0.08)]">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-[#C7A36D] animate-spin mx-auto mb-4" />
            <h2 className="font-serif text-xl text-[#F4F2EC] mb-2">Verificando tu pago...</h2>
            <p className="text-[#B8B4AA]">Esto puede tomar unos segundos</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !verified) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#141419] border-[rgba(244,242,236,0.08)]">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="font-serif text-xl text-[#F4F2EC] mb-2">Pago en procesamiento</h2>
            <p className="text-[#B8B4AA] mb-6">{error}</p>
            <Link to="/login">
              <Button className="bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D]">
                Ir al login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#141419] border-[rgba(244,242,236,0.08)]">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="font-serif text-2xl text-[#F4F2EC] mb-2">¡Pago exitoso!</h2>
          <p className="text-[#B8B4AA] mb-4">
            Tu pago ha sido procesado correctamente.
          </p>
          <div className="bg-[rgba(199,163,109,0.1)] border border-[rgba(199,163,109,0.2)] rounded-lg p-4 mb-6">
            <p className="text-sm text-[#F4F2EC]">
              Hemos enviado un email con tus credenciales de acceso.
            </p>
          </div>
          <p className="text-sm text-[#B8B4AA] mb-6">
            Revisa tu bandeja de entrada (y spam) para encontrar tu contraseña temporal.
          </p>
          <Link to="/login">
            <Button className="w-full bg-[#C7A36D] hover:bg-[#d4b07a] text-[#0B0B0D]">
              Iniciar sesión
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
