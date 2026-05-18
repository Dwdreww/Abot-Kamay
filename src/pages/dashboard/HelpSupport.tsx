import React, { useState } from 'react';
import {
   Phone, Mail, MessageSquare, ChevronRight,
   HelpCircle, ClipboardList, BookOpen, Video,
   RefreshCw, Download, ShieldCheck, ArrowRight,
   Plus, Search, Info, MessageCircle, ChevronDown,
   ArrowUpRight
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function HelpSupport() {
   const [openFaq, setOpenFaq] = useState<number | null>(null);

   const contactMethods = [
      {
         title: 'Voice Hotline',
         value: '(046) 506 3804',
         desc: 'Connect with a live agent.',
         icon: Phone,
         color: 'bg-blue-50 text-blue-600'
      },
      {
         title: 'Email Address',
         value: 'sanantoniodepadua1.dasma@gmail.com',
         desc: 'Average response: 2 hours.',
         icon: Mail,
         color: 'bg-emerald-50 text-emerald-600'
      },
      {
         title: 'Admin Chat',
         value: 'Barangay San Antonio De Padua I Messenger',
         desc: 'Real-time staff assistance.',
         icon: MessageCircle,
         color: 'bg-purple-50 text-purple-600'
      }
   ];

   const faqs = [
      { q: 'Paano ako magsisimula gumamit ng Abot-Kamay??', a: 'Mag-log in gamit ang iyong account. Pagkapasok, makikita sa kaliwang menu ang mga pangunahing bahagi ng system tulad ng Mga Digital Form, Mga Aplikasyon, Mga Anunsyo, at Profile / Account. Pindutin lamang ang bahagi na kailangan mo.' },
      { q: 'Saan ko makikita at masasagutan ang PWD forms?', a: 'Pindutin ang Mga Digital Form sa kaliwang menu. Piliin ang form na kailangan, tulad ng PWD application, renewal, burial assistance, o certificate request. Sagutan ang mga hinihinging impormasyon at i-upload ang kinakailangang dokumento kung meron.' },
      { q: 'Paano ko malalaman kung approved na ang aking application?', a: 'Pindutin ang Mga Aplikasyon upang makita ang status ng iyong request. Maaari itong lumabas bilang Pending, For Review, Approved, o Rejected. Makakatanggap ka rin ng notification sa bell icon kapag may update ang admin.' },
      { q: 'Ano ang gagawin ko kung hindi ko alam ang pipindutin?', a: 'Pumunta sa Support Center o pindutin ang Contact System Admin. Maaari kang humingi ng tulong sa admin kung nahihirapan kang mag-fill up ng form, mag-upload ng dokumento, o hanapin ang status ng iyong application.' },
   ];

   return (
      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
         {/* Header & Search */}
         <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="space-y-3">
               <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Support Center</h2>
               <p className="text-slate-500 font-medium tracking-tight">Need assistance? Explore our resources or connect with the admin team.</p>
            </div>
            <div className="relative group w-full lg:w-96">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
               <input
                  type="text"
                  placeholder="Describe your issue or ask a question..."
                  className="w-full pl-14 pr-8 py-5 bg-white border border-slate-100 rounded-[24px] outline-none text-xs font-bold shadow-xl shadow-slate-200/20 focus:ring-4 focus:ring-blue-50 transition-all"
               />
            </div>
         </div>

         <div className="grid lg:grid-cols-3 gap-10">
            {/* FAQ & Knowledge Base */}
            <div className="lg:col-span-2 space-y-10">
               <div className="bg-white rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden">
                  <div className="p-12 border-b border-slate-50">
                     <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Frequently Asked Questions</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Quick answers to common system inquiries.</p>
                  </div>
                  <div className="divide-y divide-slate-50 overflow-hidden">
                     {faqs.map((faq, i) => (
                        <div key={i} className="group">
                           <button
                              onClick={() => setOpenFaq(openFaq === i ? null : i)}
                              className="w-full p-8 flex items-center justify-between text-left hover:bg-slate-50/50 transition-all"
                           >
                              <span className={cn(
                                 "text-[13px] font-black uppercase tracking-tight transition-colors",
                                 openFaq === i ? "text-blue-600" : "text-slate-900"
                              )}>{faq.q}</span>
                              <ChevronDown className={cn(
                                 "w-5 h-5 text-slate-300 transition-transform duration-300",
                                 openFaq === i ? "rotate-180 text-blue-600" : ""
                              )} />
                           </button>
                           <AnimatePresence>
                              {openFaq === i && (
                                 <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden bg-slate-50/30"
                                 >
                                    <div className="p-8 pt-0 text-sm font-medium text-slate-500 leading-relaxed max-w-2xl">
                                       {faq.a}
                                    </div>
                                 </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     ))}
                  </div>
               </div>


            </div>

            {/* Contact Sidebar */}
            <div className="space-y-8">
               <div className="bg-[#0b1a38] rounded-[50px] p-10 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10 space-y-8">
                     <div className="space-y-2">
                        <h4 className="text-xl font-black tracking-tight uppercase">Direct Assistance</h4>
                        <p className="text-xs font-medium text-white/50">Speak directly with our technical administrators.</p>
                     </div>

                     <div className="space-y-6">
                        {contactMethods.map((method, i) => {
                           const Icon = method.icon;
                           return (
                              <div key={i} className="flex gap-5">
                                 <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                    method.color.replace('text-', 'text-white/').replace('bg-', 'bg-white/')
                                 )}>
                                    <Icon className="w-5 h-5 text-white" />
                                 </div>
                                 <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{method.title}</p>
                                    <p className="text-sm font-black uppercase tracking-tight">{method.value}</p>
                                    <p className="text-[10px] font-medium text-white/40">{method.desc}</p>
                                 </div>
                              </div>
                           );
                        })}
                     </div>

                     <button className="w-full py-5 bg-white/10 hover:bg-white text-white hover:text-[#0b1a38] border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                        Contact System Admin <ArrowUpRight className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-600/20 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2"></div>
               </div>


            </div>
         </div>
      </div>
   );
}
