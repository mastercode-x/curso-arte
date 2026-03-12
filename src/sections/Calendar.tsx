import { useRef, useLayoutEffect, useState, useEffect } from 'react';

import { CalendarDays, MapPin, Clock, Users, Sparkles } from 'lucide-react';

import { gsap, ScrollTrigger } from '../utils/gsap';
import * as calendarApi from '../services/calendarApi';

interface CalendarEvent {
  week: string;
  date: string;
  activity: string;
  module: string | null;
}

const Calendar = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  const [schedule, setSchedule] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar calendario desde la API
  useEffect(() => {
    const loadCalendar = async () => {
      try {
        const calendarData = await calendarApi.getPublicCalendar();
        if (calendarData.events && calendarData.events.length > 0) {
          setSchedule(calendarData.events);
        } else {
          // Usar datos de ejemplo si no hay datos en la API
          setSchedule(defaultSchedule);
        }
      } catch (error) {
        console.error('Error loading calendar:', error);
        // Usar datos de ejemplo en caso de error
        setSchedule(defaultSchedule);
      } finally {
        setIsLoading(false);
      }
    };
    loadCalendar();
  }, []);

  useLayoutEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      // Header animation
      gsap.fromTo(
        headerRef.current,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Stats animation
      if (statsRef.current) {
        const statItems = statsRef.current.querySelectorAll('.stat-item');
        gsap.fromTo(
          statItems,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Rows animation
      if (rowsRef.current) {
        const rows = rowsRef.current.querySelectorAll('.calendar-row');
        gsap.fromTo(
          rows,
          { x: '-4vw', opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: rowsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // CTA animation
      gsap.fromTo(
        ctaRef.current,
        { y: 16, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ctaRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoading, schedule]);

  const stats = [
    { icon: Clock, value: String(schedule.length), label: 'Semanas' },
    { icon: CalendarDays, value: String(schedule.filter(s => s.activity.includes('Encuentro')).length), label: 'Encuentros' },
    { icon: Users, value: 'x', label: 'Cupos' },
    { icon: Sparkles, value: String(new Set(schedule.map(s => s.module)).size), label: 'Módulos' },
  ];

  const getActivityStyle = (activity: string) => {
    if (activity.includes('Encuentro')) {
      return 'bg-[rgba(199,163,109,0.15)] text-[#C7A36D] border-[rgba(199,163,109,0.3)]';
    }
    if (activity.includes('decantación')) {
      return 'bg-[rgba(184,180,170,0.08)] text-[#B8B4AA] border-[rgba(184,180,170,0.15)]';
    }
    return 'bg-[rgba(244,242,236,0.08)] text-[#F4F2EC] border-[rgba(244,242,236,0.15)]';
  };

  if (isLoading) {
    return (
      <section
        ref={sectionRef}
        id="calendario"
        className="relative bg-[#0B0B0D] py-20 md:py-32"
      >
        <div className="relative z-10 px-[6vw] flex items-center justify-center py-12">
          <div className="text-[#C7A36D] animate-pulse">Cargando calendario...</div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="calendario"
      className="relative bg-[#0B0B0D] py-20 md:py-32"
    >
      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0B0B0D_70%)]" />

      <div className="relative z-10 px-6 sm:px-[6vw]">
        {/* Header */}
        <div ref={headerRef} className="mb-8 sm:mb-12 md:mb-16" style={{ opacity: 0 }}>
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.14em] text-[#C7A36D]">
            Cronograma 2026
          </span>
          <h2 className="mt-3 sm:mt-4 font-serif text-[10vw] sm:text-[8vw] md:text-[5vw] lg:text-[56px] font-medium text-[#F4F2EC] leading-[1.05] tracking-[-0.02em]">
            Encuentros y calendario
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-[#B8B4AA] max-w-full sm:max-w-[70vw] lg:max-w-[50vw]">
            Una sesión cada dos semanas, con tiempo para practicar entre encuentros. 
            Cada módulo incluye un encuentro virtual en vivo y una semana de decantación.
          </p>
        </div>

        {/* Stats Cards */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="stat-item p-4 sm:p-6 bg-[rgba(244,242,236,0.03)] border border-[rgba(244,242,236,0.08)] rounded-lg"
              style={{ opacity: 0 }}
            >
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#C7A36D] mb-2 sm:mb-3" />
              <div className="font-serif text-2xl sm:text-3xl md:text-4xl font-medium text-[#F4F2EC]">
                {stat.value}
              </div>
              <div className="mt-1 font-mono text-[10px] sm:text-xs uppercase tracking-[0.14em] text-[#B8B4AA]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Table */}
        <div ref={rowsRef} className="max-w-5xl overflow-x-auto -mx-6 sm:mx-0 px-6 sm:px-0">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[120px_140px_1fr_140px] gap-4 pb-4 border-b border-[rgba(244,242,236,0.12)] min-w-[600px]">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#B8B4AA]">Semana</span>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#B8B4AA]">Fecha</span>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#B8B4AA]">Actividad</span>
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#B8B4AA]">Módulo</span>
          </div>

          {/* Table Rows */}
          <div className="space-y-0 min-w-[600px] md:min-w-0">
            {schedule.map((item, index) => (
              <div
                key={index}
                className="calendar-row grid grid-cols-[100px_120px_1fr_120px] md:grid-cols-[120px_140px_1fr_140px] gap-2 md:gap-4 py-3 md:py-5 border-b border-[rgba(244,242,236,0.06)] hover:bg-[rgba(244,242,236,0.02)] transition-colors duration-300 group"
                style={{ opacity: 0 }}
              >
                {/* Week */}
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-[#F4F2EC] group-hover:text-[#C7A36D] transition-colors">
                    {item.week}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#B8B4AA]">{item.date}</span>
                </div>

                {/* Activity with badge */}
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium border ${getActivityStyle(item.activity)}`}>
                    <MapPin className="w-3 h-3" />
                    {item.activity}
                  </span>
                </div>

                {/* Module */}
                <div className="flex items-center">
                  {item.module ? (
                    <span className="text-xs sm:text-sm text-[#B8B4AA]">
                      {item.module}
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm text-[#B8B4AA]/50">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
   
      </div>
    </section>
  );
};

// Datos de ejemplo por si no hay datos en la API
const defaultSchedule: CalendarEvent[] = [
  { week: 'Semana 1', date: 'Lunes 06 Oct', activity: 'Apertura + presentación', module: null },
  { week: 'Semana 2', date: 'Lunes 13 Oct', activity: 'Encuentro virtual', module: 'Módulo 1' },
  { week: 'Semana 3', date: 'Lunes 20 Oct', activity: 'Tiempo de decantación', module: 'El silencio' },
  { week: 'Semana 4', date: 'Lunes 27 Oct', activity: 'Encuentro virtual', module: 'Módulo 2' },
  { week: 'Semana 5', date: 'Lunes 03 Nov', activity: 'Tiempo de decantación', module: 'Composición' },
  { week: 'Semana 6', date: 'Lunes 10 Nov', activity: 'Encuentro virtual', module: 'Módulo 3' },
  { week: 'Semana 7', date: 'Lunes 17 Nov', activity: 'Tiempo de decantación', module: 'Color' },
  { week: 'Semana 8', date: 'Lunes 24 Nov', activity: 'Encuentro virtual', module: 'Módulo 4' },
  { week: 'Semana 9', date: 'Lunes 01 Dic', activity: 'Tiempo de decantación', module: 'Materia' },
  { week: 'Semana 10', date: 'Lunes 08 Dic', activity: 'Encuentro virtual', module: 'Módulo 5' },
  { week: 'Semana 11', date: 'Lunes 15 Dic', activity: 'Tiempo de decantación', module: 'Forma' },
  { week: 'Semana 12', date: 'Lunes 22 Dic', activity: 'Encuentro virtual', module: 'Módulo 6' },
  { week: 'Semana 13', date: 'Lunes 05 Ene', activity: 'Tiempo de decantación', module: 'Luz' },
  { week: 'Semana 14', date: 'Lunes 12 Ene', activity: 'Encuentro virtual', module: 'Módulo 7' },
  { week: 'Semana 15', date: 'Lunes 19 Ene', activity: 'Tiempo de decantación', module: 'Naturaleza' },
  { week: 'Semana 16', date: 'Lunes 26 Ene', activity: 'Encuentro virtual + cierre', module: 'Módulo 8' },
];

export default Calendar;