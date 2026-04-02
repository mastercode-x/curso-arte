import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          window.location.href = '/#/login';
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h1 className="font-serif text-2xl text-[#F4F2EC] mb-3">¡Pago confirmado!</h1>
        <p className="text-[#B8B4AA] text-sm mb-6">
          Tu pago ha sido procesado exitosamente. En breve recibirás un email con tus credenciales de acceso al curso.
        </p>
        <div className="bg-[rgba(199,163,109,0.05)] border border-[rgba(199,163,109,0.2)] p-4 mb-6">
          <p className="text-sm text-[#F4F2EC] mb-1">Revisá tu bandeja de entrada y spam.</p>
          <p className="text-xs text-[#B8B4AA]">
            Serás redirigido al login en <span className="text-[#C7A36D] font-mono">{countdown}</span> segundos...
          </p>
        </div>
        <a
          href="/#/login"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors"
        >
          Ir al login ahora <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}