import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Mail, Phone, MapPin, 
  ChevronRight, Edit2, CheckCircle2, 
  Download, Eye, Replace, Upload, Bell,
  Lock, Globe, Info, FileText, Settings,
  Save, X, Loader2, Trash2
} from 'lucide-react';
import { useAuth } from '../../App';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs, orderBy, deleteDoc } from 'firebase/firestore';
import DocumentViewerModal from '../../components/DocumentViewerModal';

interface SubmittedDocument {
  id: string;
  name: string;
  date: string;
  status: string;
  color: string;
  type: string;
  collectionName: string;
  rawDate: Date;
}

export default function Profile() {
  const { user, signIn } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<SubmittedDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<{ id: string, collection: string, autoDownload?: boolean } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    age: user?.age || '',
    gender: user?.gender || '',
    birthdate: user?.birthdate || '',
    contactNumber: user?.contactNumber || '',
    address: user?.address || '',
    avatarUrl: user?.avatarUrl || ''
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDeleteDoc = async (docId: string, collectionName: string) => {
    setDeletingId(docId);
    try {
      await deleteDoc(doc(db, collectionName, docId));
      setDocuments(prev => prev.filter(d => d.id !== docId));
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Nabigong burahin ang dokumento. Subukan muli.");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user?.uid) return;
      setLoadingDocs(true);
      try {
        const allDocs: SubmittedDocument[] = [];

        const q = query(
          collection(db, 'applications'), 
          where('userId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((documentSnapshot) => {
          const data = documentSnapshot.data();
          const submittedAt = data.submittedAt?.toDate();
          allDocs.push({
            id: documentSnapshot.id,
            name: data.formTitle || 'Application',
            date: submittedAt ? submittedAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Kamakailan',
            status: data.status || 'pending',
            color: data.status === 'approved' ? 'emerald' : data.status === 'for_review' ? 'blue' : 'slate',
            type: data.formType || 'application',
            collectionName: 'applications',
            rawDate: submittedAt || new Date(0)
          });
        });

        setDocuments(allDocs.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime()));
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchDocuments();
  }, [user?.uid]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        setFormData(prev => ({ ...prev, avatarUrl: dataUrl }));
        
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { avatarUrl: dataUrl });
          signIn({ ...user, avatarUrl: dataUrl } as any);
        } catch (error) {
          console.error("Error updating avatar:", error);
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
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, formData);
      signIn({ ...user, ...formData } as any);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
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
      avatarUrl: user?.avatarUrl || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header Section */}
      <div className="relative">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Aking Profile</h2>
          <p className="text-slate-500 font-medium">Pamahalaan ang iyong personal na impormasyon, account, password, at mga file.</p>
        </div>
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <img src="https://cdni.iconscout.com/illustration/premium/thumb/business-profile-illustration-download-in-svg-png-gif-formats--user-man-accounts-data-management-pack-illustrations-5348881.png" alt="Profile Visual" className="w-48 h-auto" />
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 flex flex-col md:flex-row items-center gap-10">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-100 border-4 border-white shadow-lg">
            <img 
              src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=2563FF&color=fff&size=200`} 
              alt="Avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          <label className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <Edit2 className="w-4 h-4" />
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload} 
            />
          </label>
        </div>

        <div className="flex-grow space-y-4 text-center md:text-left">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{user?.name}</h3>
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
              <span className="px-3 py-1 bg-blue-100/50 text-blue-600 rounded-full text-[10px] font-black tracking-widest uppercase">
                {user?.role === 'admin' ? 'Access ng Admin' : user?.role === 'staff' ? 'Access ng Staff' : 'Access ng Miyembro'}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Aktibong {user?.role === 'member' ? 'Miyembro' : user?.role}
              </span>
            </div>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">
            Miyembro mula noong {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'May 8, 2024'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Personal & Account Information */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
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
                  className="p-3 hover:bg-red-50 rounded-xl text-red-600 transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
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
                  onChange={(val) => setFormData({...formData, name: val})} 
                />
                <EditField 
                  label="Email Address" 
                  value={formData.email} 
                  type="email"
                  onChange={(val) => setFormData({...formData, email: val})} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditField 
                    label="Araw ng Kapanganakan" 
                    value={formData.birthdate} 
                    type="date"
                    onChange={(val) => setFormData({...formData, birthdate: val})} 
                  />
                  <EditField 
                    label="Edad" 
                    value={formData.age} 
                    type="number"
                    onChange={(val) => setFormData({...formData, age: val})} 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <EditField 
                    label="Kasarian" 
                    value={formData.gender} 
                    type="select"
                    options={['Male', 'Female', 'Other']}
                    onChange={(val) => setFormData({...formData, gender: val})} 
                  />
                  <EditField 
                    label="Numero ng Telepono" 
                    value={formData.contactNumber} 
                    onChange={(val) => setFormData({...formData, contactNumber: val})} 
                  />
                </div>
                <EditField 
                  label="Kumpletong Address" 
                  value={formData.address} 
                  type="textarea"
                  onChange={(val) => setFormData({...formData, address: val})} 
                />
              </div>
            ) : (
              <>
                <InfoField label="Buong Pangalan" value={user?.name || ''} />
                <InfoField label="Account ID" value={`AKP-2024-${user?.uid?.slice(0,6).toUpperCase()}`} />
                <InfoField label="Email Address" value={user?.email || ''} />
                <InfoField label="Araw ng Kapanganakan" value={user?.birthdate ? new Date(user.birthdate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Hindi ibinigay'} />
                <div className="grid grid-cols-2 gap-4">
                  <InfoField label="Edad" value={user?.age || 'N/A'} />
                  <InfoField label="Kasarian" value={user?.gender === 'Male' ? 'Lalaki' : user?.gender === 'Female' ? 'Babae' : user?.gender === 'Other' ? 'Iba pa' : 'N/A'} />
                </div>
                <InfoField label="Numero ng Telepono" value={user?.contactNumber || 'Hindi ibinigay'} />
                <InfoField label="Kumpletong Address" value={user?.address || 'Hindi ibinigay'} />
              </>
            )}
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-100 shadow-lg shadow-slate-200/40 overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">Mga Na-upload na Dokumento</h4>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Pangalan ng Dokumento</th>
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Na-upload Noong</th>
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Mga Aksyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingDocs ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nilo-load ang mga dokumento...</span>
                      </div>
                    </td>
                  </tr>
                ) : documents.length > 0 ? (
                  documents.map((doc) => (
                    <DocumentRow 
                      key={doc.id} 
                      name={doc.name} 
                      date={doc.date} 
                      status={doc.status} 
                      color={doc.color} 
                      onView={() => {
                        setSelectedDoc({ id: doc.id, collection: doc.collectionName, autoDownload: false });
                        setIsModalOpen(true);
                      }}
                      onDownload={() => {
                        setSelectedDoc({ id: doc.id, collection: doc.collectionName, autoDownload: true });
                        setIsModalOpen(true);
                      }}
                      onDelete={() => handleDeleteDoc(doc.id, doc.collectionName)}
                      isDeleting={deletingId === doc.id}
                      isConfirming={confirmDeleteId === doc.id}
                      onConfirmDelete={() => setConfirmDeleteId(doc.id)}
                      onCancelDelete={() => setConfirmDeleteId(null)}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900">Walang nahanap na dokumento</p>
                          <p className="text-xs text-slate-400 font-medium">Dito makikita ang iyong mga isinumiteng form.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-8 py-4 bg-slate-50/30 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {documents.length === 0 ? 'Walang dokumentong ipapakita' : `Ipinapakita ang ${documents.length} sa ${documents.length} dokumento`}
            </span>
          </div>
        </div>


      </div>
      {/* Document Viewer Modal */}
      {selectedDoc && (
        <DocumentViewerModal 
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDoc(null);
          }}
          docId={selectedDoc.id}
          collectionName={selectedDoc.collection}
          autoDownload={selectedDoc.autoDownload}
        />
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-50 pb-4 gap-2">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">{label}</span>
      <span className="text-sm font-bold text-slate-900 text-right">{value}</span>
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text', options = [] }: { 
  label: string, 
  value: string, 
  onChange: (val: string) => void,
  type?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select',
  options?: string[]
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      {type === 'textarea' ? (
        <textarea 
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900 text-sm"
          value={value}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : type === 'select' ? (
        <select 
          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all font-bold text-slate-900"
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

interface DocumentRowProps {
  key?: string | number;
  name: string;
  date: string;
  status: string;
  color: string;
  onView?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  isConfirming?: boolean;
  onConfirmDelete?: () => void;
  onCancelDelete?: () => void;
}

function DocumentRow({ 
  name, date, status, color, onView, onDownload, 
  onDelete, isDeleting, isConfirming, onConfirmDelete, onCancelDelete 
}: DocumentRowProps) {
  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-red-100 text-red-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-slate-900">{name}</span>
        </div>
      </td>
      <td className="px-8 py-5 text-xs text-slate-500 font-bold uppercase tracking-widest">{date}</td>
      <td className="px-8 py-5">
        <span className={cn(
          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
          color === 'emerald' ? "bg-emerald-100 text-emerald-600" :
          color === 'blue' ? "bg-blue-100 text-blue-600" :
          "bg-slate-100 text-slate-600"
        )}>
          {status === 'Approved' ? 'Aprubado' : status === 'In Review' ? 'Sinusuri' : status === 'Submitted' ? 'Isinumite' : status}
        </span>
      </td>
      <td className="px-8 py-5">
        <div className="flex items-center justify-center gap-2">
          {isConfirming ? (
            <div className="flex items-center gap-1">
              <button 
                onClick={() => onDelete && onDelete()}
                disabled={isDeleting}
                className="px-2 py-1 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-1"
              >
                {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Kumpirmahin"}
              </button>
              <button 
                onClick={() => onCancelDelete && onCancelDelete()}
                disabled={isDeleting}
                className="p-1 bg-slate-100 text-slate-400 rounded-lg hover:bg-slate-200 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => onView && onView()}
                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all" 
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDownload && onDownload()}
                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all" 
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onConfirmDelete && onConfirmDelete()}
                className="p-2 hover:bg-red-50 text-red-300 hover:text-red-600 rounded-lg transition-all" 
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
