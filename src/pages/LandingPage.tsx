import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '../sections/Hero';
import CourseOverview from '../sections/CourseOverview';
import ModuleSection from '../sections/ModuleSection';
import Calendar from '../sections/Calendar';
import Instructor from '../sections/Instructor';
import Navigation from '../sections/Navigation';
import { NavigationProvider } from '../contexts/NavigationContext';
import * as moduleApi from '../services/moduleApi';
import * as adminApi from '../services/adminApi';

// Registrar el plugin de GSAP
gsap.registerPlugin(ScrollTrigger);

// Skeleton component for module loading
const ModuleSkeleton = ({ index }: { index: number }) => {
  const zIndex = 30 + index * 10;
  
  return (
    <section 
      className="section-pinned bg-[#0B0B0D]"
      style={{ zIndex }}
    >
      <div className="relative z-10 h-full flex flex-col justify-center px-[6vw]">
        {/* Badge skeleton */}
        <div className="h-4 w-24 bg-[rgba(199,163,109,0.15)] rounded animate-pulse mb-6"></div>
        
        {/* Title skeleton */}
        <div className="space-y-3 max-w-[38vw]">
          <div className="h-12 md:h-14 bg-[rgba(244,242,236,0.05)] rounded animate-pulse w-3/4"></div>
          <div className="h-12 md:h-14 bg-[rgba(244,242,236,0.05)] rounded animate-pulse w-1/2"></div>
        </div>
        
        {/* Description skeleton */}
        <div className="mt-8 space-y-3 max-w-[38vw]">
          <div className="h-4 bg-[rgba(184,180,170,0.1)] rounded animate-pulse w-full"></div>
          <div className="h-4 bg-[rgba(184,180,170,0.1)] rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-[rgba(184,180,170,0.1)] rounded animate-pulse w-4/6"></div>
        </div>
        
        {/* Duration skeleton */}
        <div className="mt-10">
          <div className="h-8 w-28 bg-[rgba(199,163,109,0.1)] rounded animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

// Empty state component
const EmptyModulesState = () => {
  return (
    <section 
      id="modulos"
      className="section-pinned bg-[#0B0B0D] z-30"
    >
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-[6vw] text-center">
        {/* Decorative element */}
        <div className="w-16 h-0.5 bg-[#C7A36D] mb-8"></div>
        
        {/* Title */}
        <h2 className="font-serif text-[6vw] md:text-[5vw] lg:text-[48px] font-medium text-[#F4F2EC] leading-[1.1] tracking-[-0.02em] mb-4">
          Módulos en preparación
        </h2>
        
        {/* Description */}
        <p className="text-base md:text-lg text-[#B8B4AA] max-w-[40ch] leading-relaxed">
          Estamos trabajando en el contenido del curso. 
          Los módulos serán publicados próximamente.
        </p>
        
        {/* Decorative element */}
        <div className="mt-8 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#C7A36D]/40 rounded-full animate-pulse"></div>
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#C7A36D]/60">
            Próximamente
          </span>
        </div>
      </div>
    </section>
  );
};

const LandingPageContent: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  // Forzar tema oscuro al montar, restaurar al desmontar
useEffect(() => {
  document.documentElement.classList.remove('light');
  document.documentElement.classList.add('dark');
  return () => {
    // Al salir, limpiar para que el dashboard maneje su propio tema
    document.documentElement.classList.remove('dark');
  };
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesData, configData] = await Promise.all([
          moduleApi.getPublicModules(),
          adminApi.getPublicConfig()
        ]);
        setModules([...modulesData].sort((a, b) => a.orden - b.orden));
        setConfig(configData);
      } catch (error) {
        console.error('Error fetching landing data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  

useEffect(() => {
  if (loading) return;
  const scrollTo = sessionStorage.getItem('scrollTo');
  if (scrollTo === 'instructor') {
    sessionStorage.removeItem('scrollTo');
    const timer = setTimeout(() => {
      document.getElementById('instructor')?.scrollIntoView({ behavior: 'smooth' });
    }, 1200);
    return () => clearTimeout(timer);
  }
}, [loading]);




useEffect(() => {
  return () => {
    // Limpiar todos los ScrollTriggers al salir de la landing
    ScrollTrigger.getAll().forEach(st => st.kill());
    ScrollTrigger.clearScrollMemory();
  };
}, []);

  useLayoutEffect(() => {
    if (loading) return;

    // Pequeño delay para asegurar que el DOM está completamente renderizado
    const timer = setTimeout(() => {
      // Refrescar ScrollTrigger después de que todo esté montado
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, modules.length]);

  useLayoutEffect(() => {
    if (loading) return;

    // Global snap for pinned sections
    const setupGlobalSnap = () => {
      const pinned = ScrollTrigger.getAll()
        .filter(st => st.vars.pin)
        .sort((a, b) => a.start - b.start);
    
      const maxScroll = ScrollTrigger.maxScroll(window);
      if (!maxScroll || pinned.length === 0) return;

      const pinnedRanges = pinned.map(st => ({
        start: st.start / maxScroll,
        end: (st.end ?? st.start) / maxScroll,
        center: (st.start + ((st.end ?? st.start) - st.start) * 0.5) / maxScroll,
      }));

      ScrollTrigger.create({
        snap: {
          snapTo: (value: number) => {
            const inPinned = pinnedRanges.some(
              r => value >= r.start - 0.02 && value <= r.end + 0.02
            );
            if (!inPinned) return value;

            const target = pinnedRanges.reduce(
              (closest, r) =>
                Math.abs(r.center - value) < Math.abs(closest - value)
                  ? r.center
                  : closest,
              pinnedRanges[0]?.center ?? 0
            );
            return target;
          },
          duration: { min: 0.15, max: 0.35 },
          delay: 0,
          ease: 'power2.out',
        },
      });
    };

    const timer = setTimeout(setupGlobalSnap, 1000);

    return () => {
      clearTimeout(timer);
      // NO matar todos los ScrollTriggers aquí - dejar que ModuleSection los maneje
      // ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [loading, modules.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="font-serif text-[#C7A36D] animate-pulse text-2xl">Poética de la Mirada...</div>
      </div>
    );
  }

  return (
    <div ref={mainRef} className="relative">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <Hero config={config} />
      
      {/* Course Overview */}
      <CourseOverview config={config} />
      
      {/* Module Sections */}
      {modules.length > 0 ? (
        modules.map((module, index) => (
          <ModuleSection
            key={module.id}
            badge={`MÓDULO ${String(index + 1).padStart(2, '0')}`}
            title={module.titulo}
            description={module.descripcion}
            image={module.imagenUrl || `/images/module0${(index % 7) + 1}_bg.jpg`}
            zIndex={30 + index * 10}
            moduleId={module.id}
            duration={module.duracion}
          />
        ))
      ) : (
        <EmptyModulesState />
      )}
      
      {/* Calendar Section */}
      <Calendar />
      
      {/* Instructor & Enrollment */}
 <div id="instructor">
  <Instructor config={config} />
</div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  return (
    <NavigationProvider>
      <LandingPageContent />
    </NavigationProvider>
  );
};

export default LandingPage;