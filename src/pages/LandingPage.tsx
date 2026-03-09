import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Hero from '../sections/Hero';
import CourseOverview from '../sections/CourseOverview';
import ModuleSection from '../sections/ModuleSection';
import Calendar from '../sections/Calendar';
import Instructor from '../sections/Instructor';
import Navigation from '../sections/Navigation';
import * as moduleApi from '../services/moduleApi';
import * as adminApi from '../services/adminApi';

// Registrar el plugin de GSAP
gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesData, configData] = await Promise.all([
          moduleApi.getPublicModules(),
          adminApi.getPublicConfig()
        ]);
        setModules(modulesData);
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
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, [loading, modules]);

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
      {modules.map((module, index) => (
        <ModuleSection
          key={module.id}
          badge={`MÓDULO ${String(module.orden || index + 1).padStart(2, '0')}`}
          title={module.titulo}
          description={module.descripcion}
          image={module.imagenUrl || `/images/module0${(index % 7) + 1}_bg.jpg`}
          zIndex={30 + index * 10}
          moduleId={module.id}
        />
      ))}
      
      {/* Calendar Section */}
      <Calendar />
      
      {/* Instructor & Enrollment */}
      <Instructor config={config} />
    </div>
  );
}

export default LandingPage;
