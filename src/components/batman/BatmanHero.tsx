import { Shield } from 'lucide-react';
const logoBatman = '/logo-batman.png';

export const BatmanHero = () => {
  return (
    <div className="relative bg-gradient-to-br from-gotham-black via-gotham-gray to-gotham-black min-h-[300px] flex items-center justify-center overflow-hidden">
      {/* Batman Logo Background - Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img 
          src={logoBatman} 
          alt="" 
          aria-hidden="true"
          className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 object-contain opacity-[0.08] select-none"
          style={{ filter: 'brightness(1.2) contrast(1.1)' }}
        />
      </div>
      
      {/* Hexagonal Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
              <polygon points="25,0 50,14.4 50,28.9 25,43.4 0,28.9 0,14.4" fill="none" stroke="#d4af37" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagons)" />
        </svg>
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 text-center px-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Shield className="w-12 h-12 text-gotham-gold icon-glow" />
          <h1 className="text-4xl md:text-6xl font-bold gradient-text">
            Wayne Industries
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl text-gotham-light mb-4 font-semibold tracking-wide">
          Advancing Tomorrow's Technology Today
        </p>
        
        <p className="text-gotham-light/80 max-w-2xl mx-auto leading-relaxed">
          Gerenciamento de recursos corporativos com tecnologia de ponta para a segurança e eficiência de Gotham City
        </p>
        
        {/* Animated Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-gotham-gold rounded-full animate-pulse-gold"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gotham-black to-transparent" />
    </div>
  );
};