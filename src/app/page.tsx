import { AuthButton } from "@/components/features/auth/AuthButton";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#121212] selection:bg-primary/30">
      
      {/* Dark Canvas Spotlight Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-20 animate-pulse duration-[4000ms]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#121212]/50 to-[#121212]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#121212]/80 to-[#121212]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)', 
             backgroundSize: '40px 40px' 
           }} 
      />

      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center text-center">
        
        {/* Header / Badge */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-medium tracking-widest text-white/60 uppercase">Doppelganger Connect</span>
          </div>
        </div>

        {/* Hero Typography */}
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-7xl lg:text-8xl drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Discover Your <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
            Exact Facial Twin
          </span>
        </h1>

        {/* Value Prop */}
        <p className="mb-12 max-w-2xl text-lg text-white/60 sm:text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          Using advanced neural rendering to locate your biological mirror image across 8 billion people. 
          <span className="block mt-2 text-white/40 text-sm">Results generated in under 30 seconds.</span>
        </p>

        {/* CTA Section */}
        <div className="animate-in fade-in zoom-in duration-700 delay-500">
          <AuthButton />
        </div>

        {/* Footer / Trust Indicators */}
        <div className="mt-20 flex flex-wrap justify-center gap-8 opacity-40 animate-in fade-in duration-1000 delay-700">
          {['99.8% Accuracy', 'Biometric Encryption', 'Global Database'].map((text) => (
            <div key={text} className="flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-white">
              <div className="h-[1px] w-4 bg-white/50" />
              {text}
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
