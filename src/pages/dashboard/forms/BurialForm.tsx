import React, { useState } from 'react';
import { 
  Send, Eye, Download, 
  Loader2, CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { generateRef } from '../../../lib/utils';
import { generateApplicationReference } from '../../../lib/applicationService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

import { db } from '../../../lib/firebase';
import { doc, setDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../../../App';

export default function BurialForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNo, setRefNo] = useState(generateRef());
  const [docId, setDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const initialFormState = {
    deceasedName: '',
    pwdId: '',
    claimantName: '',
    contactNumber: '',
    relationship: '',
    address: '',
    funeralService: '',
    requirements: {
      deathCert: false,
      pwdId: false,
      votersId: false,
      brgyCert: false,
      cswdoCert: false
    }
  };

  const [formData, setFormData] = useState(initialFormState);

  const handleReset = () => {
    setFormData(initialFormState);
    setRefNo(generateRef());
    setDocId(null);
    setSubmitted(false);
    setError(null);
    setSuccessMsg(null);
  };

  const validateForm = () => {
    if (!formData.deceasedName.trim() ||
        !formData.pwdId.trim() ||
        !formData.claimantName.trim() ||
        !formData.contactNumber.trim() ||
        !formData.relationship.trim() ||
        !formData.address.trim() ||
        !formData.funeralService.trim()) {
      setError('Pakikumpleto ang lahat ng required fields.');
      return false;
    }
    setError(null);
    return true;
  };

  const saveToFirestore = async (status: 'Draft' | 'Submitted') => {
    if (!user) {
      setError('Kailangan mong mag-log in.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const isDraft = status === 'Draft';
      const actualStatus = isDraft ? 'draft' : 'pending';

      let currentDocId = docId;
      let actualRefNo = refNo;

      if (!currentDocId) {
        const newDocRef = doc(collection(db, 'applications'));
        currentDocId = newDocRef.id;
        actualRefNo = await generateApplicationReference();
        setRefNo(actualRefNo);
        setDocId(currentDocId);
      }

      const payload: any = {
        applicationId: currentDocId,
        referenceNumber: actualRefNo,
        userId: user.uid,
        applicantName: formData.claimantName.trim() || user?.name || 'Anonymous',
        applicantEmail: user?.email || '',
        contactNumber: formData.contactNumber.trim(),
        address: formData.address.trim(),
        disabilityType: '', // Not specifically applicable to claimant, but required by schema
        formType: 'pwd_burial_assistance',
        formTitle: 'Form para sa PWD Burial Assistance',
        category: 'Financial Assistance',
        purpose: 'Burial Assistance',
        formData: {
          deceasedName: formData.deceasedName.trim(),
          pwdId: formData.pwdId.trim(),
          relationship: formData.relationship.trim(),
          funeralService: formData.funeralService.trim(),
        },
        requirements: formData.requirements,
        status: actualStatus,
        remarks: '',
        updatedAt: serverTimestamp(),
        reviewedBy: '',
        reviewedAt: null
      };

      if (!isDraft) {
        payload.submittedAt = serverTimestamp();
      } else if (!docId) {
        payload.submittedAt = serverTimestamp(); // Even draft gets submittedAt for sorting on creation
      }

      if (docId) {
        await updateDoc(doc(db, 'applications', currentDocId), payload);
      } else {
        await setDoc(doc(db, 'applications', currentDocId), payload);
      }

      await addDoc(collection(db, 'audit_logs'), {
        action: status === 'Draft' ? 'Burial Assistance Draft Saved' : 'Burial Assistance Submitted',
        userId: user.uid,
        userName: user?.name || 'Anonymous',
        targetId: docId || 'new',
        targetType: 'applications',
        timestamp: serverTimestamp()
      });

      if (status === 'Submitted') {
        setSubmitted(true);
      } else {
        setSuccessMsg('Nai-save ang draft nang matagumpay.');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error("Firestore Save Error:", err);
      setError(`Failed to save application: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = (e: React.MouseEvent) => {
    e.preventDefault();
    saveToFirestore('Draft');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await saveToFirestore('Submitted');
  };

  const handleDownload = async () => {
    const element = document.getElementById('form-p-preview');
    if (!element) return;
    
    setLoading(true);
    try {
      // Give DOM time to ensure fonts/images are ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(element, { 
        scale: 1.5,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Burial_Assistance_${refNo}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setLoading(false);
    }
  };

  const previewContent = (
    <div id="form-p-preview" className="max-w-[700px] mx-auto bg-white p-10 select-none shadow-sm h-full flex flex-col justify-between">
      <div>
        {/* Letterhead */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <img src="/Dasma_logo.png" alt="Dasma Logo" className="w-16 h-16 object-contain" />
            <img src="/DSWD_Logo.png" alt="DSWD Logo" className="w-20 h-20 object-contain" />
          </div>
          <div className="text-right text-xs font-bold text-neutral-800 leading-snug">
            <p>Persons with Disability Affairs Office (PDAO)</p>
            <p>City Social Welfare Development Office</p>
            <p>City of Dasmariñas</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <h2 className="text-xl font-black text-neutral-800 tracking-wide">PWD BURIAL ASSISTANCE</h2>
          <h2 className="text-xl font-black text-neutral-800 tracking-wide">APPLICATION FORM</h2>
          <p className="text-xs font-mono mt-4 text-neutral-400">Ref No: {refNo}</p>
        </div>

        <div className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <span className="font-bold text-sm min-w-[150px]">NAME OF DECEASED:</span>
              <span className="flex-1 border-b border-neutral-900 text-sm font-medium pb-1">{formData.deceasedName}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold text-sm min-w-[150px]">PWD ID NUMBER :</span>
              <span className="flex-1 border-b border-neutral-900 text-sm font-mono tracking-widest pb-1">{formData.pwdId}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold text-sm min-w-[150px]">NAME OF CLAIMANT:</span>
              <span className="flex-1 border-b border-neutral-900 text-sm font-medium pb-1">{formData.claimantName}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold text-sm min-w-[150px]">CONTACT NO. :</span>
              <span className="flex-1 border-b border-neutral-900 text-sm font-medium pb-1">{formData.contactNumber}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold text-sm min-w-[150px]">RELATIONSHIP :</span>
              <span className="flex-1 border-b border-neutral-900 text-sm font-medium pb-1 w-1/2">{formData.relationship}</span>
              <span className="w-1/4"></span>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-bold text-sm min-w-[150px]">ADDRESS :</span>
              <span className="flex-1 border-b border-neutral-900 text-sm font-medium pb-1">{formData.address}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="min-w-[150px]"></span>
              <span className="flex-1 border-b border-neutral-900 text-sm font-medium pb-1 h-5"></span>
            </div>
            <div className="flex items-end gap-2 pt-2">
              <span className="font-bold text-sm min-w-[150px]">FUNERAL SERVICE :</span>
              <span className="flex-1 border-b border-neutral-900 text-sm font-medium pb-1 w-2/3">{formData.funeralService}</span>
              <span className="w-1/6"></span>
            </div>
          </div>

          {/* Requirements */}
          <div className="pt-6">
            <p className="text-sm font-bold mb-3">REQUIREMENTS CHECKLIST:</p>
            <div className="space-y-2 pl-8">
               <div className="flex items-start gap-4">
                 <div className="w-4 h-4 border border-neutral-900 mt-0.5 flex items-center justify-center shrink-0">
                   {formData.requirements.deathCert && <span className="w-2.5 h-2.5 bg-neutral-900"></span>}
                 </div>
                 <p className="text-sm leading-tight text-neutral-800">Xerox Copy of Registered Death Certificate<br/>with Original Certified True Copy</p>
               </div>
               <div className="flex items-start gap-4">
                 <div className="w-4 h-4 border border-neutral-900 mt-0.5 flex items-center justify-center shrink-0">
                   {formData.requirements.pwdId && <span className="w-2.5 h-2.5 bg-neutral-900"></span>}
                 </div>
                 <p className="text-sm leading-tight text-neutral-800">Original PWD ID</p>
               </div>
               <div className="flex items-start gap-4">
                 <div className="w-4 h-4 border border-neutral-900 mt-0.5 flex items-center justify-center shrink-0">
                   {formData.requirements.votersId && <span className="w-2.5 h-2.5 bg-neutral-900"></span>}
                 </div>
                 <p className="text-sm leading-tight text-neutral-800">Xerox Copy of Latest Voters ID or Latest<br/>Voters Certificate of Claimant</p>
               </div>
               <div className="flex items-start gap-4">
                 <div className="w-4 h-4 border border-neutral-900 mt-0.5 flex items-center justify-center shrink-0">
                   {formData.requirements.brgyCert && <span className="w-2.5 h-2.5 bg-neutral-900"></span>}
                 </div>
                 <p className="text-sm leading-tight text-neutral-800">Pagpapatunay from Barangay</p>
               </div>
               <div className="flex items-start gap-4">
                 <div className="w-4 h-4 border border-neutral-900 mt-0.5 flex items-center justify-center shrink-0">
                   {formData.requirements.cswdoCert && <span className="w-2.5 h-2.5 bg-neutral-900"></span>}
                 </div>
                 <p className="text-sm leading-tight text-neutral-800">Pagpapatunay from CSWDO</p>
               </div>
            </div>
          </div>

          <p className="text-sm text-neutral-800 pt-4 leading-snug">
            Upon completion of all the requirements listed above, please proceed to PDAO to submit the documents.
          </p>

          <div className="pt-4">
            <p className="text-sm text-neutral-800">Accomplished by:</p>
            <div className="mt-12 w-64">
               <div className="border-b border-neutral-900 text-center text-sm font-medium pb-1">{formData.claimantName}</div>
               <p className="text-sm text-neutral-800 text-center pt-1">Signature over Printed Name</p>
            </div>
          </div>

          <div className="mt-12 pt-6 relative border-t border-dashed border-neutral-900">
             <span className="text-[9px] font-bold absolute left-1/2 -translate-x-1/2 -top-2 bg-white px-2 tracking-widest text-neutral-600 uppercase">
               -Do not write anything below this line-
             </span>
             
             <div className="pt-4 space-y-4">
               <p className="text-[10px] font-bold text-neutral-800 uppercase tracking-wide">TO BE FILLED OUT BY PDAO STAFF</p>
               
               <div className="flex items-end gap-2 w-64">
                 <span className="font-bold text-sm text-neutral-800">DATE RECEIVED:</span>
                 <span className="flex-1 border-b border-neutral-900"></span>
               </div>
               <div className="flex items-end gap-2 w-64">
                 <span className="font-bold text-sm text-neutral-800">RECEIVED BY:</span>
                 <span className="flex-1 border-b border-neutral-900"></span>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="relative">
        <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-6 max-w-2xl mx-auto shadow-xl shadow-blue-900/5">
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900">Naipadala na ang Aplikasyon!</h2>
          <p className="text-neutral-500 text-lg">
            Matagumpay na natanggap ang iyong aplikasyon para sa burial assistance. 
            Pakitago ang iyong reference number para sa pag-track.
          </p>
          <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 inline-block font-mono text-2xl font-bold text-blue-600 tracking-widest px-10">
            {refNo}
          </div>
          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleReset}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Gumawa ng panibagong form
            </button>
            <button 
              onClick={handleDownload}
              disabled={loading}
              className="px-8 py-3 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              {loading ? "Nagda-download..." : "I-download ang Kopya"}
            </button>
          </div>
        </div>
        <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none z-[-1]">
          {previewContent}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      {/* Absolute hidden container for PDF generation outside preview Mode */}
      <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none z-[-1]">
        {previewContent}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 sticky top-20 z-10 bg-neutral-50/80 backdrop-blur-md py-4 rounded-b-xl border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest pl-2">Seksyon: Form ng Burial Assistance</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => setPreviewMode(!previewMode)}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all flex items-center gap-2 shadow-sm"
          >
            {previewMode ? <AlertCircle className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {previewMode ? 'Edit Mode' : 'Live Preview'}
          </button>
          <button 
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className="px-4 py-2 bg-white border border-neutral-200 rounded-lg text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            I-export ang PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-6 py-4 rounded-xl text-sm font-bold flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            {successMsg}
          </div>
        )}

        {/* Form Entry */}
        {!previewMode ? (
          <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-12 rounded-3xl border border-neutral-200 shadow-sm transition-all animate-in fade-in duration-300">
            <div className="border-b border-neutral-100 pb-6 mb-6">
              <h3 className="text-2xl font-bold text-neutral-900">Application for Burial Assistance</h3>
              <p className="text-sm text-neutral-500 mt-1">Mangyaring punan nang tumpak ang lahat ng kinakailangang impormasyon.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Deceased Info */}
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-widest border-l-2 border-blue-600 pl-3">Impormasyon ng Pumanaw</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Pangalan ng Pumanaw</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Buong Pangalan"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                      value={formData.deceasedName}
                      onChange={(e) => setFormData({ ...formData, deceasedName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Numero ng PWD ID</label>
                    <input 
                      type="text" 
                      required
                      placeholder="XX-XXXX-XXXXX"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                      value={formData.pwdId}
                      onChange={(e) => setFormData({ ...formData, pwdId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Pangalan ng Punerarya</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Pangalan ng Punerarya"
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-mono uppercase text-xs"
                      value={formData.funeralService}
                      onChange={(e) => setFormData({ ...formData, funeralService: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Claimant Info */}
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-green-600 uppercase tracking-widest border-l-2 border-green-600 pl-3">Impormasyon ng Nag-claim</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Pangalan ng Nag-claim</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                      value={formData.claimantName}
                      onChange={(e) => setFormData({ ...formData, claimantName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Relasyon</label>
                      <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                        value={formData.relationship}
                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Numero sa Telepono</label>
                      <input 
                        type="tel" 
                        required
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                        value={formData.contactNumber}
                        onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Kumpletong Address</label>
                    <textarea 
                      required
                      rows={3}
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all text-sm"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="pt-6 border-t border-neutral-100">
              <h4 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-6">Listahan ng mga Kinakailangan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  deathCert: "Xerox Copy of Registered Death Certificate (with Original CTC)",
                  pwdId: "Original PWD ID of the Deceased",
                  votersId: "Xerox Copy of Latest Voter's ID/Cert of Claimant",
                  brgyCert: "Pagpapatunay from Barangay",
                  cswdoCert: "Pagpapatunay from CSWDO"
                }).map(([key, label]) => (
                  <label key={key} className="flex items-start gap-3 p-4 rounded-xl border border-neutral-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                      checked={formData.requirements[key as keyof typeof formData.requirements]}
                      onChange={(e) => setFormData({
                        ...formData,
                        requirements: {
                          ...formData.requirements,
                          [key]: e.target.checked
                        }
                      })}
                    />
                    <span className="text-xs font-medium text-neutral-700 group-hover:text-blue-900">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-8">
              <button 
                type="button" 
                onClick={handleSaveDraft}
                disabled={loading}
                className="px-6 py-3 text-sm font-bold text-neutral-500 hover:bg-neutral-100 rounded-xl transition-all disabled:opacity-50"
              >
                I-save bilang Draft
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 group disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    I-submit ang Aplikasyon
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Preview Mode Component */
          <div className="bg-white p-8 md:p-12 lg:p-16 rounded-3xl border border-neutral-200 shadow-lg transition-all animate-in zoom-in-95 duration-300">
            {/* The preview layout directly rendered here so user can see it in DOM naturally without capturing hidden element if possible, but actually we will just render the identical element. For simplicity, we just use the previewContent */}
            <div className="pointer-events-none">
              {previewContent}
            </div>
            
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setPreviewMode(false)}
                className="text-sm font-bold text-blue-600 hover:underline"
              >
                Bumalik para i-edit ang form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
