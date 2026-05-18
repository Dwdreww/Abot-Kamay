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
      {/* Hero Background with Complex Gradients */}
      <div className="relative overflow-hidden bg-blue-800 text-white min-h-[95vh] flex flex-col">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-400/20 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-blue-900/50 blur-[100px] rounded-full"></div>
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:32px_32px]"></div>

          {/* Subtle dots group */}
          <div className="absolute top-1/4 left-10 grid grid-cols-4 gap-2 opacity-20">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
            ))}
          </div>
        </div>

        {/* Header */}
        <header className="relative z-50 flex items-center justify-between px-6 py-8 mx-auto w-full max-w-7xl md:px-12 shrink-0 border-b border-white/10 backdrop-blur-md">
          <div className="flex items-center">
            <img
              src="/logoAbotKamay.png"
              alt="Abot-Kamay Logo"
              className="h-10 md:h-12 w-auto rounded-xl"
            />
          </div>

          <div className="hidden md:flex items-center gap-12">
            <nav className="flex gap-8 text-sm font-bold tracking-wide uppercase">
              <a href="#services" className="opacity-80 hover:opacity-100 transition-opacity">Mga Serbisyo</a>
              <a href="#information" className="opacity-80 hover:opacity-100 transition-opacity">Impormasyon</a>
              <a href="#support" className="opacity-80 hover:opacity-100 transition-opacity">Suporta</a>
            </nav>
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-sm font-bold transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] border border-white/20 active:scale-95"
            >
              <Lock className="w-4 h-4" />
              Mag-Login
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <section className="relative z-10 px-6 pt-12 pb-24 mx-auto max-w-7xl md:px-12 md:pt-20 md:pb-32 flex-grow flex items-center">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div className="space-y-10 text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
              >
                <div className="w-6 h-6 overflow-hidden rounded-full border border-white/20">
                  <img src="/sadplogo.png" alt="Barangay Logo" className="w-full h-full object-cover" />
                </div>
                Brgy. San Antonio De Padua I
              </motion.div>

              <div className="space-y-6">
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl font-black leading-[1.05] tracking-tight md:text-8xl"
                >
                  Mas Madaling <br />
                  Serbisyo, <br />
                  <span className="text-blue-200">Abot-Kamay Na.</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="max-w-lg text-lg md:text-xl font-medium leading-relaxed opacity-90"
                >
                  Ang Abot-Kamay ay ang opisyal na digital platform para sa mga Serbisyo ng PWD sa Barangay San Antonio De Padua I, pinapabilis ang mga dokumento, tulong, at suporta sa komunidad para sa bawat Pilipinong may kapansanan.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-5 pt-4"
              >
                <button
                  onClick={onStart}
                  className="px-10 py-5 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-blue-900/40 flex items-center gap-3 active:scale-95 group"
                >
                  <div className="p-1.5 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  Tingnan ang mga Serbisyo
                </button>
                <button
                  onClick={onCheckStatus}
                  className="px-10 py-5 bg-transparent border-2 border-white/30 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 active:scale-95"
                >
                  <Search className="w-5 h-5 opacity-60" />
                  I-track ang Request Ko
                </button>
              </motion.div>
            </div>

            {/* Image Collage from Mockup Style */}
            <div className="relative">
              <div className="relative grid grid-cols-12 gap-5 items-start">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="col-span-8 overflow-hidden rounded-[3rem] shadow-2xl border-4 border-white/10"
                >
                  <img
                    src="/random_portal.png"
                    alt="Man in wheelchair"
                    className="object-cover w-full h-[450px]"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>

                <div className="col-span-4 space-y-5 pt-12">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="overflow-hidden rounded-[2.5rem] shadow-2xl border-4 border-white/10"
                  >
                    <img
                      src="/renewal.png"
                      alt="PWD woman walking"
                      className="object-cover w-full h-[240px]"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white/10"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=2070&auto=format&fit=crop"
                      alt="Helping elderly"
                      className="object-cover w-full h-[180px]"
                      referrerPolicy="no-referrer"
                    />
                  </motion.div>
                </div>

                {/* Floating Info Card */}
                <motion.div
                  initial={{ opacity: 0, y: 40, x: -40 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-[-20px] left-[10%] bg-white rounded-3xl p-8 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.3)] max-w-[320px] border border-blue-50"
                >
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-blue-100 rounded-2xl shrink-0">
                      <Users className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-slate-800 font-bold text-sm leading-tight">
                        Bumubuo ng isang komunidad kung saan <span className="text-blue-600">lahat ay kasali.</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Services Section */}
      <section id="services" className="px-6 py-32 mx-auto max-w-7xl md:px-12">
        <div className="text-center space-y-5 mb-24">
          <span className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px]">Ang Aming Mga Serbisyo</span>
          <h2 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">Simpleng Serbisyo para sa Pang-araw-araw na Pangangailangan</h2>
          <p className="max-w-2xl mx-auto text-slate-500 font-medium text-lg md:text-xl leading-relaxed">
            Idinisenyo upang maging madaling gamitin, abot-kamay ng lahat, at nakasentro sa kung ano ang mahalaga sa inyo.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          <FeatureCard
            icon={<Shield className="w-8 h-8 text-blue-600" />}
            title="Pinag-isang Rekord"
            description="Centralized na pamamahala ng impormasyon para sa mga PWD profile na may real-time na pag-verify at history tracking."
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8 text-blue-600" />}
            title="Mga Smart Form"
            description="Awtomatikong paggawa ng PDF para sa burial assistance, DOH registries, at medical certifications."
          />
          <FeatureCard
            icon={<Search className="w-8 h-8 text-blue-600" />}
            title="Bukas na Pag-track"
            description="Transparency para sa bawat mamamayan. Subaybayan ang mga aplikasyon gamit ang isang reference number."
          />
        </div>
      </section>

      {/* Visual Highlight Cards */}
      <section id="information" className="px-6 py-48 mx-auto max-w-7xl md:px-12">
        <div className="grid gap-12 md:grid-cols-3 bg-blue-900 p-12 md:p-20 rounded-[60px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-800/30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

          <HighlightCard
            image="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2070&auto=format&fit=crop"
            title="Mas Mabilis na Tulong"
            desc="Nabawasang oras sa pagproseso para sa iyong mga request."
          />
          <HighlightCard
            image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2026&auto=format&fit=crop"
            title="Ligtas na Impormasyon"
            desc="Ang iyong impormasyon ay ligtas at palaging updated."
          />
          <HighlightCard
            image="https://images.unsplash.com/photo-1581578731522-745a05ad9ad2?q=80&w=2070&auto=format&fit=crop"
            title="Kalinga ng Komunidad"
            desc="Naglilingkod ng may malasakit at paggalang."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-24 pb-12" id="support">
        <div className="px-6 mx-auto max-w-7xl md:px-12">
          {/* Main Footer Grid */}
          <div className="grid gap-16 lg:grid-cols-4 md:grid-cols-2 pb-20">
            <div className="space-y-8">
              <img
                src="/logoAbotKamay.png"
                alt="Abot-Kamay Logo"
                className="h-12 w-auto rounded-xl"
              />
              <p className="text-sm font-medium leading-relaxed opacity-50 max-w-[240px]">
                Empowering Filipinos with disabilities through accessible services, inclusive governance, and compassionate community support.
              </p>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-l-2 border-blue-500 pl-3">Makipag-ugnayan sa Amin</h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold leading-relaxed opacity-80 uppercase tracking-widest">
                    Blk 04, Barangay Hall San Antonio de Padua I <br />Dasmariñas, Philippines
                  </span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Phone className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold opacity-80 uppercase tracking-widest leading-none">(046) 506 3804</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Mail className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-xs font-bold opacity-80 uppercase tracking-widest leading-none">sanantoniodepadua1.dasma@gmail.com</span>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-l-2 border-blue-500 pl-3">Oras ng Serbisyo</h4>
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <ul className="space-y-4">
                  <li className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Mon - Fri</span>
                    <span className="text-xs font-black uppercase tracking-widest">8:00 AM - 5:00 PM</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Saturday</span>
                    <span className="text-xs font-black uppercase tracking-widest">8:00 AM - 12:00 PM</span>
                  </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-400">Sarado tuwing Linggo at Holidays</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 border-l-2 border-blue-500 pl-3">Follow Us</h4>
              <a
                href="https://www.facebook.com/OfficialSADP1/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10 group"
              >
                <div className="p-3 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-900/50 group-hover:scale-110 transition-transform">
                  <Facebook className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Facebook</span>
                  <span className="text-xs font-bold tracking-tight">Barangay San Antonio de Padua I</span>
                </div>
              </a>
            </div>
          </div>

          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
              © {new Date().getFullYear()} Abot-Kamay. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em]">Privacy Policy</a>
              <a href="#" className="text-[10px] font-black text-white/30 hover:text-white transition-colors uppercase tracking-[0.2em]">Terms of Use</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center p-12 bg-white rounded-[40px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)] border border-slate-50 text-center hover:translate-y-[-8px] transition-all duration-500 hover:shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="mb-10 p-6 bg-blue-50 rounded-3xl group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">{title}</h3>
      <p className="text-base font-medium text-slate-500 leading-relaxed max-w-[260px]">{description}</p>
      <button className="mt-12 flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-[0.2em] hover:gap-4 transition-all group/btn">
        Alamin ang iba pa
        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
      </button>
    </div>
  );
}

function HighlightCard({ image, title, desc }: { image: string, title: string, desc: string }) {
  return (
    <div className="relative overflow-hidden rounded-[40px] aspect-[4/3] group cursor-pointer shadow-2xl">
      <img
        src={image}
        alt={title}
        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 brightness-95 group-hover:brightness-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-blue-900/95 via-blue-900/40 to-transparent p-10 flex flex-col justify-end text-white">
        <h4 className="text-2xl font-black tracking-tight mb-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">{title}</h4>
        <p className="text-sm font-medium text-white/70 max-w-[220px] translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">{desc}</p>
        <div className="absolute bottom-8 right-8 w-14 h-14 bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-150">
          <ArrowRight className="w-7 h-7" />
        </div>
      </div>
    </div>
  );
}
