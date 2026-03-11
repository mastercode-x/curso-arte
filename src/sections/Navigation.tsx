import { useEffect, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X } from 'lucide-react';

import * as moduleApi from '../services/moduleApi';
import { useNavigation } from '../contexts/NavigationContext';

interface PublicModule {
  id: string;
  titulo: string;
  orden: number;
}

// Componente para el dropdown de módulos en desktop
const ModulesDropdownPortal = memo(({
  isOpen,
  modules,
  loading,
  onClose,
  onSelectModule,
}: {
  isOpen: boolean;
  modules: PublicModule[];
  loading: boolean;
  onClose: () => void;
  onSelectModule: (moduleId: string) => void;
}) => {
  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Click outside overlay para cerrar el dropdown */}
      <div
        className="fixed inset-0 z-[99]"
        onClick={onClose}
      />
      
      {/* Dropdown menu */}
      <div className="fixed z-[100] bg-[#1a1a1f]/95 backdrop-blur-md border border-[rgba(199,163,109,0.3)] rounded-lg shadow-xl min-w-[220px] py-2 overflow-hidden"
        style={{
          top: 'calc(4vh + 2rem)',
          right: '4vw',
        }}
      >
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-2.5">
                <div className="h-3 bg-[rgba(244,242,236,0.1)] rounded animate-pulse w-full"></div>
              </div>
            ))}
          </>
        ) : modules.length === 0 ? (
          <div className="px-4 py-3 text-center">
            <span className="text-xs text-[#B8B4AA] italic">Próximamente</span>
          </div>
        ) : (
          modules.map((module) => (
            <button
              key={module.id}
              onClick={() => {
                onSelectModule(module.id);
                onClose();
              }}
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
    </>,
    document.body
  );
});

ModulesDropdownPortal.displayName = 'ModulesDropdownPortal';

// Componente para el menú móvil
const MobileMenuPortal = memo(({
  isOpen,
  modules,
  loading,
  activeSection,
  onClose,
  onSelectSection,
  onSelectModule,
  showModulesDropdown,
  onToggleModulesDropdown,
}: {
  isOpen: boolean;
  modules: PublicModule[];
  loading: boolean;
  activeSection: string;
  onClose: () => void;
  onSelectSection: (id: string) => void;
  onSelectModule: (moduleId: string) => void;
  showModulesDropdown: boolean;
  onToggleModulesDropdown: () => void;
}) => {
  if (!isOpen) return null;

  const navItems = [
    { id: 'curso', label: 'Curso' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'inscripcion', label: 'Inscripción' },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Menu Content */}
      <div className="absolute top-0 right-0 w-[80vw] max-w-[300px] h-full bg-[#141419] border-l border-[rgba(244,242,236,0.08)] p-6 pt-20 overflow-y-auto">
        <ul className="space-y-6">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSelectSection(item.id)}
                className={`font-mono text-sm uppercase tracking-[0.14em] transition-colors duration-300 ${
                  activeSection === item.id
                    ? 'text-[#C7A36D]'
                    : 'text-[#B8B4AA] hover:text-[#F4F2EC]'
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}

          {/* Mobile Modules Section */}
          <li>
            <button
              onClick={onToggleModulesDropdown}
              className={`font-mono text-sm uppercase tracking-[0.14em] transition-colors duration-300 flex items-center gap-2 ${
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

            {/* Mobile Modules List */}
            {showModulesDropdown && (
              <div className="mt-3 ml-4 space-y-2 border-l border-[rgba(199,163,109,0.3)] pl-4">
                {loading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="py-2">
                        <div className="h-3 bg-[rgba(244,242,236,0.1)] rounded animate-pulse w-full"></div>
                      </div>
                    ))}
                  </>
                ) : modules.length === 0 ? (
                  <span className="text-xs text-[#B8B4AA] italic">Próximamente</span>
                ) : (
                  modules.map((module) => (
                    <button
                      key={module.id}
                      onClick={() => onSelectModule(module.id)}
                      className="block w-full text-left py-2"
                    >
                      <span className="font-mono text-[10px] text-[#C7A36D]/60 uppercase tracking-[0.12em]">
                        {String(module.orden).padStart(2, '0')}
                      </span>
                      <span className="block text-sm text-[#B8B4AA] hover:text-[#F4F2EC] transition-colors duration-200">
                        {module.titulo}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </li>

          {/* Mobile Acceder Button */}
          <li className="pt-4 border-t border-[rgba(244,242,236,0.08)]">
            <a
              href="https://curso2-nine.vercel.app/#/login"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-mono text-sm uppercase tracking-[0.14em] px-6 py-3 border border-[#C7A36D] text-[#C7A36D] hover:bg-[#C7A36D] hover:text-[#0B0B0D] transition-all duration-300 rounded-sm"
            >
              Acceder
            </a>
          </li>
        </ul>
      </div>
    </div>,
    document.body
  );
});

MobileMenuPortal.displayName = 'MobileMenuPortal';

const Navigation = memo(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [modules, setModules] = useState<PublicModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  
  const {
    showModulesDropdown,
    setShowModulesDropdown,
    mobileMenuOpen,
    setMobileMenuOpen,
    activeSection,
    setActiveSection,
  } = useNavigation();

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
      setMobileMenuOpen(false);
      setShowModulesDropdown(false);
    }
  };

  const scrollToModule = (moduleId: string) => {
  setShowModulesDropdown(false);
  setMobileMenuOpen(false);
  setActiveSection(`modulo-${moduleId}`);

  setTimeout(() => {
    const element = document.getElementById(`modulo-${moduleId}`);
    if (!element) {
      const first = document.getElementById('modulos');
      if (first) window.scrollTo({ top: first.offsetTop, behavior: 'smooth' });
      return;
    }

    // GSAP envuelve el elemento en un pin-spacer — apuntamos a ese wrapper
    const pinSpacer = element.closest('[data-pin-spacer]') as HTMLElement;
    const target = pinSpacer || element;
    const offsetTop = target.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  }, 100); // pequeño delay para que el menú cierre antes de scrollear
};

  const navItems = [
    { id: 'curso', label: 'Curso' },
    { id: 'calendario', label: 'Calendario' },
    { id: 'inscripcion', label: 'Inscripción' },
  ];

  return (
    <>
      {/* Logo - always visible */}
      <div className={`fixed top-[4vh] left-[4vw] z-[100] max-w-[50vw] md:max-w-full transition-opacity duration-500 ${
        isVisible ? 'opacity-50' : 'opacity-100'
      }`}>
        <img 
          src="public/images/logo.png" 
          alt="Poética de la Mirada" 
          className="h-6 sm:h-8 md:h-10 w-auto object-contain"
          onError={(e) => {
            // Fallback si el logo no existe
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={`fixed top-[4vh] right-[4vw] z-[101] lg:hidden p-2 rounded-sm transition-all duration-300 ${
          isVisible || mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        } ${mobileMenuOpen ? 'bg-[#C7A36D] text-[#0B0B0D]' : 'bg-[#141419]/80 text-[#F4F2EC]'}`}
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Desktop Navigation - appears after hero */}
      <nav
        className={`fixed top-[4vh] right-[4vw] z-[100] transition-opacity duration-500 hidden lg:block ${
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

          {/* Modules Dropdown Button */}
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

      {/* Portals - renderizados fuera del árbol DOM de LandingPage */}
      <ModulesDropdownPortal
        isOpen={showModulesDropdown && !mobileMenuOpen}
        modules={modules}
        loading={loadingModules}
        onClose={() => setShowModulesDropdown(false)}
        onSelectModule={scrollToModule}
      />

      <MobileMenuPortal
        isOpen={mobileMenuOpen}
        modules={modules}
        loading={loadingModules}
        activeSection={activeSection}
        onClose={() => setMobileMenuOpen(false)}
        onSelectSection={scrollToSection}
        onSelectModule={scrollToModule}
        showModulesDropdown={showModulesDropdown}
        onToggleModulesDropdown={() => setShowModulesDropdown(!showModulesDropdown)}
      />
    </>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
