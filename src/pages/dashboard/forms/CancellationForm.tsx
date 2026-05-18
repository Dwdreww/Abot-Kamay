import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Printer, Eye, ChevronLeft, FileText, Calendar, User, MapPin, Hash, CheckSquare, Square, CheckCircle, Loader2, Send } from 'lucide-react';
import { generateRef, cn } from '../../../lib/utils';
import { generateApplicationReference } from '../../../lib/applicationService';
import { useAuth } from '../../../App';
import { db } from '../../../lib/firebase';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';

export default function CancellationForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNo] = useState(generateRef());
  const [showPreview, setShowPreview] = useState(false);
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
        formTitle: 'Certificate of Cancellation',
        category: 'Membership',
        purpose: 'Cancellation',
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

      setSubmitted(true);
    } catch (err) {
      console.error("Firestore Save Error:", err);
      alert(`Failed to submit application: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
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
    if (formData.reasons.transfer) active.push("Transfer of residence");
    if (formData.reasons.voluntary) active.push("Voluntary withdrawal");
    if (formData.reasons.reclassification) active.push("Reclassification");
    if (formData.reasons.other && formData.otherReason) active.push(formData.otherReason);
    return active.join(", ") || "No reason specified";
  };

  const processedDate = new Date(formData.effectiveDate);
  processedDate.setDate(processedDate.getDate() + 1);

  if (submitted) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-6 max-w-2xl mx-auto shadow-xl shadow-blue-900/5">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-neutral-900">Form Submitted!</h2>
        <p className="text-neutral-500 text-lg">
          Your Membership Cancellation request has been successfully received. 
          Please keep your <strong>Ticket Number</strong> for tracking.
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
          <div className="relative bg-white p-8 rounded-3xl border border-blue-100 shadow-2xl font-mono text-3xl font-black text-blue-600 tracking-[0.2em] px-12 z-10">
            {refNo}
          </div>
        </motion.div>
        <div className="pt-8">
          <button 
            onClick={() => window.location.reload()}
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
          >
            Back to Dashboard
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
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">Certificate of Cancellation</h2>
                <p className="text-slate-500 font-medium mt-2">Fill in the details for PWD membership cancellation.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name of PWD Member</label>
                      <div className="relative group">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                         <input 
                           type="text" 
                           placeholder="Enter member's full name"
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-bold text-slate-900"
                           value={formData.fullName}
                           onChange={e => setFormData({...formData, fullName: e.target.value})}
                         />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">PWD ID Number</label>
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
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete Address</label>
                      <div className="relative group">
                         <MapPin className="absolute left-4 top-5 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                         <textarea 
                           rows={3}
                           placeholder="Enter complete residential address"
                           className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all font-bold text-slate-900 text-sm"
                           value={formData.address}
                           onChange={e => setFormData({...formData, address: e.target.value})}
                         ></textarea>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="space-y-4">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Effective Cancelled Date</label>
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
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason(s) for Cancellation</label>
                      <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                         <button 
                           onClick={() => handleCheckboxChange('transfer')}
                           className="flex items-center gap-3 w-full text-left group"
                         >
                            {formData.reasons.transfer ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />}
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Transfer of residence</span>
                         </button>
                         <button 
                           onClick={() => handleCheckboxChange('voluntary')}
                           className="flex items-center gap-3 w-full text-left group"
                         >
                            {formData.reasons.voluntary ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />}
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Voluntary withdrawal</span>
                         </button>
                         <button 
                           onClick={() => handleCheckboxChange('reclassification')}
                           className="flex items-center gap-3 w-full text-left group"
                         >
                            {formData.reasons.reclassification ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />}
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Reclassification/Status Change</span>
                         </button>
                         <div className="space-y-3">
                            <button 
                              onClick={() => handleCheckboxChange('other')}
                              className="flex items-center gap-3 w-full text-left group"
                            >
                               {formData.reasons.other ? <CheckSquare className="w-5 h-5 text-blue-600" /> : <Square className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />}
                               <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Other:</span>
                            </button>
                            {formData.reasons.other && (
                              <input 
                                type="text"
                                placeholder="Specify other reason..."
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
                  Preview Document
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in zoom-in-95 duration-500">
           <div className="flex items-center justify-between bg-white p-6 px-10 rounded-[30px] border border-slate-100 shadow-2xl shadow-slate-200/20">
              <button 
                onClick={() => setShowPreview(false)}
                className="flex items-center gap-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors group"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Edit Details
              </button>
              <div className="flex items-center gap-4">
                 <button className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all text-slate-400 hover:text-blue-600">
                    <Printer className="w-5 h-5" />
                 </button>
                 <button 
                   onClick={handleSubmit}
                   disabled={loading}
                   className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-200 flex items-center gap-3 text-[10px] uppercase tracking-widest disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                   Submit Request
                 </button>
                 <button className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-200 flex items-center gap-3 text-[10px] uppercase tracking-widest">
                    <Download className="w-5 h-5" />
                    Export PDF
                 </button>
              </div>
           </div>

           {/* Cancellation Certificate Preview */}
           <div className="bg-white p-16 md:p-24 shadow-2xl rounded-sm border-t-[12px] border-blue-900 max-w-[850px] mx-auto min-h-[1100px] flex flex-col relative overflow-hidden">
              {/* Watermark/Seal background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                 <div className="w-[600px] h-[600px] border-[40px] border-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-8xl font-black text-blue-900 text-center uppercase tracking-tighter">OFFICIAL<br/>PWD OFFICE</span>
                 </div>
              </div>

              {/* Header */}
              <div className="text-center space-y-1 mb-14 relative z-10">
                 <p className="text-sm font-bold uppercase tracking-widest text-slate-800">Republic of the Philippines</p>
                 <p className="text-sm text-slate-600 uppercase font-medium">Province of {formData.province}</p>
                 <p className="text-sm text-slate-600 uppercase font-medium">City of {formData.city}</p>
                 <p className="text-sm text-slate-800 uppercase font-black tracking-tight underline">Barangay {formData.barangay}</p>
                 <p className="text-lg font-black text-blue-900 mt-6 uppercase tracking-tight">Persons with Disability (PWD) Office</p>
                 <div className="w-24 h-1 bg-blue-900 mx-auto mt-4 rounded-full"></div>
              </div>

              {/* Title */}
              <div className="text-center mb-16 relative z-10">
                 <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter decoration-slate-900/20 underline underline-offset-8">CERTIFICATE OF CANCELLATION OF PWD MEMBERSHIP</h1>
              </div>

              {/* Body */}
              <div className="flex-grow space-y-10 text-base font-medium leading-relaxed text-slate-800 relative z-10 text-justify">
                 <p className="font-black text-slate-900">To Whom It May Concern:</p>
                 
                 <p className="indent-12">
                   This is to certify that <strong className="text-slate-900 px-1 border-b border-slate-300">{formData.fullName || '__________________________'}</strong>, 
                   a resident of <strong className="text-slate-900 px-1 border-b border-slate-300">{formData.address || '____________________________________________________'}</strong>, 
                   was previously registered as a member of the Barangay Persons with Disability (PWD) Registry under PWD ID No. <strong className="text-slate-900 font-mono px-1 border-b border-slate-300">{formData.pwdId || '[ID NUMBER]'}</strong>.
                 </p>

                 <p className="indent-12">
                   Upon request and due evaluation, the said membership has been cancelled effective <strong className="text-slate-900 px-1 border-b border-slate-300">{processedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>, for the following reason(s):
                 </p>

                 <div className="space-y-4 pl-12">
                    <div className="flex items-start gap-4">
                       <div className="w-5 h-5 border-2 border-slate-900 shrink-0 mt-1 flex items-center justify-center">
                          {formData.reasons.transfer && <div className="w-3 h-3 bg-slate-900"></div>}
                       </div>
                       <p className="text-sm font-bold uppercase tracking-tight">Transfer of residence to another barangay/city/municipality</p>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-5 h-5 border-2 border-slate-900 shrink-0 mt-1 flex items-center justify-center">
                          {formData.reasons.voluntary && <div className="w-3 h-3 bg-slate-900"></div>}
                       </div>
                       <p className="text-sm font-bold uppercase tracking-tight">Voluntary withdrawal from the PWD Registry</p>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-5 h-5 border-2 border-slate-900 shrink-0 mt-1 flex items-center justify-center">
                          {formData.reasons.reclassification && <div className="w-3 h-3 bg-slate-900"></div>}
                       </div>
                       <p className="text-sm font-bold uppercase tracking-tight">Reclassification or change in disability status</p>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-5 h-5 border-2 border-slate-900 shrink-0 mt-1 flex items-center justify-center">
                          {formData.reasons.other && <div className="w-3 h-3 bg-slate-900"></div>}
                       </div>
                       <p className="text-sm font-bold uppercase tracking-tight">Other: <span className="border-b border-slate-300 px-2">{formData.otherReason || '_______________________'}</span></p>
                    </div>
                 </div>

                 <p className="indent-12 mt-12">
                   This certification is issued upon the request of the concerned individual for whatever legal or administrative purpose it may serve.
                 </p>

                 <p className="indent-12">
                   Issued this <strong className="text-slate-900">{processedDate.getDate()}</strong> day of <strong className="text-slate-900">{processedDate.toLocaleString('en-US', { month: 'long' })}</strong>, <strong className="text-slate-900">{processedDate.getFullYear()}</strong> at Barangay <strong className="text-slate-900">{formData.barangay}</strong>, <strong className="text-slate-900">{formData.city}</strong>, <strong className="text-slate-900">{formData.province}</strong>, Philippines.
                 </p>
              </div>

              {/* Signatures */}
              <div className="mt-24 space-y-1 relative z-10">
                 <div className="w-72 border-b border-slate-900 pt-16"></div>
                 <p className="text-sm font-black uppercase text-slate-900 tracking-tight">{formData.presidentName}</p>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Barangay PWD President</p>
                 <div className="pt-4 space-y-1">
                    <p className="text-[10px] font-medium text-slate-400 capitalize">Contact No.: {formData.contactNo}</p>
                    <p className="text-[10px] font-medium text-slate-400 capitalize">Email: {formData.email}</p>
                 </div>
              </div>

              {/* Reference Footer */}
              <div className="mt-auto pt-16 flex items-end justify-between relative z-10">
                 <div className="space-y-1">
                    <p className="text-[9px] font-mono text-slate-300 uppercase">System Generated Record</p>
                    <p className="text-[9px] font-mono text-slate-400 uppercase tracking-tighter">REF: {refNo}</p>
                 </div>
                 <div className="w-32 h-32 border-4 border-slate-100 rounded-full flex items-center justify-center opacity-40">
                    <p className="text-[9px] font-black text-slate-300 text-center uppercase tracking-widest leading-none">Official<br/>Barangay<br/>PWD Seal</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
