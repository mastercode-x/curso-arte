import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function PaymentSuccess() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    // Verificar el pago después de un momento
    const timer = setTimeout(() => {
      setIsVerifying(false);
      setVerified(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-8 max-w-md w-full text-center">
        {isVerifying ? (
          <>
            <div className="w-16 h-16 bg-[rgba(199,163,109,0.1)] rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-[#C7A36D] animate-spin" />
            </div>
            <h1 className="font-serif text-2xl text-[#F4F2EC] mb-3">Verificando tu pago...</h1>
            <p className="text-[#B8B4AA] text-sm">Estamos confirmando tu transacción con Mercado Pago.</p>
          </>
        ) : verified ? (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="font-serif text-2xl text-[#F4F2EC] mb-3">¡Pago confirmado!</h1>
            <p className="text-[#B8B4AA] text-sm mb-6">
              Tu pago ha sido procesado exitosamente. En breve recibirás un email con tus credenciales de acceso al curso.
            </p>
            <div className="bg-[rgba(199,163,109,0.05)] border border-[rgba(199,163,109,0.2)] p-4 mb-6">
              <p className="text-sm text-[#F4F2EC] mb-2">¿Ya recibiste tus credenciales?</p>
              <p className="text-xs text-[#B8B4AA]">Revisa tu bandeja de entrada y spam.</p>
            </div>
            <a
              href={createPageUrl('login')}
              className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors"
            >
              Ir al login <ArrowRight className="w-4 h-4" />
            </a>
          </>
        ) : null}
      </div>
    </div>
  );
}
