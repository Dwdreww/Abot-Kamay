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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">Punong Barangay</label>
                        <input className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs" value={formData.captainName} readOnly />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-neutral-700 mb-2">Presidente ng PWD</label>
                        <input className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs" value={formData.presidentName} readOnly />
                     </div>
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
           <div className="flex items-center justify-between bg-white p-4 px-8 rounded-2xl border border-neutral-200 shadow-sm">
              <button 
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-2 text-neutral-500 font-bold hover:text-blue-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                I-edit ang Detalye
              </button>
               <div className="flex items-center gap-3">
                 <button 
                   disabled={loading}
                   onClick={handleSubmit}
                   className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                   I-submit ang Aplikasyon
                 </button>
                 <button
                   onClick={handleDownload}
                   disabled={downloading}
                   className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-md shadow-green-600/20 flex items-center gap-2 disabled:opacity-50"
                 >
                    {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    {downloading ? 'Generating...' : 'I-export ang PDF'}
                 </button>
              </div>
           </div>

           {/* Letter Preview */}
           <div ref={previewRef} data-pdf-capture className="bg-white p-20 shadow-2xl rounded-sm border border-neutral-100 max-w-[800px] mx-auto min-h-[1000px] flex flex-col">
              {/* Header */}
              <div className="text-center border-b-2 border-double border-neutral-900 pb-8 mb-12">
                 <p className="text-sm font-bold uppercase tracking-widest text-neutral-800">Republika ng Pilipinas</p>
                 <p className="text-sm text-neutral-600">Lalawigan ng [Pangalan ng Lalawigan]</p>
                 <p className="text-sm text-neutral-600">Lungsod ng [Pangalan ng Lungsod]</p>
                 <p className="text-lg font-black text-blue-900 mt-4 uppercase">Tanggapan ng Punong Barangay</p>
                 <p className="text-xl font-black text-blue-800 uppercase">{formData.barangayName}</p>
                 <p className="text-[10px] text-neutral-400 mt-2 font-mono uppercase tracking-tighter">Reference No: {refNo}</p>
              </div>

              {/* Title */}
              <div className="text-center mb-16">
                 <h1 className="text-4xl font-serif font-black underline underline-offset-8 decoration-2 text-neutral-900">PAGPAPATUNAY</h1>
              </div>

              {/* Body */}
              <div className="flex-grow space-y-8 text-lg font-serif leading-loose text-neutral-800">
                 <p className="font-bold">SA MGA KINAUUKULAN:</p>
                 
                 <p className="indent-12">
                   Ito ay nagpapatunay na si <strong>{formData.deceasedName || '__________________________'}</strong>, 
                   na naninirahan sa <strong>{formData.address || '____________________________________________________'}</strong> 
                   ay pumanaw na noong ika-<strong>{new Date(formData.date).toLocaleDateString('fil-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
                 </p>

                 <p className="indent-12">
                   At si <strong>{formData.claimantName || '__________________________'}</strong>, na <strong>{formData.relationship || '_________'}</strong> 
                   ng nasabing pumanaw ay siyang humihiling ng application para sa <strong>Burial Assistance</strong> upang makatulong sa gastusin sa pagpapalibing.
                 </p>

                 <p className="indent-12">
                   Ang pagpapatunay na ito ay iginiwad sa kahilingan ng nasabing claimant para sa anumang legal na layuning paggagamitan nito.
                 </p>

                 <p className="indent-12 mt-12">
                   Ipinagkaloob ngayong ika-<strong>{new Date().getDate()}</strong> ng <strong>{new Date().toLocaleString('fil-PH', { month: 'long' })}</strong>, <strong>{new Date().getFullYear()}</strong> dito sa Tanggapan ng Barangay.
                 </p>
              </div>

              {/* Signatures */}
              <div className="mt-24 grid grid-cols-2 gap-12">
                 <div className="mt-12">
                   <p className="text-center border-t border-neutral-900 pt-2 font-bold uppercase text-neutral-900">{formData.presidentName}</p>
                   <p className="text-center text-sm font-medium text-neutral-500 uppercase">Presidente ng PWD</p>
                 </div>
                 <div className="mt-12">
                   <p className="text-center border-t border-neutral-900 pt-2 font-bold uppercase text-neutral-900">{formData.captainName}</p>
                   <p className="text-center text-sm font-medium text-neutral-500 uppercase">Punong Barangay</p>
                 </div>
              </div>

              <div className="mt-auto pt-12 text-center">
                 <div className="w-32 h-32 border-4 border-blue-900/10 rounded-full mx-auto flex items-center justify-center opacity-30">
                    <p className="text-[10px] font-bold text-blue-900 text-center uppercase tracking-widest leading-none">Official<br/>Barangay<br/>Dry Seal</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
