import { useEffect, useState } from 'react';
import * as moduleApi from '../services/moduleApi';

interface PublicModule {
  id: string;
  titulo: string;
  orden: number;
}

const Navigation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [showModulesDropdown, setShowModulesDropdown] = useState(false);
  const [modules, setModules] = useState<PublicModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  // Cargar módulos públicos desde la API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await moduleApi.getPublicModules();
        setModules(data);
      } catch (error) {
        console.error('Error loading modules:', error);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchModules();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  const scrollToModule = (moduleId: string) => {
    const element = document.getElementById(`modulo-${moduleId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(`modulo-${moduleId}`);
    } else {
      // Fallback: scroll al primer módulo
      const firstModule = document.getElementById('modulos');
      if (firstModule) {
        firstModule.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setShowModulesDropdown(false);
  };

  const navItems = [
    { id: 'curso', label: 'Curso' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'inscripcion', label: 'Inscripción' },
  ];

  return (
    <>
      {/* Wordmark - always visible */}
      <div className={`fixed top-[4vh] left-[4vw] z-[100] max-w-[30vw] md:max-w-full transition-opacity duration-500 ${
        isVisible ? 'opacity-50' : 'opacity-100'
      }`}>
        <span className="font-serif text-base md:text-lg lg:text-xl text-[#F4F2EC] tracking-tight leading-tight break-words">
          Poética de la Mirada
        </span>
      </div>

      {/* Navigation - appears after hero */}
      <nav
        className={`fixed top-[4vh] right-[4vw] z-[100] transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ul className="flex gap-6 md:gap-8 items-center">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 ${
                  activeSection === item.id
                    ? 'text-[#C7A36D]'
                    : 'text-[#B8B4AA] hover:text-[#F4F2EC]'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
          
          {/* Modules Dropdown */}
          <li className="relative">
            <button
              onClick={() => setShowModulesDropdown(!showModulesDropdown)}
              className={`font-mono text-xs uppercase tracking-[0.14em] transition-colors duration-300 flex items-center gap-1 ${
                activeSection.startsWith('modulo')
                  ? 'text-[#C7A36D]'
                  : 'text-[#B8B4AA] hover:text-[#F4F2EC]'
              }`}
            >
              Módulos
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${showModulesDropdown ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {showModulesDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-[#1a1a1f]/95 backdrop-blur-md border border-[rgba(199,163,109,0.3)] rounded-lg shadow-xl min-w-[220px] py-2 overflow-hidden">
                {loadingModules ? (
                  // Skeleton loading
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="px-4 py-2.5">
                        <div className="h-3 bg-[rgba(244,242,236,0.1)] rounded animate-pulse w-full"></div>
                      </div>
                    ))}
                  </>
                ) : modules.length === 0 ? (
                  // Estado vacío
                  <div className="px-4 py-3 text-center">
                    <span className="text-xs text-[#B8B4AA] italic">Próximamente</span>
                  </div>
                ) : (
                  // Lista de módulos
                  modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => scrollToModule(module.id)}
                      className="w-full px-4 py-2.5 text-left transition-colors duration-200 hover:bg-[rgba(199,163,109,0.1)] group"
                    >
                      <span className="font-mono text-[10px] text-[#C7A36D]/60 uppercase tracking-[0.12em]">
                        {String(module.orden).padStart(2, '0')}
                      </span>
                      <span className="block text-xs text-[#B8B4AA] group-hover:text-[#F4F2EC] transition-colors duration-200 mt-0.5">
                        {module.titulo}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </li>

          {/* Botón Acceder */}
          <li>
            <a
              href="https://curso2-nine.vercel.app/#/login"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs uppercase tracking-[0.14em] px-4 py-2 border border-[#C7A36D] text-[#C7A36D] hover:bg-[#C7A36D] hover:text-[#0B0B0D] transition-all duration-300 rounded-sm"
            >
              Acceder
            </a>
          </li>
        </ul>
      </nav>

      {/* Click outside to close dropdown */}
      {showModulesDropdown && (
        <div 
          className="fixed inset-0 z-[99]" 
          onClick={() => setShowModulesDropdown(false)}
        />
      )}
    </>
  );
};

export default Navigation;