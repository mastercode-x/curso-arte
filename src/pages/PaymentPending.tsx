import { Clock, Mail, ArrowRight } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function PaymentPending() {
  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="font-serif text-2xl text-[#F4F2EC] mb-3">Pago pendiente</h1>
        <p className="text-[#B8B4AA] text-sm mb-6">
          Tu pago está siendo procesado. Esto puede tomar algunos minutos dependiendo del método de pago seleccionado.
        </p>
        <div className="bg-[rgba(199,163,109,0.05)] border border-[rgba(199,163,109,0.2)] p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-[#C7A36D]" />
            <p className="text-sm text-[#F4F2EC]">Te notificaremos por email</p>
          </div>
          <p className="text-xs text-[#B8B4AA]">
            Recibirás un correo cuando tu pago sea confirmado con las instrucciones para acceder al curso.
          </p>
        </div>
        <div className="space-y-3">
          <a
            href={createPageUrl('login')}
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors w-full justify-center"
          >
            Ir al login <ArrowRight className="w-4 h-4" />
          </a>
          <p className="text-xs text-[#B8B4AA]">
            ¿Tienes dudas?{' '}
            <a href="mailto:soporte@poetica-de-la-mirada.com" className="text-[#C7A36D] hover:underline">
              Contáctanos
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
