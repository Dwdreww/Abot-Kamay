import React, { useState } from 'react';
import {
  Megaphone, ArrowRight, X, Info, FileText,
  ShieldCheck, AlertTriangle, Scale, Calendar, Pin
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Announcement {
  id: number;
  title: string;
  summary: string;
  category: string;
  date: string;
  image: string;
  icon: React.ReactNode;
  fullContent: React.ReactNode;
}

export default function Announcements() {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  const announcements: Announcement[] = [
    {
      id: 1,
      title: 'PARA SA MGA BAGONG APLIKANTE',
      summary: 'Mahahalagang requirements at panuntunan para sa mga unang beses kukuha ng PWD ID.',
      category: 'Mga Requirement',
      date: 'Mabisa ngayong 2024',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop',
      icon: <FileText className="w-4 h-4" />,
      fullContent: (
        <div className="space-y-6">
          <p className="text-slate-600 font-medium font-sans">Ihanda ang mga sumusunod na dokumento para sa bagong aplikasyon ng PWD ID:</p>
          <ul className="space-y-4">
            {[
              "Pinakabagong Medical Certificate / Certificate of Disability na inisyu ng Licensed Physician at Specialist para sa mga kliyenteng may hindi halatang kapansanan.",
              "Orihinal na Barangay Certificate para sa aplikasyon ng PWD ID.",
              "Photocopy ng Voter's ID / Slip / Voter's Certificate ng PWD (o ng mga magulang kung menor de edad).",
              "Birth Certificate, o Marriage Certificate kung kasal.",
              "Mga pinakabagong ID picture: Dalawang (2) pirasong 2x2 at dalawang (2) pirasong 1x1."
            ].map((item, i) => (
              <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 text-[10px] font-black">{i + 1}</div>
                <p className="text-sm font-bold text-slate-700 leading-relaxed font-sans">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: 2,
      title: 'PARA SA RENEWAL',
      summary: 'Panatilihin ang iyong mga benepisyo sa pamamagitan ng pag-renew ng iyong PWD ID. Tingnan ang mga update na requirement dito.',
      category: 'Renewal',
      date: 'Mabisa ngayong 2024',
      image: 'public/renewal.png',
      icon: <Pin className="w-4 h-4" />,
      fullContent: (
        <div className="space-y-6">
          <p className="text-slate-600 font-medium font-sans">Mga Requirement para sa PWD ID Renewal:</p>
          <ul className="space-y-4">
            {[
              "I-surrender ang lumang PWD ID (ilakip sa PWD Registry Form).",
              "Pinakabagong Medical Certificate / Certificate of Disability na inisyu ng Licensed Physician at Specialist para sa mga kliyenteng may hindi halatang kapansanan.",
              "Orihinal na Barangay Certificate para sa PWD ID renewal.",
              "Photocopy ng Voter's ID / Slip / Voter's Certificate ng PWD (o ng mga magulang kung menor de edad).",
              "Birth Certificate, o Marriage Certificate kung kasal.",
              "Dalawang (2) pirasong pinakabagong 1x1 ID picture."
            ].map((item, i) => (
              <li key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center shrink-0 text-[10px] font-black">{i + 1}</div>
                <p className="text-sm font-bold text-slate-700 leading-relaxed font-sans">{item}</p>
              </li>
            ))}
          </ul>
          <div className="mt-8 p-6 bg-blue-50 rounded-[30px] border border-blue-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-blue-900 uppercase tracking-tight font-sans">Para sa mga Katanungan</p>
              <p className="text-sm font-bold text-blue-600 font-sans">Tawagan ang Persons with Disability Affairs Office (PDAO) sa 416-5393</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Disability Classification at Mga Panuntunan sa Medical Eligibility',
      summary: 'Mga update ng National Council on Disability Affairs (NCDA) sa mga kinikilalang kondisyong medikal.',
      category: 'Opisyal',
      date: 'Advisory ng NCDA',
      image: 'public/listofpwd.png',
      icon: <ShieldCheck className="w-4 h-4" />,
      fullContent: (
        <div className="space-y-8">
          <div>
            <h4 className="flex items-center gap-2 text-red-600 font-black text-sm uppercase tracking-tight mb-4 font-sans">
              <AlertTriangle className="w-4 h-4" /> Hindi Pa Kinikilala
            </h4>
            <p className="text-xs text-slate-500 mb-4 font-medium italic font-sans">Mga kondisyong medikal o malalang sakit na HINDI PA kinikilala bilang kapansanan:</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "Endometriosis", "Psoriasis", "Diabetes", "Bronchial Asthma",
                "Scoliosis", "Depression Disorder", "SLE or Lupus",
                "Heart Problem/condition", "HIV", "Stroke", "Kidney Failure"
              ].map((item, i) => (
                <div key={i} className="px-4 py-2 bg-red-50 text-red-700 rounded-xl text-[10px] font-black uppercase tracking-tight border border-red-100 flex items-center gap-2 font-sans">
                  <span className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center text-[8px] font-sans">{i + 1}</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8">
            <h4 className="text-blue-600 font-black text-sm uppercase tracking-tight mb-4 font-sans">Hindi Halatang Kapansanan (Non-Apparent)</h4>
            <div className="mb-6">
              <p className="text-sm text-slate-600 leading-relaxed font-medium font-sans">
                Sertipiko ng kapansanan na inisyu ng mga ESPESYALISTA o kaukulang doktor mula sa City, Municipal/ Regional Health Officers o alinmang kinikilalang pribadong institusyong medikal na may kakayahang suriin ang mga sumusunod:
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                "Deaf/Hard of Hearing Disability", "Intellectual Disability",
                "Learning Disability", "Mental Disability",
                "Psychosocial Disability", "Non-apparent Visual Disability",
                "Non-apparent Speech and Language Impairment",
                "Non-apparent Cancer", "Non-apparent Rare Disease"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 font-sans">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <p className="text-xs font-black text-blue-900 uppercase tracking-tight font-sans">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: 'MGA LEGAL NA BATAYAN',
      summary: 'Mga administrative order at memorandum circular na sumasaklaw sa mga serbisyo at karapatan ng PWD.',
      category: 'Legal',
      date: 'Mga Sanggunian',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070&auto=format&fit=crop',
      icon: <Scale className="w-4 h-4" />,
      fullContent: (
        <div className="space-y-8">
          <div className="p-6 bg-orange-50 rounded-[30px] border border-orange-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-orange-600 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-black text-orange-900 uppercase tracking-tight mb-1 font-sans">Mahalagang Paalala</p>
              <p className="text-sm font-medium text-orange-800 leading-relaxed font-sans">
                Para sa mga aplikanteng may kanser o bihirang sakit, kinakailangan ang Medical Certificate/Sertipiko ng Kapansanan na inisyu ng isang Oncologist, Surgeon o kaukulang doktor na may kasanayan sa nasabing sakit.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-slate-900 font-black text-sm uppercase tracking-tight mb-4 flex items-center gap-2 font-sans">
              <FileText className="w-4 h-4 text-slate-400" /> Mga Administratibong Sanggunian
            </h4>
            <div className="space-y-3">
              {[
                "DOH Administrative Order No. 2013-0005-B",
                "NCDA Administrative Order No. 001- S-2021",
                "NCDA Board Resolution No. 5 S. 2021",
                "DILG Memorandum Circular 2022-017"
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors font-sans">
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight font-sans">{item}</p>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight font-sans">Mga Anunsyo</h2>
        <p className="text-slate-500 font-medium font-sans">Mahahalagang panuntunan, requirements, at legal na bulletin para sa ating komunidad ng PWD.</p>
      </div>

      {/* Grid of Large Announcements */}
      <div className="grid gap-10">
        {announcements.map((item) => (
          <div key={item.id} className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group">
            <div className="flex flex-col lg:flex-row h-full min-h-[300px]">
              <div className="lg:w-2/5 relative overflow-hidden h-64 lg:h-auto">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-blue-900/10"></div>
              </div>
              <div className="lg:w-3/5 p-10 lg:p-14 flex flex-col justify-center space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest font-sans">
                    {item.icon}
                    {item.category}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">
                    {item.date}
                  </span>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase font-sans">
                  {item.title}
                </h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-xl font-sans">
                  {item.summary}
                </p>
                <button
                  onClick={() => setSelectedAnnouncement(item)}
                  className="flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl w-fit transition-all shadow-xl shadow-slate-200 font-black text-[10px] uppercase tracking-[0.2em] group/btn font-sans"
                >
                  Basahin ang Buong Impormasyon
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Info Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-3xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    {selectedAnnouncement.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none font-sans">
                      {selectedAnnouncement.title}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 font-sans">
                      {selectedAnnouncement.category} • {selectedAnnouncement.date}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-grow overflow-y-auto p-10 bg-white">
                <div className="mb-10 rounded-[30px] overflow-hidden shadow-xl aspect-video">
                  <img src={selectedAnnouncement.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="prose prose-slate max-w-none font-sans">
                  {selectedAnnouncement.fullContent}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-center">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-10 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all font-sans"
                >
                  Isara ang Impormasyon
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
