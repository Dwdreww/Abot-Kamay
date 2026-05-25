import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Download, Printer, Eye, ChevronLeft, FileText, Calendar, User, MapPin, Hash, CheckSquare, Square, CheckCircle, Loader2, Send } from 'lucide-react';
import { generateRef, cn } from '../../../lib/utils';
import { generateApplicationReference } from '../../../lib/applicationService';
import { useAuth } from '../../../App';
import { db } from '../../../lib/firebase';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { applyPdfCaptureColorFallbacks } from '../../../lib/pdfCapture';

export default function CancellationForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNo, setRefNo] = useState(generateRef());
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyRefNo = () => {
    navigator.clipboard.writeText(refNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const previewRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    pwdId: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    reasons: {
      transfer: false,
      voluntary: false,
      reclassification: false,
      other: false,
    },
    otherReason: '',
    barangay: 'San Antonio de Padua I',
    city: 'Dasmariñas',
    province: 'Cavite',
    presidentName: 'Hon. Roberto M. Reyes',
    contactNo: '0917-888-1234',
    email: 'pwd@dasmariñas.gov.ph'
  });

  const handleSubmit = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const newDocRef = doc(collection(db, 'applications'));
      const actualRefNo = await generateApplicationReference();
      setRefNo(actualRefNo);

      const payload = {
        applicationId: newDocRef.id,
        referenceNumber: actualRefNo,
        userId: user.uid,
        applicantName: formData.fullName.trim() || user?.name || 'Anonymous',
        applicantEmail: formData.email || user?.email || '',
        contactNumber: formData.contactNo,
        address: formData.address.trim(),
        disabilityType: '',
        formType: 'cancellation_certificate',
        formTitle: 'Sertipiko ng Pagkansela',
        category: 'Membership',
        purpose: 'Pagkansela',
        formData: formData,
        requirements: {},
        status: 'pending',
        remarks: '',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        reviewedBy: '',
        reviewedAt: null
      };

      await setDoc(newDocRef, payload);
      
      await addDoc(collection(db, 'audit_logs'), {
        action: 'Membership Cancellation Submitted',
        userId: user.uid,
        userName: user?.name || 'Anonymous',
        targetType: 'applications',
        timestamp: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        targetRole: 'admin_broadcast',
        title: 'Bagong Aplikasyon',
        message: `${user?.name || 'Isang user'} ay nagpasa ng Membership Cancellation form.`,
        type: 'info',
        isReadBy: [],
        createdAt: serverTimestamp(),
        link: 'tracking'
      });

      setSubmitted(true);
    } catch (err) {
      console.error("Firestore Save Error:", err);
      alert(`Failed to submit application: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    const el = previewRef.current;
    if (!el) return;
    setDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: applyPdfCaptureColorFallbacks,
      });
      const pageW = 215.9;
      const pageH = 279.4;
      const margin = 14;
      const contentW = pageW - margin * 2;
      const contentH = pageH - margin * 2;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pageW, pageH] });
      
      let imgW = contentW;
      let imgH = (canvas.height / canvas.width) * imgW;
      
      if (imgH > contentH) {
         const scale = contentH / imgH;
         imgW = imgW * scale;
         imgH = imgH * scale;
      }
      
      const xOffset = margin + (contentW - imgW) / 2;
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', xOffset, margin, imgW, imgH);
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_of_Cancellation_${refNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('PDF generation failed', err);
    } finally {
      setDownloading(false);
    }
  };

  const handleCheckboxChange = (reason: keyof typeof formData.reasons) => {
    setFormData({
      ...formData,
      reasons: {
        ...formData.reasons,
        [reason]: !formData.reasons[reason]
      }
    });
  };

  const getReasonString = () => {
    const active = [];
    if (formData.reasons.transfer) active.push("Paglipat ng tirahan");
    if (formData.reasons.voluntary) active.push("Kusang pag-alis");
    if (formData.reasons.reclassification) active.push("Pagbabago ng status");
    if (formData.reasons.other && formData.otherReason) active.push(formData.otherReason);
    return active.join(", ") || "Walang tinukoy na dahilan";
  };

  const processedDate = new Date(formData.effectiveDate);
  processedDate.setDate(processedDate.getDate() + 1);

  if (submitted) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-6 max-w-2xl mx-auto shadow-xl shadow-blue-900/5">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-neutral-900">Naipadala na ang Form!</h2>
        <p className="text-neutral-500 text-lg">
          Matagumpay na natanggap ang iyong kahilingan para sa pagkansela ng membership. 
          Pakitago ang iyong <strong>Ticket Number</strong> para sa pag-track.
        </p>
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: [1.4, 1], opacity: 1 }}
          transition={{ 
            duration: 0.6, 
            ease: "easeOut",
            opacity: { duration: 0.4 }
          }}
          className="relative inline-block"
        >
          <motion.div 
            animate={{ opacity: [0, 0.4, 0], scale: [1, 1.2, 1.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute inset-0 bg-blue-400 rounded-2xl blur-2xl font-mono"
          />
          <button
            onClick={copyRefNo}
            title="I-click para kopyahin"
            className="relative bg-white p-8 rounded-3xl border border-blue-100 shadow-2xl font-mono text-3xl font-black text-blue-600 tracking-[0.2em] px-12 z-10 hover:border-blue-400 hover:shadow-blue-200 transition-all active:scale-95 cursor-copy flex flex-col items-center gap-2"
          >
            {refNo}
            <span className="text-xs font-sans font-bold tracking-widest uppercase" style={{ color: copied ? '#16a34a' : '#93c5fd' }}>
              {copied ? '✓ Nakopya!' : 'I-click para kopyahin'}
            </span>
          </button>
        </motion.div>
        <div className="pt-8">
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            Bumalik sa Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {!showPreview ? (
        <div className="space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/20 space-y-10 animate-in fade-in duration-500">
             <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Sertipiko ng Pagkansela</h2>
                <p className="text-slate-500 font-medium mt-2">Punan ang detalye para sa pagkansela ng PWD membership.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Buong Pangalan ng Miyembro ng PWD</label>
                      <div className="relative group">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                         <input 
                           type="text" 
                           placeholder="Ilagay ang buong pangalan ng miyembro"
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-bold text-slate-900"
                           value={formData.fullName}
                           onChange={e => setFormData({...formData, fullName: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-4">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Numero ng PWD ID</label>
                      <div className="relative group">
                         <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                         <input 
                           type="text" 
                           placeholder="XX-XXXX-XXX-XXXXXX"
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-mono font-bold text-slate-900"
                           value={formData.pwdId}
                           onChange={e => setFormData({...formData, pwdId: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Kumpletong Address</label>
                      <div className="relative group">
                         <MapPin className="absolute left-4 top-5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                         <textarea 
                           rows={3}
                            placeholder="Ilagay ang kumpletong tirahan"
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-bold text-slate-900 text-sm"
                           value={formData.address}
                           onChange={e => setFormData({...formData, address: e.target.value})}
                         ></textarea>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Petsa ng Pagkansela</label>
                      <div className="relative group">
                         <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                         <input 
                           type="date" 
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-bold text-slate-900"
                           value={formData.effectiveDate}
                           onChange={e => setFormData({...formData, effectiveDate: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-4">
                       <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Dahilan ng Pagkansela</label>
                      <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                         <button 
                           onClick={() => handleCheckboxChange('transfer')}
                           className="flex items-center gap-3 w-full text-left group"
                         >
                            {formData.reasons.transfer ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />}
                             <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Paglipat ng tirahan</span>
                         </button>
                         <button 
                           onClick={() => handleCheckboxChange('voluntary')}
                           className="flex items-center gap-3 w-full text-left group"
                         >
                            {formData.reasons.voluntary ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />}
                             <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Kusang pag-alis</span>
                         </button>
                         <button 
                           onClick={() => handleCheckboxChange('reclassification')}
                           className="flex items-center gap-3 w-full text-left group"
                         >
                            {formData.reasons.reclassification ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />}
                             <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Reclassification/Pagbabago ng Status</span>
                         </button>
                         <div className="space-y-3">
                            <button 
                              onClick={() => handleCheckboxChange('other')}
                              className="flex items-center gap-3 w-full text-left group"
                            >
                               {formData.reasons.other ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />}
                               <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Iba pa:</span>
                            </button>
                            {formData.reasons.other && (
                              <input 
                                type="text"
                                placeholder="Tukuyin ang ibang dahilan..."
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-400 text-xs font-bold transition-all"
                                value={formData.otherReason}
                                onChange={e => setFormData({...formData, otherReason: e.target.value})}
                              />
                            )}
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="pt-10 border-t border-slate-100 flex justify-end gap-4">
                <button 
                  onClick={() => setShowPreview(true)}
                  className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-200 flex items-center gap-3 text-xs uppercase tracking-widest active:scale-95"
                >
                  <Eye className="w-5 h-5" />
                  Tingnan ang Dokumento
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
           <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 md:p-6 md:px-10 rounded-[30px] border border-slate-100 shadow-2xl shadow-slate-200/20">
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 md:gap-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform shrink-0" />
                <span className="hidden sm:inline">I-edit ang Detalye</span>
                <span className="sm:hidden">I-edit</span>
              </button>
              <div className="flex items-center gap-2 md:gap-4">
                 <button className="p-3 md:p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all text-slate-400 hover:text-blue-600">
                    <Printer className="w-4 h-4 md:w-5 md:h-5" />
                 </button>
                 <button
                   onClick={handleSubmit}
                   disabled={loading}
                   className="px-3 py-2 md:px-8 md:py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-200 flex items-center gap-2 md:gap-3 text-[10px] uppercase tracking-widest disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 shrink-0" />}
                   <span className="hidden sm:inline">I-submit ang Kahilingan</span>
                   <span className="sm:hidden">I-submit</span>
                 </button>
                 <button
                   onClick={handleDownload}
                   disabled={downloading}
                   className="px-3 py-2 md:px-8 md:py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-200 flex items-center gap-2 md:gap-3 text-[10px] uppercase tracking-widest disabled:opacity-50"
                 >
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 shrink-0" />}
                    <span className="hidden sm:inline">{downloading ? 'Ginagawa...' : 'I-export ang PDF'}</span>
                    <span className="sm:hidden">PDF</span>
                 </button>
              </div>
           </div>

           {/* Cancellation Certificate Preview */}
           <div className="w-full overflow-x-auto pb-8">
              <div ref={previewRef} data-pdf-capture className="bg-white p-12 md:p-16 shadow-2xl rounded-sm border-t-[12px] border-blue-900 w-[816px] min-h-[1056px] shrink-0 mx-auto flex flex-col relative overflow-hidden">
                 {/* Watermark/Seal background */}
                 <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                    <div className="w-[600px] h-[600px] border-[40px] border-blue-900 rounded-full flex items-center justify-center">
                       <span className="text-8xl font-black text-blue-900 text-center uppercase tracking-tighter">TANGGAPAN<br/>NG PWD</span>
                    </div>
                 </div>

              {/* Header */}
              <div className="text-center space-y-1 mb-10 relative z-10">
                 <p className="text-sm font-bold uppercase tracking-widest text-slate-800">Republika ng Pilipinas</p>
                 <p className="text-sm text-slate-600 uppercase font-medium">Lalawigan ng {formData.province}</p>
                 <p className="text-sm text-slate-600 uppercase font-medium">Lungsod ng {formData.city}</p>
                 <p className="text-sm text-slate-800 uppercase font-black tracking-tight underline">Barangay {formData.barangay}</p>
                 <p className="text-lg font-black text-blue-900 mt-4 uppercase tracking-tight">Tanggapan ng Persons with Disability (PWD)</p>
                 <div className="w-24 h-1 bg-blue-900 mx-auto mt-4 rounded-full"></div>
              </div>

              {/* Title */}
              <div className="text-center mb-10 relative z-10">
                 <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter decoration-slate-900/20 underline underline-offset-8">SERTIPIKO NG PAGKANSELA NG PWD MEMBERSHIP</h1>
              </div>

              {/* Body */}
              <div className="flex-grow space-y-6 text-base font-medium leading-relaxed text-slate-800 relative z-10 text-justify">
                 <p className="font-black text-slate-900">SA KINAUUKULAN:</p>
                 
                 <p className="indent-12">
                   Ito ay nagpapatunay na si <strong className="text-slate-900 px-1 border-b border-slate-300">{formData.fullName || '__________________________'}</strong>,{' '}
                   na naninirahan sa{' '}<strong className="text-slate-900 px-1 border-b border-slate-300">{formData.address || '____________________________________________________'}</strong>,{' '}
                   ay dating nakarehistro bilang miyembro ng Barangay Persons with Disability (PWD) Registry sa ilalim ng PWD ID No.{' '}<strong className="text-slate-900 font-mono px-1 border-b border-slate-300">{formData.pwdId || '[ID NUMBER]'}</strong>.
                 </p>

                 <p className="indent-12">
                   Batay sa kahilingan at matapos ang pagsusuri, ang nasabing membership ay kinansela simula <strong className="text-slate-900 px-1 border-b border-slate-300">{processedDate.toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>, dahil sa sumusunod na dahilan:
                 </p>

                 <div className="space-y-3 pl-12">
                    <div className="flex items-start gap-4">
                       <div className="w-5 h-5 border-2 border-slate-900 shrink-0 mt-1 flex items-center justify-center font-black text-slate-900 text-lg leading-none">
                          {formData.reasons.transfer && '✓'}
                       </div>
                       <p className="text-sm font-bold uppercase tracking-tight">Paglipat ng tirahan sa ibang barangay/lungsod/munisipalidad</p>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-5 h-5 border-2 border-slate-900 shrink-0 mt-1 flex items-center justify-center font-black text-slate-900 text-lg leading-none">
                          {formData.reasons.voluntary && '✓'}
                       </div>
                       <p className="text-sm font-bold uppercase tracking-tight">Kusang pag-alis sa PWD Registry</p>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-5 h-5 border-2 border-slate-900 shrink-0 mt-1 flex items-center justify-center font-black text-slate-900 text-lg leading-none">
                          {formData.reasons.reclassification && '✓'}
                       </div>
                       <p className="text-sm font-bold uppercase tracking-tight">Reclassification o pagbabago ng disability status</p>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-5 h-5 border-2 border-slate-900 shrink-0 mt-1 flex items-center justify-center font-black text-slate-900 text-lg leading-none">
                          {formData.reasons.other && '✓'}
                       </div>
                       <p className="text-sm font-bold uppercase tracking-tight">Iba pa: <span className="border-b border-slate-300 px-2">{formData.otherReason || '_______________________'}</span></p>
                    </div>
                 </div>

                 <p className="indent-12 mt-8">
                   Ang sertipikong ito ay ibinibigay sa kahilingan ng kinauukulang indibidwal para sa anumang legal o administratibong layunin.
                 </p>

                 <p className="indent-12">
                   Ipinagkaloob ngayong ika-<strong className="text-slate-900">{processedDate.getDate()}</strong> ng <strong className="text-slate-900">{processedDate.toLocaleString('fil-PH', { month: 'long' })}</strong>, <strong className="text-slate-900">{processedDate.getFullYear()}</strong> sa Barangay <strong className="text-slate-900">{formData.barangay}</strong>, <strong className="text-slate-900">{formData.city}</strong>, <strong className="text-slate-900">{formData.province}</strong>, Pilipinas.
                 </p>
              </div>

              {/* Signatures */}
              <div className="mt-16 space-y-1 relative z-10">
                 <div className="w-72 border-b border-slate-900 pt-10"></div>
                 <p className="text-sm font-black uppercase text-slate-900 tracking-tight">{formData.presidentName}</p>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Presidente ng Barangay PWD</p>
                 <div className="pt-4 space-y-1">
                    <p className="text-[10px] font-medium text-slate-400 capitalize">Numero sa Telepono: {formData.contactNo}</p>
                    <p className="text-[10px] font-medium text-slate-400 capitalize">Email: {formData.email}</p>
                 </div>
              </div>

              {/* Reference Footer */}
              <div className="mt-auto pt-10 flex items-end justify-between relative z-10">
                 <div className="space-y-1">
                    <p className="text-[9px] font-mono text-slate-300 uppercase">Rekord na Binuo ng Sistema</p>
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">REF: {refNo}</p>
                 </div>
                 <div className="w-32 h-32 border-4 border-slate-100 rounded-full flex items-center justify-center opacity-40">
                    <p className="text-[9px] font-black text-slate-300 text-center uppercase tracking-widest leading-none">Opisyal na<br/>Selyo ng<br/>Barangay PWD</p>
                 </div>
              </div>
           </div>
         </div>
         </div>
      )}
    </div>
  );
}
