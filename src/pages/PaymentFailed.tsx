import { XCircle, RefreshCw, HelpCircle } from 'lucide-react';

export default function PaymentFailed() {
  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="font-serif text-2xl text-[#F4F2EC] mb-3">Pago no completado</h1>
        <p className="text-[#B8B4AA] text-sm mb-6">
          Lo sentimos, tu pago no pudo ser procesado. Esto puede deberse a:
        </p>
        <ul className="text-left text-sm text-[#B8B4AA] space-y-2 mb-6 bg-[rgba(244,242,236,0.03)] p-4">
          <li>· Fondos insuficientes</li>
          <li>· Tarjeta rechazada por el banco</li>
          <li>· Error temporal en el sistema de pagos</li>
          <li>· Cancelación voluntaria</li>
        </ul>
        <div className="space-y-3">
          <a
            href="/#/login"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors w-full justify-center"
          >
            <RefreshCw className="w-4 h-4" /> Intentar nuevamente
          </a>
          <a
            href="mailto:soporte@poetica-de-la-mirada.com"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 border border-[rgba(244,242,236,0.1)] text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors w-full justify-center"
          >
            <HelpCircle className="w-4 h-4" /> Necesito ayuda
          </a>
        </div>
      </div>
    </div>
  );
}