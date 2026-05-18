import React from 'react';
import { X, User, MapPin, Activity, Briefcase, Hash, Phone, Mail, FileText, Printer } from 'lucide-react';
import { PWDProfile } from '../types';

interface PWDViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PWDProfile | null;
}

export default function PWDViewModal({ isOpen, onClose, profile }: PWDViewModalProps) {
  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[30px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xl tracking-tighter shrink-0 border border-blue-200 shadow-sm uppercase">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">
                {profile.firstName} {profile.middleName} {profile.lastName} {profile.suffix}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-slate-500 font-mono tracking-widest">{profile.pwdNumber || 'NO PWD ID'}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                  profile.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' :
                  profile.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {profile.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" title="Print Profile">
              <Printer className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-white">
          {/* Section 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Personal Information
              </h3>
              <div className="space-y-3">
                <DetailItem label="Date of Birth" value={profile.dob} />
                <DetailItem label="Sex" value={profile.sex} />
                <DetailItem label="Civil Status" value={profile.civilStatus} />
                <DetailItem label="Blood Type" value={profile.bloodType} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Contact & Address
              </h3>
              <div className="space-y-3">
                <DetailItem label="Contact Number" value={profile.contactNumber} />
                <DetailItem label="Email" value={profile.email} />
                <DetailItem label="Address" value={`${profile.address}, ${profile.barangay}, ${profile.city}, ${profile.province}`} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Disability Information
              </h3>
              <div className="space-y-3">
                <DetailItem label="Type" value={profile.disabilityType} />
                <DetailItem label="Cause" value={profile.disabilityCause} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Education & Employment
              </h3>
              <div className="space-y-3">
                <DetailItem label="Education" value={profile.educationalAttainment} />
                <DetailItem label="Employment Status" value={profile.employmentStatus} />
                <DetailItem label="Occupation" value={profile.occupation} />
                <DetailItem label="Affiliation" value={profile.orgAffiliated} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" /> ID References
              </h3>
              <div className="space-y-3">
                <DetailItem label="SSS" value={profile.idReferences?.sss} />
                <DetailItem label="GSIS" value={profile.idReferences?.gsis} />
                <DetailItem label="Pag-IBIG/PSN" value={profile.idReferences?.psn} />
                <DetailItem label="PhilHealth" value={profile.idReferences?.philhealth} />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <User className="w-4 h-4" /> Family Background
              </h3>
              <div className="space-y-3">
                <DetailItem label="Guardian Name" value={profile.familyBackground?.guardianName} />
                <DetailItem label="Guardian Contact" value={profile.familyBackground?.guardianContact} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value?: string }) {
  return (
    <div>
      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
      <span className="block text-sm font-bold text-slate-800">{value || '-'}</span>
    </div>
  );
}
