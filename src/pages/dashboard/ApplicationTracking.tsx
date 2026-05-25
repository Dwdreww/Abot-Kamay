import React, { useState, useEffect } from 'react';
import {
  Search, Loader2, Clock, CheckCircle2,
  AlertCircle, FileX, Filter, Download,
  Eye, Trash2, X, Check, RotateCcw, MessageSquare, Info
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../App';
import { db } from '../../lib/firebase';
import {
  collection, query, where, onSnapshot, orderBy,
  deleteDoc, doc, updateDoc, addDoc, serverTimestamp
} from 'firebase/firestore';
import DocumentViewerModal from '../../components/DocumentViewerModal';

interface AppRecord {
  id: string;
  refNo: string;
  applicantName: string;
  userId: string;
  applicantEmail: string;
  type: string;
  formType: string;
  date: string;
  status: string;
  remarks: string;
  rawDate: Date;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending: 'Nakabinbin',
  for_review: 'Sinusuri',
  approved: 'Inaprubahan',
  returned: 'Ibinabalik',
  rejected: 'Tinanggihan',
  completed: 'Nakumpleto',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-500',
  pending: 'bg-blue-50 text-blue-600',
  for_review: 'bg-yellow-50 text-yellow-600',
  approved: 'bg-emerald-50 text-emerald-600',
  returned: 'bg-purple-50 text-purple-600',
  rejected: 'bg-red-50 text-red-600',
  completed: 'bg-emerald-100 text-emerald-700',
};

// Notification helper
async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'success' | 'warning' | 'error'
) {
  await addDoc(collection(db, 'notifications'), {
    userId,
    title,
    message,
    type,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

// Review modal for admins
function ReviewModal({
  app,
  onClose,
  onDone,
  reviewerName,
}: {
  app: AppRecord;
  onClose: () => void;
  onDone: () => void;
  reviewerName: string;
}) {
  const [action, setAction] = useState<'approved' | 'returned' | 'rejected' | 'for_review' | ''>('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!action) { setError('Pumili ng aksyon.'); return; }
    if ((action === 'returned' || action === 'rejected') && !remarks.trim()) {
      setError('Kailangan ng dahilan kapag ibinabalik o tinatanggihan.'); return;
    }
    setSaving(true);
    setError('');
    try {
      await updateDoc(doc(db, 'applications', app.id), {
        status: action,
        remarks: remarks.trim(),
        reviewedBy: reviewerName,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send notification to applicant
      const notifMap: Record<string, { title: string; message: string; type: 'success' | 'warning' | 'error' | 'info' }> = {
        approved: {
          title: '✅ Aplikasyon Inaprubahan!',
          message: `Ang iyong aplikasyon na "${app.type}" (Ref: ${app.refNo}) ay inaprubahan na. Makipag-ugnayan sa barangay para sa susunod na hakbang.`,
          type: 'success',
        },
        returned: {
          title: '🔁 Aplikasyon Ibinabalik',
          message: `Ang iyong aplikasyon na "${app.type}" (Ref: ${app.refNo}) ay ibinabalik para sa paglilinaw. Dahilan: ${remarks.trim()}`,
          type: 'warning',
        },
        rejected: {
          title: '❌ Aplikasyon Tinanggihan',
          message: `Ang iyong aplikasyon na "${app.type}" (Ref: ${app.refNo}) ay tinanggihan. Dahilan: ${remarks.trim()}`,
          type: 'error',
        },
        for_review: {
          title: '🔍 Aplikasyon Sinusuri',
          message: `Ang iyong aplikasyon na "${app.type}" (Ref: ${app.refNo}) ay kasalukuyang sinusuri ng aming kawani.`,
          type: 'info',
        },
      };

      const notif = notifMap[action];
      if (notif) {
        await sendNotification(app.userId, notif.title, notif.message, notif.type);
      }

      // Audit log
      await addDoc(collection(db, 'audit_logs'), {
        action: `Application ${action}: ${app.refNo}`,
        reviewedBy: reviewerName,
        applicationId: app.id,
        timestamp: serverTimestamp(),
      });

      onDone();
      onClose();
    } catch (e: any) {
      setError('Hindi ma-save ang desisyon: ' + (e.message || 'Subukan ulit.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Suriin ang Aplikasyon</h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">{app.refNo} · {app.applicantName}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Uri ng Aplikasyon</p>
            <p className="text-sm font-bold text-slate-700">{app.type}</p>
          </div>

          {/* Action Buttons */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Aksyon</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { val: 'for_review', label: '🔍 Para sa Pagsusuri', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
                { val: 'approved', label: '✅ Aprubahan', color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
                { val: 'returned', label: '🔁 Ibalik', color: 'border-purple-300 bg-purple-50 text-purple-700' },
                { val: 'rejected', label: '❌ Tanggihan', color: 'border-red-300 bg-red-50 text-red-700' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setAction(opt.val as any)}
                  className={cn(
                    'px-4 py-3 rounded-2xl border-2 text-xs font-black uppercase tracking-wider transition-all',
                    action === opt.val ? opt.color + ' scale-105 shadow-md' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Mga Komento / Dahilan {(action === 'returned' || action === 'rejected') && <span className="text-red-500">*</span>}
            </p>
            <textarea
              rows={3}
              className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-200 resize-none"
              placeholder="Ilagay ang iyong mga komento o dahilan..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>

          {error && <p className="text-xs font-bold text-red-500">{error}</p>}
        </div>

        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50">
          <button onClick={onClose} className="px-6 py-3 rounded-2xl text-xs font-black text-slate-500 hover:bg-slate-200 transition-colors uppercase tracking-widest">
            Kanselahin
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !action}
            className="px-8 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            I-save ang Desisyon
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationTracking({ initialFilter }: { initialFilter?: string }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'staff';

  const [activeTab, setActiveTab] = useState(initialFilter ?? 'Lahat');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setActiveTab(initialFilter ?? 'Lahat');
  }, [initialFilter]);
  const [loading, setLoading] = useState(true);
  const [allApplications, setAllApplications] = useState<AppRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<{ id: string; collection: string; autoDownload?: boolean } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewApp, setReviewApp] = useState<AppRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const tabs = isAdmin
    ? ['Lahat', 'Nakabinbin', 'Para sa Paglilinaw', 'Inaprubahan', 'Ibinalik', 'Tinanggihan']
    : ['Lahat', 'Nakabinbin', 'Inaprubahan', 'Ibinalik'];

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);

    let q;
    if (isAdmin) {
      q = query(collection(db, 'applications'), orderBy('submittedAt', 'desc'));
    } else {
      q = query(
        collection(db, 'applications'),
        where('userId', '==', user.uid),
        orderBy('submittedAt', 'desc')
      );
    }

    const unsub = onSnapshot(q, (snapshot) => {
      const results: AppRecord[] = [];
      snapshot.forEach(d => {
        const data = d.data();
        const submittedAt = data.submittedAt?.toDate();
        results.push({
          id: d.id,
          refNo: data.referenceNumber || 'N/A',
          applicantName: data.applicantName || 'Anonymous',
          userId: data.userId,
          applicantEmail: data.applicantEmail || '',
          type: data.formTitle || data.formType || 'Application',
          formType: data.formType || '',
          date: submittedAt ? submittedAt.toLocaleDateString('fil-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—',
          status: data.status || 'pending',
          remarks: data.remarks || '',
          rawDate: submittedAt || new Date(0),
        });
      });
      setAllApplications(results);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching applications:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [user?.uid, isAdmin]);

  const handleDelete = async (appId: string) => {
    setDeletingId(appId);
    try {
      await deleteDoc(doc(db, 'applications', appId));
      setConfirmDeleteId(null);
    } catch (e) {
      alert('Nabigong burahin ang aplikasyon.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredApplications = allApplications.filter(app => {
    const matchesSearch =
      app.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase());
    if (activeTab === 'Lahat') return matchesSearch;
    if (activeTab === 'Nakabinbin') return matchesSearch && (app.status === 'pending' || app.status === 'draft');
    if (activeTab === 'Para sa Paglilinaw') return matchesSearch && app.status === 'for_review';
    if (activeTab === 'Inaprubahan') return matchesSearch && (app.status === 'approved' || app.status === 'completed');
    if (activeTab === 'Ibinalik') return matchesSearch && app.status === 'returned';
    if (activeTab === 'Tinanggihan') return matchesSearch && app.status === 'rejected';
    return matchesSearch;
  });

  const stats = [
    { label: 'Nakabinbin', count: allApplications.filter(a => a.status === 'pending' || a.status === 'draft').length, icon: Clock, color: 'blue' },
    { label: 'Inaprubahan', count: allApplications.filter(a => a.status === 'approved' || a.status === 'completed').length, icon: CheckCircle2, color: 'emerald' },
    { label: 'Para sa Paglilinaw', count: allApplications.filter(a => a.status === 'returned').length, icon: AlertCircle, color: 'purple' },
    { label: 'Tinanggihan', count: allApplications.filter(a => a.status === 'rejected').length, icon: FileX, color: 'red' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
            {isAdmin ? 'Mga Rekord ng Aplikasyon' : 'Aking mga Aplikasyon'}
          </h2>
          <p className="text-slate-500 font-medium">
            {isAdmin ? 'Suriin, aprubahan, o tanggihan ang mga aplikasyon ng mga miyembro.' : 'Subaybayan ang katayuan ng iyong mga aplikasyon.'}
          </p>
        </div>
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Maghanap gamit ang Ticket # o Pangalan..."
            className="pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-[20px] outline-none text-xs font-bold w-full md:w-80 shadow-xl shadow-slate-200/20 focus:ring-4 focus:ring-blue-50 transition-all"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/10 flex items-center gap-5 hover:-translate-y-1 transition-all group">
              <div className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110',
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                stat.color === 'orange' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900">{stat.count}</h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-200/10 overflow-hidden">
        {/* Tabs */}
        <div className="px-4 py-4 md:px-10 md:py-8 border-b border-slate-50 flex flex-wrap items-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#fcfdff]">
              <tr>
                <th className="px-4 py-3 md:px-10 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aplikante</th>
                <th className="hidden md:table-cell px-4 py-3 md:px-10 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket / Ref #</th>
                <th className="hidden lg:table-cell px-4 py-3 md:px-10 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uri ng Aplikasyon</th>
                <th className="hidden lg:table-cell px-4 py-3 md:px-10 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Petsa</th>
                <th className="px-4 py-3 md:px-10 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Katayuan</th>
                <th className="px-4 py-3 md:px-10 md:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kinukuha ang mga aplikasyon...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 md:px-10 md:py-20 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Walang nahanap na aplikasyon</p>
                  </td>
                </tr>
              ) : (
                filteredApplications.map(app => (
                  <tr key={app.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 md:px-10 md:py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500 uppercase shrink-0">
                          {app.applicantName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-900 uppercase tracking-tight leading-none">{app.applicantName}</p>
                          {isAdmin && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{app.applicantEmail}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 md:px-10 md:py-6 text-[11px] font-black font-mono text-slate-400 uppercase">{app.refNo}</td>
                    <td className="hidden lg:table-cell px-4 py-3 md:px-10 md:py-6 text-[11px] font-bold text-slate-500 uppercase tracking-tight max-w-[200px]">{app.type}</td>
                    <td className="hidden lg:table-cell px-4 py-3 md:px-10 md:py-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{app.date}</td>
                    <td className="px-4 py-3 md:px-10 md:py-6 text-center">
                      <span className={cn('px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest', STATUS_COLORS[app.status] || 'bg-slate-100 text-slate-500')}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                      {app.remarks && (
                        <p className="text-[9px] text-slate-400 mt-1 max-w-[120px] mx-auto truncate" title={app.remarks}>{app.remarks}</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        {/* View */}
                        <button
                          onClick={() => { setSelectedDoc({ id: app.id, collection: 'applications' }); setIsModalOpen(true); }}
                          className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all min-h-[38px]"
                        >
                          <Eye className="w-3.5 h-3.5 shrink-0" />
                          <span>Tingnan</span>
                        </button>

                        {/* Admin Review Button */}
                        {isAdmin && (
                          <button
                            onClick={() => setReviewApp(app)}
                            className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all min-h-[38px]"
                          >
                            <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                            <span>Suriin</span>
                          </button>
                        )}

                        {/* Delete */}
                        {confirmDeleteId === app.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-200">
                            <button
                              onClick={() => handleDelete(app.id)}
                              disabled={deletingId === app.id}
                              className="flex items-center gap-1.5 px-3 py-2.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-700 transition-all min-h-[38px] disabled:opacity-60"
                            >
                              {deletingId === app.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <><Check className="w-3.5 h-3.5 shrink-0" /><span>Oo, Burahin</span></>}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-200 transition-all min-h-[38px]"
                            >
                              <X className="w-3.5 h-3.5 shrink-0" />
                              <span>Hindi</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(app.id)}
                            className="flex items-center gap-1.5 px-3 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-600 hover:text-white hover:border-red-600 transition-all min-h-[38px]"
                          >
                            <Trash2 className="w-3.5 h-3.5 shrink-0" />
                            <span>Burahin</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 md:px-10 md:py-5 border-t border-slate-50 bg-[#fcfdff] flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            {filteredApplications.length} na rekord
          </p>
        </div>
      </div>

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <DocumentViewerModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedDoc(null); }}
          docId={selectedDoc.id}
          collectionName={selectedDoc.collection}
          autoDownload={selectedDoc.autoDownload}
        />
      )}

      {/* Admin Review Modal */}
      {reviewApp && (
        <ReviewModal
          app={reviewApp}
          onClose={() => setReviewApp(null)}
          onDone={() => setReviewApp(null)}
          reviewerName={user?.name || 'Admin'}
        />
      )}
    </div>
  );
}
