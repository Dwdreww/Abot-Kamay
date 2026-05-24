import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Save, Send, Eye, Download, Printer, Loader2, CheckCircle, ChevronDown, X } from 'lucide-react';
import { generateRef, cn } from '../../../lib/utils';
import { generateApplicationReference } from '../../../lib/applicationService';
import { useAuth } from '../../../App';
import { db } from '../../../lib/firebase';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import DocumentViewerModal from '../../../components/DocumentViewerModal';

export default function DOHForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refNo, setRefNo] = useState(generateRef());
  const [activeTab, setActiveTab] = useState<'personal' | 'disability' | 'employment' | 'additional'>('personal');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    appType: 'New Applicant',
    pwdNumber: 'RR-PPMM-BBB-NNNNNNN',
    dateApplied: new Date().toISOString().split('T')[0],
    lastName: '',
    firstName: '',
    middleName: '',
    suffix: '',
    address: {
      houseNo: '',
      barangay: '',
      city: 'Dasmariñas',
      province: 'Cavite',
      region: 'Region IV-A'
    },
    contact: {
      landline: '',
      mobile: '',
      email: ''
    },
    dob: '',
    sex: 'Male',
    civilStatus: 'Single',
    disabilityTypes: [] as string[],
    disabilityCause: '',
    disabilityCauseCategory: '' as 'Congenital' | 'Acquired' | '',
    disabilityCauseSub: '',
    photoUrl: '',
    educationalAttainment: 'None',
    employmentStatus: 'Unemployed',
    categoryOfEmployment: 'Private',
    natureOfEmployment: 'Permanent/Regular',
    occupation: 'Managers',
    otherOccupation: '',
    bloodType: 'O+',
    organizationAffiliated: '',
    idReference: {
      sss: '',
      gsis: '',
      psn: '',
      philhealth: ''
    },
    philhealthStatus: 'Member',
    family: {
      father: { lastName: '', firstName: '', middleName: '' },
      mother: { lastName: '', firstName: '', middleName: '' }
    }
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        applicantName: `${formData.firstName} ${formData.lastName}`.trim() || user?.name || 'Anonymous',
        applicantEmail: formData.contact.email || user?.email || '',
        contactNumber: formData.contact.mobile,
        address: `${formData.address.houseNo}, ${formData.address.barangay}, ${formData.address.city}, ${formData.address.province}`,
        disabilityType: formData.disabilityTypes.join(', '),
        formType: 'doh_prpwd_registry',
        formTitle: 'DOH PRPWD Registry Form',
        category: 'Registration',
        purpose: 'PRPWD Registry',
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
        action: 'DOH PRPWD Form Submitted',
        userId: user.uid,
        userName: user?.name || 'Anonymous',
        targetType: 'applications',
        timestamp: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        targetRole: 'admin_broadcast',
        title: 'Bagong Aplikasyon',
        message: `${user?.name || 'Isang user'} ay nagpasa ng DOH PRPWD form.`,
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

  const disabilityOptions = [
    'Deaf', 'Intellectual', 'Learning', 'Mental', 
    'Orthopedic', 'Physical', 'Psychological', 
    'Speech and Language Impairment', 'Visual Disability', 
    'Cancer', 'Rare Disease'
  ];

  const occupationOptions = [
    'Managers', 'Professionals', 'Technicians and associate professional',
    'Clerical support workers', 'Skilled agricultural, forestry and fishery workers',
    'Craft and related trade workers', 'Plant and machine operators and assets',
    'Elementary occupations', 'Armed forces occupations', 'Other'
  ];

  const handleCheckbox = (val: string) => {
    setFormData(prev => ({
      ...prev,
      disabilityTypes: prev.disabilityTypes.includes(val)
        ? prev.disabilityTypes.filter(t => t !== val)
        : [...prev.disabilityTypes, val]
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('File is too large. Please upload an image smaller than 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center space-y-6 max-w-2xl mx-auto shadow-xl shadow-blue-900/5">
        <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-neutral-900">Form Submitted!</h2>
        <p className="text-neutral-500 text-lg">
          Your DOH Registry Form has been successfully received. 
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
    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden flex flex-col h-full max-w-5xl mx-auto">
      {/* Document Viewer Modal for Preview */}
      <DocumentViewerModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        docId="preview"
        collectionName="doh_registry"
        previewData={{ ...formData, referenceNumber: refNo }}
      />

      {/* Header */}
      <div className="bg-blue-600 p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">DOH PRPWD Registry Form</h2>
            <p className="text-blue-100 text-sm mt-1 opacity-80 uppercase tracking-widest font-black">Philippine Registry for Persons with Disability</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Ticket No.</p>
            <p className="font-mono text-lg font-bold">{refNo}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-100 px-4 pt-4 overflow-x-auto scrollbar-hide">
        {[
          { id: 'personal', label: '1. Personal Information' },
          { id: 'disability', label: '2. Disability Details' },
          { id: 'employment', label: '3. Employment & Education' },
          { id: 'additional', label: '4. Additional Info' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all border-b-4 whitespace-nowrap",
              activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-neutral-400 hover:text-neutral-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-8 flex-grow overflow-y-auto">
        <form className="space-y-8">
          {activeTab === 'personal' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Application Type *</label>
                    <select 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm"
                      value={formData.appType}
                      onChange={(e) => setFormData({ ...formData, appType: e.target.value })}
                    >
                      <option>New Applicant</option>
                      <option>Renewal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">PWD Number * (RR-PPMM-BBB-NNNNNNN)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-sm"
                      placeholder="RR-PPMM-BBB-NNNNNNN"
                      value={formData.pwdNumber}
                      onChange={(e) => setFormData({ ...formData, pwdNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-400 uppercase tracking-wider mb-2">Date Applied *</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm"
                      value={formData.dateApplied}
                      onChange={(e) => setFormData({ ...formData, dateApplied: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 rounded-3xl p-6 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">2x2 ID PHOTO *</p>
                    <div className="relative group w-40 h-40 bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                        {formData.photoUrl ? (
                            <>
                                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button 
                                    onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, photoUrl: '' })); }}
                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full transition-opacity shadow-lg"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </>
                        ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-50 transition-all">
                                <Download className="w-8 h-8 text-neutral-300 mb-2 rotate-180" />
                                <span className="text-[10px] font-bold text-neutral-400 uppercase">Upload Photo</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                    <p className="text-[9px] text-neutral-400 mt-4 leading-relaxed text-center font-medium max-w-[150px]">White background preferred. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5 uppercase text-[10px] tracking-widest font-black">Last Name *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5 uppercase text-[10px] tracking-widest font-black">First Name *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5 uppercase text-[10px] tracking-widest font-black">Middle Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                    placeholder="Enter middle name"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1.5 uppercase text-[10px] tracking-widest font-black">Suffix</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                    placeholder="Jr., III, etc"
                    value={formData.suffix}
                    onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">Complete Address *</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">House No. & Street *</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                      value={formData.address.houseNo}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, houseNo: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Barangay *</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                      value={formData.address.barangay}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, barangay: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">City/Municipality *</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                      value={formData.address.city}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Province *</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                      value={formData.address.province}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, province: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Region *</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold text-neutral-400" 
                      value={formData.address.region}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">Contact Details</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Landline</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                      value={formData.contact.landline}
                      onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, landline: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Mobile No. *</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                      value={formData.contact.mobile}
                      onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, mobile: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                      value={formData.contact.email}
                      onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div>
                  <label className="block text-sm font-black text-neutral-400 uppercase tracking-widest mb-1.5">Date of Birth *</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold" 
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-neutral-400 uppercase tracking-widest mb-1.5">Sex *</label>
                  <select 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm"
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  >
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div>
                   <label className="block text-sm font-black text-neutral-400 uppercase tracking-widest mb-1.5">Civil Status *</label>
                   <select 
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm"
                    value={formData.civilStatus}
                    onChange={(e) => setFormData({ ...formData, civilStatus: e.target.value })}
                   >
                      <option>Single</option>
                      <option>Married</option>
                      <option>Separated</option>
                      <option>Widow/er</option>
                      <option>Cohabitation</option>
                   </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'disability' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
               <div>
                 <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4">Type of Disability * (Check all that apply)</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                   {disabilityOptions.map((opt) => (
                     <label key={opt} className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer">
                       <input 
                         type="checkbox" 
                         className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600"
                         checked={formData.disabilityTypes.includes(opt)}
                         onChange={() => handleCheckbox(opt)}
                       />
                       <span className="text-xs font-black uppercase text-neutral-700 tracking-tight">{opt}</span>
                     </label>
                   ))}
                 </div>
               </div>

               <div className="space-y-6">
                 <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Cause of Disability *</h4>
                 <div className="flex gap-4">
                    {[
                      { id: 'Congenital', label: 'Congenital / Inborn' },
                      { id: 'Acquired', label: 'Acquired' }
                    ].map((cat) => (
                      <label key={cat.id} className={cn(
                        "flex-grow flex items-center justify-center px-10 py-5 rounded-3xl border-2 font-black text-xs uppercase tracking-widest transition-all cursor-pointer",
                        formData.disabilityCauseCategory === cat.id ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200" : "bg-neutral-50 border-neutral-200 text-neutral-400 hover:bg-neutral-100"
                      )}>
                        <input 
                          type="radio" 
                          className="hidden" 
                          name="cause_cat" 
                          checked={formData.disabilityCauseCategory === cat.id}
                          onChange={() => setFormData({...formData, disabilityCauseCategory: cat.id as any, disabilityCauseSub: ''})}
                        />
                        {cat.label}
                      </label>
                    ))}
                 </div>
                 
                 <AnimatePresence mode="wait">
                    {formData.disabilityCauseCategory === 'Congenital' && (
                        <motion.div 
                            key="congenital"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100"
                        >
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Congenital Conditions</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {['Autism', 'ADHD', 'Cerebral Palsy', 'Down Syndrome'].map(sub => (
                                    <label key={sub} className={cn(
                                        "flex items-center justify-center p-4 rounded-2xl border font-black text-[10px] uppercase tracking-tighter transition-all cursor-pointer",
                                        formData.disabilityCauseSub === sub ? "bg-blue-600 text-white border-blue-600 shadow-lg" : "bg-white border-blue-100 text-blue-400 hover:bg-blue-100/50"
                                    )}>
                                        <input type="radio" className="hidden" checked={formData.disabilityCauseSub === sub} onChange={() => setFormData({...formData, disabilityCauseSub: sub, disabilityCause: `Congenital: ${sub}`})} />
                                        {sub}
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {formData.disabilityCauseCategory === 'Acquired' && (
                        <motion.div 
                            key="acquired"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-8 bg-neutral-50 rounded-3xl border border-neutral-200"
                        >
                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">Acquired Conditions</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {['Chronical', 'Cerebral', 'Injury'].map(sub => (
                                    <label key={sub} className={cn(
                                        "flex items-center justify-center p-4 rounded-2xl border font-black text-[10px] uppercase tracking-tighter transition-all cursor-pointer",
                                        formData.disabilityCauseSub === sub ? "bg-slate-900 text-white border-slate-900 shadow-lg" : "bg-white border-neutral-200 text-neutral-400 hover:bg-neutral-100"
                                    )}>
                                        <input type="radio" className="hidden" checked={formData.disabilityCauseSub === sub} onChange={() => setFormData({...formData, disabilityCauseSub: sub, disabilityCause: `Acquired: ${sub}`})} />
                                        {sub}
                                    </label>
                                ))}
                            </div>
                        </motion.div>
                    )}
                 </AnimatePresence>
               </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Educational Attainment *</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      'None', 'Kindergarten', 'Elementary', 'Junior High School', 
                      'Senior High School', 'College', 'Vocational', 'Post Graduate'
                    ].map((level) => (
                      <label key={level} className={cn(
                        "flex items-center gap-3 p-3 bg-neutral-50 border rounded-xl cursor-pointer transition-all",
                        formData.educationalAttainment === level ? "border-blue-600 bg-blue-50" : "border-neutral-200"
                      )}>
                        <input 
                          type="radio" 
                          name="edu" 
                          checked={formData.educationalAttainment === level}
                          onChange={() => setFormData({ ...formData, educationalAttainment: level })}
                        />
                        <span className="text-xs font-black uppercase text-neutral-700 tracking-tight">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest">Employment Details *</h4>
                  <div className="space-y-6">
                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Status</p>
                       <div className="flex flex-wrap gap-2">
                        {['Employed', 'Unemployed', 'Self-Employed'].map((status) => (
                          <label key={status} className={cn(
                            "flex-grow flex items-center gap-3 p-3 bg-neutral-50 border rounded-xl cursor-pointer transition-all",
                            formData.employmentStatus === status ? "border-blue-600 bg-blue-50" : "border-neutral-200"
                          )}>
                            <input 
                              type="radio" 
                              name="emp" 
                              checked={formData.employmentStatus === status}
                              onChange={() => setFormData({ ...formData, employmentStatus: status })}
                            />
                            <span className="text-xs font-black uppercase tracking-tight">{status}</span>
                          </label>
                        ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Category</p>
                       <div className="flex gap-2">
                        {['Government', 'Private'].map((cat) => (
                          <label key={cat} className={cn(
                            "flex-grow flex items-center justify-center p-3 bg-neutral-50 border rounded-xl cursor-pointer transition-all",
                            formData.categoryOfEmployment === cat ? "border-blue-600 bg-blue-50" : "border-neutral-200"
                          )}>
                            <input 
                              type="radio" 
                              name="cat" 
                              className="hidden"
                              checked={formData.categoryOfEmployment === cat}
                              onChange={() => setFormData({ ...formData, categoryOfEmployment: cat })}
                            />
                            <span className="text-xs font-black uppercase tracking-tight">{cat}</span>
                          </label>
                        ))}
                       </div>
                    </div>

                    <div className="space-y-2">
                       <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Nature</p>
                       <div className="grid grid-cols-2 gap-2">
                        {['Permanent/Regular', 'Casual', 'Seasonal', 'Emergency'].map((nat) => (
                          <label key={nat} className={cn(
                            "flex items-center gap-3 p-3 bg-neutral-50 border rounded-xl cursor-pointer transition-all whitespace-nowrap",
                            formData.natureOfEmployment === nat ? "border-blue-600 bg-blue-50" : "border-neutral-200"
                          )}>
                            <input 
                              type="radio" 
                              name="nat" 
                              checked={formData.natureOfEmployment === nat}
                              onChange={() => setFormData({ ...formData, natureOfEmployment: nat })}
                            />
                            <span className="text-[10px] font-bold uppercase tracking-tight">{nat}</span>
                          </label>
                        ))}
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-neutral-100 space-y-4">
                 <label className="block text-sm font-black text-neutral-900 uppercase tracking-widest">Occupation *</label>
                 <select 
                   className="w-full px-4 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-sm"
                   value={formData.occupation}
                   onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                 >
                    {occupationOptions.map(opt => <option key={opt}>{opt}</option>)}
                 </select>
                 
                 {formData.occupation === 'Other' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                       <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 ml-2">Please specify occupation</label>
                       <input 
                        type="text" 
                        className="w-full px-6 py-4 bg-white border-2 border-blue-100 rounded-2xl font-bold text-sm shadow-sm"
                        placeholder="Type your occupation here..."
                        value={formData.otherOccupation}
                        onChange={(e) => setFormData({ ...formData, otherOccupation: e.target.value })}
                       />
                    </motion.div>
                 )}
              </div>
            </div>
          )}

          {activeTab === 'additional' && (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-black text-neutral-400 uppercase tracking-widest mb-2">Blood Type</label>
                        <select 
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl font-bold text-sm"
                          value={formData.bloodType}
                          onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                        >
                           {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => <option key={type}>{type}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-black text-neutral-400 uppercase tracking-widest mb-2">Organization Affiliated</label>
                        <input 
                          type="text" 
                          className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                          placeholder="Name of association/org"
                          value={formData.organizationAffiliated}
                          onChange={(e) => setFormData({ ...formData, organizationAffiliated: e.target.value })}
                        />
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-sm font-black text-neutral-400 uppercase tracking-widest">ID Reference Numbers</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">SSS No.</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono" 
                              value={formData.idReference.sss}
                              onChange={(e) => setFormData({ ...formData, idReference: { ...formData.idReference, sss: e.target.value } })}
                            />
                         </div>
                         <div>
                            <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">GSIS No.</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono" 
                              value={formData.idReference.gsis}
                              onChange={(e) => setFormData({ ...formData, idReference: { ...formData.idReference, gsis: e.target.value } })}
                            />
                         </div>
                         <div>
                            <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">PSN No.</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono" 
                              value={formData.idReference.psn}
                              onChange={(e) => setFormData({ ...formData, idReference: { ...formData.idReference, psn: e.target.value } })}
                            />
                         </div>
                         <div>
                            <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">Philhealth No.</label>
                            <input 
                              type="text" 
                              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-mono" 
                              value={formData.idReference.philhealth}
                              onChange={(e) => setFormData({ ...formData, idReference: { ...formData.idReference, philhealth: e.target.value } })}
                            />
                         </div>
                      </div>
                      <div className="flex gap-2">
                        {['Member', 'Member-Dependent'].map(st => (
                           <label key={st} className={cn(
                            "flex-grow flex items-center gap-2 p-3 bg-neutral-50 border rounded-xl cursor-pointer transition-all",
                            formData.philhealthStatus === st ? "border-blue-600 bg-blue-50" : "border-neutral-200"
                           )}>
                              <input 
                                type="radio" 
                                checked={formData.philhealthStatus === st}
                                onChange={() => setFormData({ ...formData, philhealthStatus: st })}
                              />
                              <span className="text-[10px] font-black uppercase tracking-tight">{st}</span>
                           </label>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-neutral-100">
                   <h4 className="text-sm font-black text-neutral-900 uppercase tracking-widest mb-6">Family Background</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Father's Name</p>
                         <div className="grid grid-cols-1 gap-3">
                            <input 
                              type="text" 
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                              placeholder="Last Name"
                              value={formData.family.father.lastName}
                              onChange={(e) => setFormData({ ...formData, family: { ...formData.family, father: { ...formData.family.father, lastName: e.target.value } } })}
                            />
                            <input 
                              type="text" 
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                              placeholder="First Name"
                              value={formData.family.father.firstName}
                              onChange={(e) => setFormData({ ...formData, family: { ...formData.family, father: { ...formData.family.father, firstName: e.target.value } } })}
                            />
                            <input 
                              type="text" 
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                              placeholder="Middle Name"
                              value={formData.family.father.middleName}
                              onChange={(e) => setFormData({ ...formData, family: { ...formData.family, father: { ...formData.family.father, middleName: e.target.value } } })}
                            />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Mother's Name</p>
                         <div className="grid grid-cols-1 gap-3">
                            <input 
                              type="text" 
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                              placeholder="Last Name"
                              value={formData.family.mother.lastName}
                              onChange={(e) => setFormData({ ...formData, family: { ...formData.family, mother: { ...formData.family.mother, lastName: e.target.value } } })}
                            />
                            <input 
                              type="text" 
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                              placeholder="First Name"
                              value={formData.family.mother.firstName}
                              onChange={(e) => setFormData({ ...formData, family: { ...formData.family, mother: { ...formData.family.mother, firstName: e.target.value } } })}
                            />
                            <input 
                              type="text" 
                              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-sm" 
                              placeholder="Middle Name"
                              value={formData.family.mother.middleName}
                              onChange={(e) => setFormData({ ...formData, family: { ...formData.family, mother: { ...formData.family.mother, middleName: e.target.value } } })}
                            />
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </form>
      </div>

      {/* Footer Actions */}
      <div className="bg-neutral-50 p-6 border-t border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {activeTab !== 'personal' && (
            <button 
              onClick={() => {
                if (activeTab === 'disability') setActiveTab('personal');
                if (activeTab === 'employment') setActiveTab('disability');
                if (activeTab === 'additional') setActiveTab('employment');
              }}
              className="px-6 py-3 font-black text-[10px] uppercase tracking-widest text-neutral-400 hover:text-neutral-900 transition-all"
            >
              Previous Section
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="flex-grow md:flex-initial px-6 py-3 font-black text-[10px] uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview Form
          </button>
          {activeTab !== 'additional' ? (
            <button 
              onClick={() => {
                if (activeTab === 'personal') setActiveTab('disability');
                if (activeTab === 'disability') setActiveTab('employment');
                if (activeTab === 'employment') setActiveTab('additional');
              }}
              className="flex-grow md:flex-initial px-8 py-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20"
            >
              Next Section
            </button>
          ) : (
            <button 
              onClick={() => handleSubmit()}
              disabled={loading}
              className="flex-grow md:flex-initial px-10 py-3 bg-green-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Submit to Registry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
