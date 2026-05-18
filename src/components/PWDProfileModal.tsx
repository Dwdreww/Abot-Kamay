import React, { useState, useEffect } from 'react';
import { X, Save, User, MapPin, Activity, Briefcase, Users, Hash } from 'lucide-react';
import { PWDProfile } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface PWDProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PWDProfile | null;
}

const emptyProfile: PWDProfile = {
  pwdNumber: '',
  lastName: '',
  firstName: '',
  middleName: '',
  suffix: '',
  disabilityType: '',
  disabilityCause: '',
  address: '',
  barangay: 'San Antonio de Padua 1',
  city: 'Dasmariñas',
  province: 'Cavite',
  contactNumber: '',
  email: '',
  dob: '',
  sex: 'Male',
  civilStatus: 'Single',
  educationalAttainment: '',
  employmentStatus: '',
  occupation: '',
  bloodType: '',
  orgAffiliated: '',
  idReferences: {
    sss: '',
    gsis: '',
    psn: '',
    philhealth: ''
  },
  familyBackground: {
    guardianName: '',
    guardianContact: ''
  },
  dateRegistered: null,
  status: 'Pending'
};

export default function PWDProfileModal({ isOpen, onClose, profile }: PWDProfileModalProps) {
  const [formData, setFormData] = useState<PWDProfile>(emptyProfile);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'contact' | 'disability' | 'employment' | 'family' | 'system'>('personal');

  useEffect(() => {
    if (profile) {
      setFormData({
        ...emptyProfile,
        ...profile,
        idReferences: { ...emptyProfile.idReferences, ...profile.idReferences },
        familyBackground: { ...emptyProfile.familyBackground, ...profile.familyBackground }
      });
    } else {
      setFormData(emptyProfile);
    }
  }, [profile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (profile?.id) {
        await updateDoc(doc(db, 'pwd_profiles', profile.id), {
          ...formData
        });
        alert('Record updated successfully!');
      } else {
        await addDoc(collection(db, 'pwd_profiles'), {
          ...formData,
          dateRegistered: serverTimestamp()
        });
        alert('Record added successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'contact', label: 'Contact', icon: MapPin },
    { id: 'disability', label: 'Disability', icon: Activity },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'family', label: 'Family & IDs', icon: Users },
    { id: 'system', label: 'System', icon: Hash }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-[30px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {profile ? 'Edit PWD Record' : 'Add New PWD Record'}
            </h2>
            <p className="text-slate-500 font-medium text-sm">
              {profile ? `Editing record for ${profile.firstName} ${profile.lastName}` : 'Fill in the details to register a new member.'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-slate-100 bg-slate-50/50 p-4 shrink-0 overflow-y-auto">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all uppercase tracking-widest text-left",
                      activeTab === tab.id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <form id="pwd-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8">
            {activeTab === 'personal' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">First Name *</label>
                    <input required type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Last Name *</label>
                    <input required type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Middle Name</label>
                    <input type="text" value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Suffix</label>
                    <input type="text" value={formData.suffix} onChange={e => setFormData({...formData, suffix: e.target.value})} placeholder="Jr, Sr, III" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Date of Birth</label>
                    <input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Sex</label>
                    <select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none">
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Civil Status</label>
                    <select value={formData.civilStatus} onChange={e => setFormData({...formData, civilStatus: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none">
                      <option>Single</option>
                      <option>Married</option>
                      <option>Widowed</option>
                      <option>Separated</option>
                    </select>
                  </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Blood Type</label>
                    <select value={formData.bloodType} onChange={e => setFormData({...formData, bloodType: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none">
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Contact Number</label>
                    <input type="text" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Address (House No. / Street)</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Barangay</label>
                    <input type="text" value={formData.barangay} onChange={e => setFormData({...formData, barangay: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">City/Municipality</label>
                    <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Province</label>
                    <input type="text" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'disability' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Type of Disability *</label>
                  <select required value={formData.disabilityType} onChange={e => setFormData({...formData, disabilityType: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none">
                    <option value="">Select Disability Type</option>
                    <option value="Deaf / Hard of Hearing">Deaf / Hard of Hearing</option>
                    <option value="Intellectual Disability">Intellectual Disability</option>
                    <option value="Learning Disability">Learning Disability</option>
                    <option value="Mental Disability">Mental Disability</option>
                    <option value="Orthopedic / Physical Disability">Orthopedic / Physical Disability</option>
                    <option value="Psychosocial Disability">Psychosocial Disability</option>
                    <option value="Speech and Language Impairment">Speech and Language Impairment</option>
                    <option value="Visual Disability">Visual Disability</option>
                    <option value="Cancer (RA11215)">Cancer (RA11215)</option>
                    <option value="Rare Disease (RA10747)">Rare Disease (RA10747)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Cause of Disability</label>
                  <select value={formData.disabilityCause} onChange={e => setFormData({...formData, disabilityCause: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none">
                    <option value="">Select Cause</option>
                    <option value="Congenital / Inborn">Congenital / Inborn</option>
                    <option value="Acquired">Acquired</option>
                    <option value="Autism">Autism</option>
                    <option value="Chronic Illness">Chronic Illness</option>
                    <option value="Injury">Injury</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'employment' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Educational Attainment</label>
                  <select value={formData.educationalAttainment} onChange={e => setFormData({...formData, educationalAttainment: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none">
                    <option value="">Select Education</option>
                    <option value="None">None</option>
                    <option value="Kindergarten">Kindergarten</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Junior High School">Junior High School</option>
                    <option value="Senior High School">Senior High School</option>
                    <option value="College">College</option>
                    <option value="Vocational">Vocational</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Employment Status</label>
                    <select value={formData.employmentStatus} onChange={e => setFormData({...formData, employmentStatus: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none">
                      <option value="">Select Status</option>
                      <option value="Employed">Employed</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Self-Employed">Self-Employed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Occupation</label>
                    <input type="text" value={formData.occupation} onChange={e => setFormData({...formData, occupation: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Affiliated Organization</label>
                  <input type="text" value={formData.orgAffiliated} onChange={e => setFormData({...formData, orgAffiliated: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                </div>
              </div>
            )}

            {activeTab === 'family' && (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">ID References</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">SSS No.</label>
                      <input type="text" value={formData.idReferences.sss || ''} onChange={e => setFormData({...formData, idReferences: {...formData.idReferences, sss: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">GSIS No.</label>
                      <input type="text" value={formData.idReferences.gsis || ''} onChange={e => setFormData({...formData, idReferences: {...formData.idReferences, gsis: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pag-IBIG / PSN No.</label>
                      <input type="text" value={formData.idReferences.psn || ''} onChange={e => setFormData({...formData, idReferences: {...formData.idReferences, psn: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">PhilHealth No.</label>
                      <input type="text" value={formData.idReferences.philhealth || ''} onChange={e => setFormData({...formData, idReferences: {...formData.idReferences, philhealth: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2">Guardian Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Guardian Name</label>
                      <input type="text" value={formData.familyBackground.guardianName || ''} onChange={e => setFormData({...formData, familyBackground: {...formData.familyBackground, guardianName: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Guardian Contact No.</label>
                      <input type="text" value={formData.familyBackground.guardianContact || ''} onChange={e => setFormData({...formData, familyBackground: {...formData.familyBackground, guardianContact: e.target.value}})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">PWD ID Number</label>
                    <input type="text" value={formData.pwdNumber} onChange={e => setFormData({...formData, pwdNumber: e.target.value})} placeholder="e.g. 13-21-04-001" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Record Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none font-bold">
                      <option value="Verified">Verified</option>
                      <option value="Pending">Pending</option>
                      <option value="In Review">In Review</option>
                      <option value="Deceased">Deceased</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-4 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="pwd-form"
            disabled={loading}
            className="px-8 py-3 bg-blue-600 rounded-xl text-xs font-black text-white uppercase tracking-widest hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  );
}
