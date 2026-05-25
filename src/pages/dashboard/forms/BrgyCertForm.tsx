import React, { useState, useRef } from 'react';
import { Download, Printer, Send, Eye, FileText, ChevronLeft, MapPin, Calendar, User, Loader2, CheckCircle } from 'lucide-react';
import { generateRef, cn } from '../../../lib/utils';
import { generateApplicationReference } from '../../../lib/applicationService';
import { useAuth } from '../../../App';
import { db } from '../../../lib/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { applyPdfCaptureColorFallbacks } from '../../../lib/pdfCapture';

export default function BrgyCertForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNo, setRefNo] = useState(generateRef());
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    deceasedName: '',
    address: '',
    barangayName: 'Barangay San Antonio de Padua I',
    claimantName: '',
    relationship: '',
    presidentName: 'Hon. Roberto M. Reyes',
    captainName: 'Hon. Maria Clara S. Santos'
  });

  const handleSubmit = async () => {
    if (!user?.uid) return;
    if (!formData.deceasedName || !formData.address || !formData.claimantName || !formData.relationship) {
      alert("Pakikumpleto ang form.");
      return;
    }
    
    setLoading(true);
    try {
      const newDocRef = doc(collection(db, 'applications'));
      const actualRefNo = await generateApplicationReference();
      setRefNo(actualRefNo);
      
      const payload = {
        applicationId: newDocRef.id,
        referenceNumber: actualRefNo,
        userId: user.uid,
        applicantName: formData.claimantName.trim() || user?.name || 'Anonymous',
        applicantEmail: user?.email || '',
        contactNumber: user?.contactNumber || '',
        address: formData.address.trim(),
        disabilityType: '',
        formType: 'burial_assistance_certificate',
        formTitle: 'Barangay Certification (Burial Assistance)',
        category: 'Certification',
        purpose: 'Burial Assistance',
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
        action: 'Barangay Certification Submitted',
        userId: user.uid,
        userName: user?.name || 'Anonymous',
        targetType: 'applications',
        timestamp: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        targetRole: 'admin_broadcast',
        title: 'Bagong Aplikasyon',
        message: `${user?.name || 'Isang user'} ay nagpasa ng Barangay Certification form.`,
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
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pageW, pageH] });
      const imgW = pageW;
      const pageHeightPx = Math.floor((canvas.width * pageH) / pageW);
      let offset = 0;
      let firstPage = true;
      while (offset < canvas.height) {
        if (!firstPage) pdf.addPage();
        firstPage = false;
        const slice = document.createElement('canvas');
        slice.width = canvas.width;
        slice.height = Math.min(pageHeightPx, canvas.height - offset);
        slice.getContext('2d')!.drawImage(canvas, 0, -offset);
        const sliceH = (slice.height * imgW) / canvas.width;
        pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, imgW, sliceH);
        offset += pageHeightPx;
      }
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Barangay_Certification_${refNo}.pdf`;
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

  if (submitted) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-6 max-w-2xl mx-auto shadow-xl shadow-blue-900/5">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-neutral-900">Sertipikasyon Naisumite!</h2>
        <p className="text-neutral-500 text-lg">
          Matagumpay na naipadala ang inyong kahilingan para sa Barangay Certification.
        </p>
        <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 inline-block font-mono text-2xl font-bold text-blue-600 tracking-widest px-10">
          {refNo}
        </div>
        <div className="pt-8 flex justify-center">
          <button 
            onClick={() => { setSubmitted(false); setShowPreview(false); setRefNo(generateRef()); }}
            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            Bumalik
          </button>
        </div>
      </div>
    );
  }

  const filipinoMonths = ['Enero','Pebrero','Marso','Abril','Mayo','Hunyo','Hulyo','Agosto','Setyembre','Oktubre','Nobyembre','Disyembre'];
  const certDate = (() => {
    const d = new Date(formData.date + 'T00:00:00');
    return `${filipinoMonths[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  })();

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {!showPreview ? (
        <div className="space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-3xl border border-neutral-200 shadow-sm space-y-8 animate-in fade-in duration-300">
             <div>
                <h2 className="text-2xl font-bold text-neutral-900 mb-1">Barangay Pagpapatunay</h2>
                <p className="text-neutral-500">Punan ang mga detalye upang makabuo ng opisyal na sertipikasyon.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Petsa ng Sertipikasyon</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Pangalan ng Pumanaw</label>
                    <input 
                      type="text" 
                      placeholder="Ilagay ang pangalan ng pumanaw"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                      value={formData.deceasedName}
                      onChange={e => setFormData({...formData, deceasedName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Permanenteng Address</label>
                    <textarea 
                      rows={2}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm"
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                    ></textarea>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Pangalan ng Nag-claim</label>
                    <input 
                      type="text" 
                      placeholder="Ilagay ang pangalan ng nag-claim"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                      value={formData.claimantName}
                      onChange={e => setFormData({...formData, claimantName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-700 mb-2">Relasyon sa Pumanaw</label>
                    <input 
                      type="text" 
                      placeholder="Hal. Asawa, Anak"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                      value={formData.relationship}
                      onChange={e => setFormData({...formData, relationship: e.target.value})}
                    />
                  </div>
                </div>
             </div>

             <div className="pt-8 border-t border-neutral-100 flex justify-end gap-4">
                <button 
                  onClick={() => setShowPreview(true)}
                  className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Tingnan ang Sertipikasyon
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-300">
           <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 md:p-4 md:px-8 rounded-2xl border border-neutral-200 shadow-sm">
              <button
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 text-neutral-500 font-bold hover:text-blue-600 transition-colors text-sm"
              >
                <ChevronLeft className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">I-edit ang Detalye</span>
                <span className="sm:hidden">I-edit</span>
              </button>
               <div className="flex items-center gap-2 md:gap-3">
                 <button
                   disabled={loading}
                   onClick={handleSubmit}
                   className="px-3 py-2 md:px-6 md:py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50 text-xs md:text-sm"
                 >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 shrink-0" />}
                   <span className="hidden sm:inline">I-submit ang Aplikasyon</span>
                   <span className="sm:hidden">I-submit</span>
                 </button>
                 <button
                   onClick={handleDownload}
                   disabled={downloading}
                   className="px-3 py-2 md:px-6 md:py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-600/20 flex items-center gap-2 disabled:opacity-50 text-xs md:text-sm"
                 >
                    {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 shrink-0" />}
                    <span className="hidden sm:inline">{downloading ? 'Ginagawa...' : 'I-export ang PDF'}</span>
                    <span className="sm:hidden">PDF</span>
                 </button>
              </div>
           </div>

           {/* Letter Preview */}
           <div className="overflow-x-auto pb-4">
           <div ref={previewRef} data-pdf-capture style={{
             fontFamily: 'Arial, sans-serif',
             background: '#fff',
             width: '680px',
             minWidth: '680px',
             margin: '0 auto',
             padding: '60px 72px',
             minHeight: '920px',
             boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
             border: '1px solid #e5e7eb',
             borderRadius: '2px',
           }}>

             {/* Header */}
             <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'36px'}}>
               <p style={{fontSize:'11px', color:'#9ca3af', margin:0}}>Ref. No.: {refNo}</p>
               <div style={{textAlign:'center', minWidth:'170px'}}>
                 <p style={{fontSize:'13px', color:'#111', borderBottom:'1.5px solid #111', paddingBottom:'3px', margin:0, textAlign:'center'}}>
                   {certDate}
                 </p>
                 <p style={{fontSize:'11px', color:'#111', marginTop:'4px', textAlign:'center'}}>Petsa</p>
               </div>
             </div>

             {/* Title */}
             <div style={{textAlign:'center', marginBottom:'28px'}}>
               <h2 style={{fontSize:'22px', fontWeight:'bold', color:'#111', letterSpacing:'0.06em', margin:0}}>
                 PAGPAPATUNAY
               </h2>
             </div>

             {/* Body */}
             <div style={{fontSize:'13px', color:'#111', display:'flex', flexDirection:'column', gap:'14px'}}>

               <p style={{margin:0}}>Sa kinauukulan,</p>

               {/* Deceased name */}
               <div style={{display:'flex', alignItems:'baseline', gap:'4px'}}>
                 <span style={{whiteSpace:'nowrap'}}>
                   <span style={{display:'inline-block', width:'2.5rem'}}/>
                   Ito ay bilang pagpapatunay na ang yumaong si
                 </span>
                 <div style={{flex:1, marginLeft:'6px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                   <span style={{width:'100%', borderBottom:'1.5px solid #111', paddingBottom:'2px', textAlign:'center', display:'block', minHeight:'18px'}}>
                     {formData.deceasedName}
                   </span>
                   <span style={{fontSize:'11px', color:'#111', marginTop:'3px', textAlign:'center'}}>
                     (Pangalan ng namatay)
                   </span>
                 </div>
               </div>

               {/* Address */}
               <div style={{display:'flex', alignItems:'baseline', gap:'4px'}}>
                 <span style={{whiteSpace:'nowrap'}}>ay residente ng</span>
                 <div style={{flex:1, margin:'0 6px', display:'flex', flexDirection:'column', alignItems:'center'}}>
                   <span style={{width:'100%', borderBottom:'1.5px solid #111', paddingBottom:'2px', textAlign:'center', display:'block', minHeight:'18px'}}>
                     {formData.address}
                   </span>
                   <span style={{fontSize:'11px', color:'#111', marginTop:'3px', textAlign:'center'}}>
                     (buong address at barangay)
                   </span>
                 </div>
                 <span style={{whiteSpace:'nowrap'}}>Lungsod ng Dasmariñas, Cavite</span>
               </div>

               <p style={{margin:0}}>at kasapi sa Persons with Disability ng aming barangay.</p>

               {/* Claimant + relationship */}
               <div>
                 <p style={{margin:0, textAlign:'justify'}}>
                   <span style={{display:'inline-block', width:'2.5rem'}}/>
                   Pinatutunayan din na ang "Claimant" sa kanyang Burial Assistance mula sa
                 </p>
                 <div style={{display:'flex', alignItems:'baseline', gap:'14px', marginTop:'8px'}}>
                   <span style={{whiteSpace:'nowrap'}}>Pamahalaang Lungsod ay si</span>
                   <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center'}}>
                     <span style={{width:'100%', borderBottom:'1.5px solid #111', paddingBottom:'2px', textAlign:'center', display:'block', minHeight:'18px'}}>
                       {formData.claimantName}
                     </span>
                     <span style={{fontSize:'11px', color:'#111', marginTop:'3px', textAlign:'center'}}>(Pangalan ng Claimant)</span>
                   </div>
                   <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center'}}>
                     <span style={{width:'100%', borderBottom:'1.5px solid #111', paddingBottom:'2px', textAlign:'center', display:'block', minHeight:'18px'}}>
                       {formData.relationship}
                     </span>
                     <span style={{fontSize:'11px', color:'#111', marginTop:'3px', textAlign:'center'}}>(Kaano-ano ng namatay)</span>
                   </div>
                 </div>
               </div>

               <p style={{margin:0}}>yumao at siyang may karapatang tumanggap ng nasabing benepisyo.</p>

               <p style={{margin:0, paddingTop:'8px'}}>
                 <span style={{display:'inline-block', width:'2.5rem'}}/>
                 Maraming salamat po.
               </p>
             </div>

             {/* Signatures */}
             <div style={{marginTop:'60px'}}>
               {/* Brgy. PWD President — right */}
               <div style={{display:'flex', justifyContent:'flex-end'}}>
                 <div style={{textAlign:'center'}}>
                   <div style={{borderBottom:'1.5px solid #111', width:'220px', marginBottom:'5px'}}/>
                   <p style={{fontSize:'13px', color:'#111', margin:0}}>Pangalan at pirma ng</p>
                   <p style={{fontSize:'13px', color:'#111', margin:0}}>Brgy. PWD President</p>
                 </div>
               </div>

               {/* Kapitan — center */}
               <div style={{display:'flex', justifyContent:'center', marginTop:'48px'}}>
                 <div style={{textAlign:'center'}}>
                   <div style={{borderBottom:'1.5px solid #111', width:'220px', marginBottom:'5px'}}/>
                   <p style={{fontSize:'13px', color:'#111', margin:0}}>Pangalan at pirma</p>
                   <p style={{fontSize:'13px', color:'#111', margin:0}}>ng Kapitan</p>
                 </div>
               </div>
             </div>

           </div>
           </div>{/* end overflow-x-auto */}
        </div>
      )}
    </div>
  );
}
