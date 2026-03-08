import { useState } from 'react';
import { User, Camera, MapPin, Phone, ArrowRight, CheckCircle } from 'lucide-react';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';
import * as studentApi from '../services/studentApi';
import { useAuth } from '@/contexts/AuthContext';

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    telefono: '',
    pais: '',
    experiencia: '',
    interes: '',
  });

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await studentApi.updateStudentProfile({
        nombre: form.nombre,
        telefono: form.telefono,
        pais: form.pais,
      });
      await refreshUser();
      toast.success('Perfil completado');
      window.location.href = createPageUrl('dashboard');
    } catch (error) {
      toast.error('Error guardando perfil');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center p-4">
      <div className="bg-[#141419] border border-[rgba(244,242,236,0.08)] p-8 max-w-lg w-full">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1 bg-[rgba(244,242,236,0.06)] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-[#C7A36D]' : 'bg-transparent'
                }`} 
              />
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[rgba(199,163,109,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-[#C7A36D]" />
              </div>
              <h1 className="font-serif text-2xl text-[#F4F2EC] mb-2">Bienvenido a Poética de la Mirada</h1>
              <p className="text-[#B8B4AA] text-sm">Completemos tu perfil para personalizar tu experiencia.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors"
                  placeholder="Tu nombre"
                />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!form.nombre}
                className="w-full flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors disabled:opacity-50"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[rgba(199,163,109,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#C7A36D]" />
              </div>
              <h1 className="font-serif text-2xl text-[#F4F2EC] mb-2">¿De dónde nos visitas?</h1>
              <p className="text-[#B8B4AA] text-sm">Esta información nos ayuda a conocer mejor nuestra comunidad.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">País</label>
                <input
                  type="text"
                  value={form.pais}
                  onChange={e => setForm({ ...form, pais: e.target.value })}
                  className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors"
                  placeholder="Tu país"
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#B8B4AA] mb-2">Teléfono (opcional)</label>
                <input
                  type="tel"
                  value={form.telefono}
                  onChange={e => setForm({ ...form, telefono: e.target.value })}
                  className="w-full bg-[#0B0B0D] border border-[rgba(244,242,236,0.1)] text-[#F4F2EC] px-4 py-3 text-sm focus:outline-none focus:border-[#C7A36D] transition-colors"
                  placeholder="+54 9 11 1234 5678"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 border border-[rgba(244,242,236,0.1)] text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[rgba(199,163,109,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#C7A36D]" />
              </div>
              <h1 className="font-serif text-2xl text-[#F4F2EC] mb-2">¡Todo listo!</h1>
              <p className="text-[#B8B4AA] text-sm">Revisa tu información antes de comenzar.</p>
            </div>
            <div className="bg-[rgba(244,242,236,0.03)] p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#B8B4AA]">Nombre:</span>
                <span className="text-[#F4F2EC]">{form.nombre}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#B8B4AA]">País:</span>
                <span className="text-[#F4F2EC]">{form.pais || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#B8B4AA]">Teléfono:</span>
                <span className="text-[#F4F2EC]">{form.telefono || '—'}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 border border-[rgba(244,242,236,0.1)] text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-[0.14em] px-6 py-3 bg-[#C7A36D] text-[#0B0B0D] hover:bg-[#d4b07a] transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Guardando...' : 'Comenzar el curso'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
