import React, { useState } from 'react';
import {
  User, Mail, Phone, MapPin,
  Edit2, CheckCircle2,
  Save, X, Loader2, Camera
} from 'lucide-react';
import { useAuth } from '../../App';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function Settings() {
  const { user, signIn } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || '',
    birthdate: user?.birthdate || '',
    contactNumber: user?.contactNumber || '',
    address: user?.address || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX = 256;
        let w = img.width;
        let h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
        else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
        try {
          await updateDoc(doc(db, 'users', user.uid), { avatarUrl: dataUrl });
          signIn({ ...user, avatarUrl: dataUrl } as any);
        } catch (err) {
          console.error('Error updating avatar:', err);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), formData);
      signIn({ ...user, ...formData } as any);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      age: user?.age || '',
      gender: user?.gender || '',
      birthdate: user?.birthdate || '',
      contactNumber: user?.contactNumber || '',
      address: user?.address || '',
      avatarUrl: user?.avatarUrl || '',
    });
    setIsEditing(false);
  };

  const roleLabel =
    user?.role === 'admin' ? 'Administrator' :
    user?.role === 'staff' ? 'Barangay Staff' : 'User';

  const currentAvatar =
    formData.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'AK')}&background=0b1a38&color=fff&size=200`;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Edit Profile</h2>
        <p className="text-slate-500 font-medium tracking-tight">I-update ang iyong personal na impormasyon at larawan ng account.</p>
      </div>

      {/* Avatar + Name Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 flex flex-col md:flex-row items-center gap-10">
        {/* Avatar */}
        <div className="relative group shrink-0">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-100 border-4 border-white shadow-lg">
            <img
              src={currentAvatar}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <Camera className="w-4 h-4" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {/* Name + Role */}
        <div className="flex-grow space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name}</h3>
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-[#0b1a38]/10 text-[#0b1a38] rounded-full text-[10px] font-black tracking-widest uppercase">
                {roleLabel}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aktibo
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">
            Account ID: AKP-{user?.uid?.slice(0, 6).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Personal Information Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">Personal at Impormasyon ng Account</h4>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-3 hover:bg-slate-50 rounded-xl text-blue-600 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
            >
              <Edit2 className="w-3.5 h-3.5" /> I-edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="p-3 hover:bg-red-50 rounded-xl text-red-500 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
              >
                <X className="w-3.5 h-3.5" /> Kanselahin
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                I-save
              </button>
            </div>
          )}
        </div>

        <div className="p-8 space-y-6">
          {isEditing ? (
            <div className="space-y-6">
              <EditField
                label="Buong Pangalan"
                value={formData.name}
                onChange={val => setFormData({ ...formData, name: val })}
              />
              <EditField
                label="Email Address"
                value={formData.email}
                type="email"
                onChange={val => setFormData({ ...formData, email: val })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditField
                  label="Araw ng Kapanganakan"
                  value={formData.birthdate}
                  type="date"
                  onChange={val => setFormData({ ...formData, birthdate: val })}
                />
                <EditField
                  label="Edad"
                  value={formData.age}
                  type="number"
                  onChange={val => setFormData({ ...formData, age: val })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EditField
                  label="Kasarian"
                  value={formData.gender}
                  type="select"
                  options={['Male', 'Female', 'Other']}
                  onChange={val => setFormData({ ...formData, gender: val })}
                />
                <EditField
                  label="Numero ng Telepono"
                  value={formData.contactNumber}
                  onChange={val => setFormData({ ...formData, contactNumber: val })}
                />
              </div>
              <EditField
                label="Kumpletong Address"
                value={formData.address}
                type="textarea"
                onChange={val => setFormData({ ...formData, address: val })}
              />
            </div>
          ) : (
            <>
              <InfoField label="Buong Pangalan" value={user?.name || '—'} />
              <InfoField label="Posisyon" value={roleLabel} />
              <InfoField label="Email Address" value={user?.email || '—'} />
              <InfoField
                label="Araw ng Kapanganakan"
                value={
                  user?.birthdate
                    ? new Date(user.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Hindi ibinigay'
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <InfoField label="Edad" value={user?.age || 'N/A'} />
                <InfoField
                  label="Kasarian"
                  value={
                    user?.gender === 'Male' ? 'Lalaki' :
                    user?.gender === 'Female' ? 'Babae' :
                    user?.gender === 'Other' ? 'Iba pa' : 'N/A'
                  }
                />
              </div>
              <InfoField label="Numero ng Telepono" value={user?.contactNumber || 'Hindi ibinigay'} />
              <InfoField label="Kumpletong Address" value={user?.address || 'Hindi ibinigay'} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-4 gap-2">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">{label}</span>
      <span className="text-sm font-bold text-slate-900 text-right">{value}</span>
    </div>
  );
}

function EditField({
  label, value, onChange, type = 'text', options = [],
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select';
  options?: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      {type === 'textarea' ? (
        <textarea
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm resize-none"
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      ) : type === 'select' ? (
        <select
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">Pumili ng {label}</option>
          {options.map(opt => (
            <option key={opt} value={opt}>
              {opt === 'Male' ? 'Lalaki' : opt === 'Female' ? 'Babae' : opt === 'Other' ? 'Iba pa' : opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
