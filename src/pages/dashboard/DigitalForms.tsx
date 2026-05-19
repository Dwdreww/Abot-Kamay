import React, { useState, useEffect } from 'react';
import { 
  FileText, ArrowRight, ShieldCheck, 
  ScrollText, UserCheck, ChevronLeft,
  Search, Filter, Plus, Info, ChevronRight,
  Printer, ArrowUpRight, Loader2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../App';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import BurialForm from './forms/BurialForm';
import DOHForm from './forms/DOHForm';
import BrgyCertForm from './forms/BrgyCertForm';
import CancellationForm from './forms/CancellationForm';

type FormType = 'none' | 'burial' | 'doh' | 'brgy' | 'cancellation';

interface Submission {
  id: string;
  type: string;
  name: string;
  refNo: string;
  date: string;
  status: string;
  color: string;
  rawDate: Date;
}

export default function DigitalForms() {
  const { user } = useAuth();
  const [selectedForm, setSelectedForm] = useState<FormType>('none');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const results: Submission[] = [];

        const q = query(
          collection(db, 'applications'), 
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(doc => {
          const data = doc.data();
          const submittedAt = data.submittedAt?.toDate() || new Date();
          results.push({
            id: doc.id,
            type: data.formTitle || 'Application',
            name: data.applicantName || user.name || 'User',
            refNo: data.referenceNumber || 'N/A',
            date: submittedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: data.status || 'pending',
            color: (data.status === 'approved' || data.status === 'completed') ? 'emerald' :
                   (data.status === 'pending' || data.status === 'draft') ? 'blue' :
                   data.status === 'for_review' ? 'yellow' :
                   data.status === 'returned' ? 'purple' :
                   data.status === 'rejected' ? 'red' : 'slate',
            rawDate: submittedAt
          });
        });

        setSubmissions(results.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()).slice(0, 5));
      } catch (error) {
        console.error("Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user?.uid]);

  const forms = [
    {
      id: 'burial',
      title: 'Form para sa PWD Burial Assistance',
      description: 'Aplikasyon para sa tulong pinansyal sa pagpapalibing ng yumaong miyembro ng PWD.',
      icon: ScrollText,
      color: 'bg-orange-50 text-orange-600',
      tag: 'Tulong Pinansyal',
      image: "/burial.png"
    },
    {
      id: 'doh',
      title: 'DOH Philippine Registry (PRPWD)',
      description: 'Registry form para sa Department of Health. Kailangan para sa mga bagong aplikante o renewal ng PWD ID.',
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-600',
      tag: 'Opisyal na Registry',
      image: "/doh.png"
    },
    {
      id: 'brgy',
      title: 'Sertipiko ng Burial Assistance',
      description: 'Pormal na sertipikasyon mula sa barangay na nagpapatunay ng PWD status at paninirahan.',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-600',
      tag: 'Sertipikasyon',
      image: "/brngy_cert.png"
    },
    {
      id: 'cancellation',
      title: 'Sertipiko ng Pagkansela',
      description: 'Opisyal na dokumento para sa pagkansela ng PWD membership dahil sa paglipat, kusang pag-alis, o pagbabago ng status.',
      icon: FileText,
      color: 'bg-rose-50 text-rose-600',
      tag: 'Membership',
      image: "https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  if (selectedForm !== 'none') {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedForm('none')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors group mb-4 font-bold text-sm uppercase tracking-widest"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Bumalik sa Listahan</span>
        </button>

        {selectedForm === 'burial' && <BurialForm />}
        {selectedForm === 'doh' && <DOHForm />}
        {selectedForm === 'brgy' && <BrgyCertForm />}
        {selectedForm === 'cancellation' && <CancellationForm />}
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Digital Forms</h2>
        <p className="text-slate-500 font-medium">Pamahalaan ang mga rekord, forms, at requests nang maayos.</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {forms.map((form) => {
          const Icon = form.icon;
          return (
            <div 
              key={form.id}
              className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group overflow-hidden flex flex-col"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={form.image} 
                  alt={form.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-blue-900/0 transition-colors"></div>
                <div className="absolute top-6 left-6">
                  <div className={cn("p-4 rounded-2xl shadow-xl shadow-black/20", form.color)}>
                    <Icon className="w-8 h-8" />
                  </div>
                </div>
              </div>
              
              <div className="p-10 flex-grow flex flex-col">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-3 block">
                  {form.tag}
                </span>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight leading-tight">{form.title}</h3>
                <div className="space-y-2 mb-8 flex-grow">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Impormasyon ng Aplikante
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Mga Dokumento
                   </div>
                   <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                      Suriin at I-submit
                   </div>
                </div>
                <button 
                  onClick={() => setSelectedForm(form.id as FormType)}
                  className={cn(
                    "w-full flex items-center justify-center gap-3 px-6 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] group/btn",
                    form.id === 'other' ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-200" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-200"
                  )}
                >
                  {form.id === 'other' ? 'Tingnan Lahat' : 'Magsimula / Punan ang Form'}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-8 2xl:grid-cols-[minmax(0,1fr)_360px] items-start">
        {/* Recent Forms Table */}
        <div className="min-w-0 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/20 overflow-hidden flex flex-col">
          <div className="px-6 py-7 sm:px-8 border-b border-slate-50 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Mga Na-isumiteng Form</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Sundan ang progreso ng iyong mga isinumiteng rekord.</p>
              </div>
            </div>
            <button className="shrink-0 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline flex items-center gap-2">
              Tingnan Lahat <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed text-left font-sans">
              <colgroup>
                <col className="w-[26%]" />
                <col className="w-[20%]" />
                <col className="w-[20%]" />
                <col className="w-[17%]" />
                <col className="w-[17%]" />
              </colgroup>
              <thead className="bg-[#fcfdff]">
                <tr>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uri ng Form</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pangalan ng PWD</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID ng Form</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Petsa ng Pagpasa</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilo-load ang mga submission...</span>
                      </div>
                    </td>
                  </tr>
                ) : submissions.length > 0 ? (
                  submissions.map((row, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5 text-[11px] font-extrabold text-slate-900 uppercase tracking-tight leading-snug">{row.type}</td>
                      <td className="px-6 py-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-snug">{row.name}</td>
                      <td className="px-6 py-5 text-[10px] font-black font-mono text-slate-400 whitespace-nowrap">{row.refNo}</td>
                      <td className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{row.date}</td>
                      <td className="px-6 py-5 text-right">
                        <span className={cn(
                          "inline-flex px-3 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm whitespace-nowrap",
                          row.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                          row.color === 'blue'    ? "bg-blue-50 text-blue-600 shadow-blue-100" :
                          row.color === 'yellow'  ? "bg-yellow-50 text-yellow-600" :
                          row.color === 'purple'  ? "bg-purple-50 text-purple-600" :
                          row.color === 'red'     ? "bg-red-50 text-red-600" :
                          "bg-slate-100 text-slate-400"
                        )}>
                          {row.status === 'approved'   ? 'Inaprubahan'  :
                           row.status === 'completed'  ? 'Nakumpleto'   :
                           row.status === 'pending'    ? 'Nakabinbin'   :
                           row.status === 'draft'      ? 'Draft'        :
                           row.status === 'for_review' ? 'Sinusuri'     :
                           row.status === 'returned'   ? 'Ibinabalik'   :
                           row.status === 'rejected'   ? 'Tinanggihan'  :
                           row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">
                      Walang bagong submission
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-10 py-4 text-center border-t border-slate-50 bg-[#fcfdff]">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {submissions.length === 0 ? 'Wala pang submission' : `Ipinapakita ang ${submissions.length} pinakabagong submission`}
             </span>
          </div>
        </div>

        {/* Guidance Column */}
        <div className="space-y-6 2xl:w-[360px]">
           <div className="bg-blue-600 rounded-[40px] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
              <div className="relative z-10 space-y-6">
                  <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center">
                     <Info className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-xl font-black tracking-tight leading-tight">Kailangan ng gabay?</h4>
                  <p className="text-sm font-medium text-white/80">Sundin ang mga simpleng hakbang na ito para makumpleto ang iyong form.</p>
                  
                  <div className="space-y-6 pt-4">
                     <GuidanceStep number="1" title="Piliin ang tamang form" desc="Piliin ang form na angkop sa iyong pangangailangan." />
                     <GuidanceStep number="2" title="Punan ang form" desc="Ilagay ang tama at kumpletong impormasyon." />
                     <GuidanceStep number="3" title="I-submit at i-track" desc="Bantayan ang status sa listahan ng mga form." />
                  </div>

                  <button className="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                     Alamin ang buong proseso <ArrowUpRight className="w-4 h-4" />
                  </button>
              </div>
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
              <div className="absolute bottom-[-20%] left-[-20%] w-48 h-48 bg-blue-900/20 blur-3xl rounded-full"></div>
           </div>
        </div>
      </div>
    </div>
  );
}

function GuidanceStep({ number, title, desc }: { number: string, title: string, desc: string }) {
  return (
    <div className="flex gap-4">
       <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0 text-sm font-black">{number}</div>
       <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1">{title}</p>
          <p className="text-[10px] font-medium text-white/60">{desc}</p>
       </div>
    </div>
  )
}
