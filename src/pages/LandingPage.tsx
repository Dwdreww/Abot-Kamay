import React from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  FileText,
  Search,
  Users,
  MapPin,
  Phone,
  ArrowRight,
  Lock,
  Mail,
  Clock,
  Facebook,
  Database,
  Eye
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onCheckStatus: () => void;
}

export default function LandingPage({ onStart, onCheckStatus }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#0b1d3a] text-white min-h-[95vh] flex flex-col">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] right-[-8%] w-[55%] h-[55%] bg-blue-500/15 blur-[140px] rounded-full"></div>
          <div className="absolute bottom-[5%] left-[-5%] w-[35%] h-[45%] bg-blue-900/60 blur-[120px] rounded-full"></div>
          <div className="absolute top-[40%] left-[30%] w-[20%] h-[20%] bg-blue-400/10 blur-[80px] rounded-full"></div>
          <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:28px_28px]"></div>
          <div className="absolute top-1/4 left-10 grid grid-cols-4 gap-2 opacity-15">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Header */}
        <header className="relative z-50 flex items-center justify-between px-6 py-6 mx-auto w-full max-w-7xl md:px-12 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/WHITE-Abot-kamay-logo.png" alt="Abot-Kamay Logo" className="h-14 md:h-16 w-auto" />
          </div>

          <div className="hidden md:flex items-center gap-10">
            <nav className="flex gap-8 text-sm font-semibold">
              <a href="#services" className="text-white/70 hover:text-white transition-colors">Mga Serbisyo</a>
              <a href="#information" className="text-white/70 hover:text-white transition-colors">Impormasyon</a>
              <a href="#support" className="text-white/70 hover:text-white transition-colors">Suporta</a>
            </nav>
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/40 border border-blue-500/50 active:scale-95"
            >
              <Lock className="w-4 h-4" />
              Mag-Login
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <section className="relative z-10 px-6 pt-10 pb-28 mx-auto max-w-7xl md:px-12 md:pt-16 md:pb-36 flex-grow flex items-center">
          <div className="grid items-center gap-14 lg:grid-cols-2 w-full">

            {/* Left: text */}
            <div className="space-y-8 text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/15 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <div className="w-5 h-5 overflow-hidden rounded-full border border-white/20 shrink-0">
                  <img src="/sadplogo.png" alt="Barangay Logo" className="w-full h-full object-cover" />
                </div>
                Brgy. San Antonio De Padua I
              </motion.div>

              <div className="space-y-5">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-5xl font-black leading-[1.06] tracking-tight md:text-7xl"
                >
                  Mas Madaling <br />
                  Serbisyo, <br />
                  <span className="text-blue-300">Abot-Kamay Na.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="max-w-md text-base md:text-lg font-medium leading-relaxed text-white/75"
                >
                  Ang Abot-Kamay ay ang opisyal na digital platform para sa mga Serbisyo ng PWD sa Barangay San Antonio De Padua I, pinapabilis ang mga dokumento, tulong, at suporta sa komunidad para sa bawat Pilipinong may kapansanan.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <button
                  onClick={onStart}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 flex items-center gap-3 active:scale-95 group"
                >
                  <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  Tingnan ang mga Serbisyo
                </button>
                <button
                  onClick={onCheckStatus}
                  className="px-8 py-4 bg-white/8 border border-white/25 hover:bg-white/15 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95 backdrop-blur-sm"
                >
                  <Search className="w-4 h-4 opacity-70" />
                  I-track ang Request Ko
                </button>
              </motion.div>
            </div>

            {/* Right: image collage */}
            <div className="relative">
              <div className="relative grid grid-cols-12 gap-4 items-start">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="col-span-8 overflow-hidden rounded-[2.5rem] shadow-2xl border-2 border-white/10"
                >
                  <img
                    src="/random_portal.png"
                    alt="Man in wheelchair"
                    className="object-cover w-full h-[440px]"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>

                <div className="col-span-4 space-y-4 pt-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="overflow-hidden rounded-[2rem] shadow-2xl border-2 border-white/10"
                  >
                    <img
                      src="/renewal.png"
                      alt="PWD woman walking"
                      className="object-cover w-full h-[230px]"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="overflow-hidden rounded-[1.75rem] shadow-2xl border-2 border-white/10"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2070&auto=format&fit=crop"
                      alt="Helping elderly"
                      className="object-cover w-full h-[170px]"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </div>

                {/* Floating Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 40, x: -40 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-[-16px] left-[8%] bg-white rounded-2xl p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25)] max-w-[300px] border border-blue-50"
                >
                  <div className="flex gap-3 items-start">
                    <div className="p-2.5 bg-blue-100 rounded-xl shrink-0">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-slate-800 font-bold text-sm leading-snug">
                      Bumubuo ng isang komunidad kung saan <span className="text-blue-600">lahat ay kasali.</span>
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Services Section ─────────────────────────────────────────────── */}
      <section id="services" className="bg-gradient-to-b from-blue-50/70 via-blue-50/30 to-white px-6 py-24 mx-auto w-full max-w-none md:px-0">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center space-y-4 mb-20">
            <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">Ang Aming Mga Serbisyo</span>
            <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Simpleng Serbisyo para sa Pang-araw-araw na Pangangailangan</h2>
            <p className="max-w-xl mx-auto text-slate-500 font-medium text-base md:text-lg leading-relaxed">
              Idinisenyo upang maging madaling gamitin, abot-kamay ng lahat, at nakasentro sa kung ano ang mahalaga sa inyo.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Shield className="w-7 h-7 text-blue-600" />}
              title="Pinag-isang Rekord"
              description="Centralized na pamamahala ng impormasyon para sa mga PWD profile na may real-time na pag-verify at history tracking."
            />
            <FeatureCard
              icon={<FileText className="w-7 h-7 text-blue-600" />}
              title="Mga Smart Form"
              description="Awtomatikong paggawa ng PDF para sa burial assistance, DOH registries, at medical certifications."
            />
            <FeatureCard
              icon={<Search className="w-7 h-7 text-blue-600" />}
              title="Bukas na Pag-track"
              description="Transparency para sa bawat mamamayan. Subaybayan ang mga aplikasyon gamit ang isang reference number."
            />
          </div>
        </div>
      </section>

      {/* ── Visual Highlight Cards ───────────────────────────────────────── */}
      <section id="information" className="px-6 py-20 mx-auto max-w-7xl md:px-12">
        <div className="grid gap-6 md:grid-cols-3 bg-[#0b1d3a] p-8 md:p-12 rounded-[48px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-600/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-800/30 blur-[80px] rounded-full pointer-events-none"></div>

          <HighlightCard
            image="/mas_mabilis_na_tulong.png"
            title="Mas Mabilis na Tulong"
            desc="Nabawasang oras sa pagproseso para sa iyong mga request."
          />
          <HighlightCard
            image="/ligtas_na_impormasyon.png"
            title="Ligtas na Impormasyon"
            desc="Ang iyong impormasyon ay ligtas at palaging updated."
          />
          <HighlightCard
            image="/kalinga_ng_komunidad.png"
            title="Kalinga ng Komunidad"
            desc="Naglilingkod ng may malasakit at paggalang."
          />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-[#0b1d3a] text-white pt-20 pb-10 mt-8" id="support">
        <div className="px-6 mx-auto max-w-7xl md:px-12">

          {/* Main footer grid — 4 balanced columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12 xl:gap-10 pb-16 border-b border-white/10">

            {/* Col 1 — Brand */}
            <div className="space-y-6">
              <img src="/WHITE-Abot-kamay-logo.png" alt="Abot-Kamay Logo" className="h-14 w-auto" />
              <p className="text-sm font-medium leading-relaxed text-white/50 max-w-[220px]">
                Empowering Filipinos with disabilities through accessible services, inclusive governance, and compassionate community support.
              </p>
            </div>

            {/* Col 2 — Contact */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-l-2 border-blue-500 pl-3">
                Makipag-ugnayan sa Amin
              </h4>
              <ul className="space-y-5">
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-white/5 rounded-lg shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-semibold leading-relaxed text-white/70">
                    Blk 04, Barangay Hall San Antonio de Padua I,<br />Dasmariñas, Philippines
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="p-2 bg-white/5 rounded-lg shrink-0">
                    <Phone className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-semibold text-white/70">(046) 506 3804</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-white/5 rounded-lg shrink-0 mt-0.5">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-semibold text-white/70 break-all leading-relaxed">
                    sanantoniodepadua1.dasma@gmail.com
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 3 — Hours */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-l-2 border-blue-500 pl-3">
                Oras ng Serbisyo
              </h4>
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-wider shrink-0">Mon – Fri</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider text-right">8:00 AM – 5:00 PM</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-wider shrink-0">Saturday</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-wider text-right">8:00 AM – 12:00 PM</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full shrink-0"></div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-red-400 leading-snug">
                    Sarado tuwing Linggo at Holidays
                  </span>
                </div>
              </div>
            </div>

            {/* Col 4 — Social */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-l-2 border-blue-500 pl-3">
                Follow Us
              </h4>
              <a
                href="https://www.facebook.com/OfficialSADP1/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group"
              >
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/50 group-hover:scale-110 transition-transform shrink-0">
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Facebook</span>
                  <span className="text-xs font-bold text-white/80 leading-snug">Barangay San Antonio de Padua I</span>
                </div>
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Abot-Kamay. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-[10px] font-bold text-white/30 hover:text-white/70 transition-colors uppercase tracking-[0.2em]">Privacy Policy</a>
              <a href="#" className="text-[10px] font-bold text-white/30 hover:text-white/70 transition-colors uppercase tracking-[0.2em]">Terms of Use</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col p-8 bg-white rounded-[32px] shadow-[0_4px_30px_-8px_rgba(0,0,0,0.08)] border border-slate-100 hover:-translate-y-2 transition-all duration-500 hover:shadow-xl hover:shadow-blue-100/60 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-[32px]"></div>
      <div className="mb-6 p-4 bg-blue-50 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-sm font-medium text-slate-500 leading-relaxed flex-grow">{description}</p>
      <button className="mt-8 flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] hover:gap-4 transition-all group/btn w-fit">
        Alamin ang iba pa
        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
      </button>
    </div>
  );
}

function HighlightCard({ image, title, desc }: { image: string; title: string; desc: string }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] aspect-[4/3] group cursor-pointer shadow-xl">
      <img
        src={image}
        alt={title}
        className="object-cover w-full h-full group-hover:scale-108 transition-transform duration-700 brightness-90 group-hover:brightness-100"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d3a]/95 via-[#0b1d3a]/30 to-transparent p-8 flex flex-col justify-end text-white">
        <h4 className="text-xl font-black tracking-tight mb-2">{title}</h4>
        <p className="text-sm font-medium text-white/65 max-w-[220px] leading-snug">{desc}</p>
        <div className="absolute bottom-7 right-7 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-900/50 group-hover:scale-110 transition-transform duration-300">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}
