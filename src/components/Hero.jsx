import Spline from '@splinetool/react-spline';

export default function Hero({ onStart }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#1A1F2C] text-[#FEF9F0]">
      <div className="absolute inset-0 opacity-60">
        <Spline scene="https://prod.spline.design/qQUip0dJPqrrPryE/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>Style Sage</h1>
        <p className="text-lg md:text-xl text-[#FEF9F0]/90">Your personal wardrobe curator. Get precise, premium outfit recommendations tailored to you.</p>
        <button onClick={onStart} className="inline-flex items-center justify-center rounded-full px-6 py-3 bg-[#D4AF37] text-[#1A1F2C] font-semibold shadow-[0_10px_30px_rgba(212,175,55,0.35)] hover:brightness-110 transition">Start</button>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1F2C] via-transparent to-transparent" />
    </section>
  );
}
