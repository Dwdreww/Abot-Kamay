import React, { useEffect, useRef, useState } from 'react';
import { X, FileText, Download, Printer, Loader2, AlertCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  docId: string;
  collectionName: string;
  autoDownload?: boolean;
  previewData?: any;
}

/* ─── small helper: one field row ─────────────────────────── */
function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-end gap-2 py-1">
      <span className="font-bold text-[11px] min-w-[170px] text-neutral-700 uppercase tracking-wide shrink-0">{label}:</span>
      <span className="flex-1 border-b border-neutral-800 text-[12px] font-medium pb-0.5 text-neutral-900">{value || '—'}</span>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded mt-5 mb-3">
      {children}
    </div>
  );
}

/* ─── Form renderers per formType ─────────────────────────── */
function BurialAssistancePreview({ data }: { data: any }) {
  const fd = data.formData || {};
  return (
    <>
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3">
          <img src="/Dasma_logo.png" alt="Dasma" className="w-14 h-14 object-contain" onError={e=>(e.currentTarget.style.display='none')} />
          <img src="/DSWD_Logo.png"  alt="DSWD"  className="w-16 h-16 object-contain" onError={e=>(e.currentTarget.style.display='none')} />
        </div>
        <div className="text-right text-[10px] font-bold text-neutral-700 leading-snug">
          <p>Persons with Disability Affairs Office (PDAO)</p>
          <p>City Social Welfare Development Office</p>
          <p>City of Dasmariñas</p>
        </div>
      </div>
      <div className="text-center mb-8">
        <h2 className="text-lg font-black text-neutral-900 tracking-wide">PWD BURIAL ASSISTANCE</h2>
        <h2 className="text-lg font-black text-neutral-900 tracking-wide">APPLICATION FORM</h2>
        <p className="text-[10px] font-mono mt-2 text-neutral-400">Ref No: {data.referenceNumber}</p>
      </div>
      <div className="space-y-1">
        <Field label="Name of Deceased"  value={fd.deceasedName} />
        <Field label="PWD ID Number"     value={fd.pwdId} />
        <Field label="Name of Claimant"  value={data.applicantName} />
        <Field label="Contact No."       value={data.contactNumber} />
        <Field label="Relationship"      value={fd.relationship} />
        <Field label="Address"           value={data.address} />
        <Field label="Funeral Service"   value={fd.funeralService} />
      </div>
      <SignatureBlock submittedAt={data.submittedAt} />
    </>
  );
}

function DOHPRPWDPreview({ data }: { data: any }) {
  // Support both: data from Firestore (has formData wrapper) and direct previewData (flat)
  const fd = data.formData || data;
  const addr = fd.address || {};
  const contact = fd.contact || {};
  const idRef = fd.idReference || fd.idRef || {};
  const family = fd.family || {};
  const refNo = data.referenceNumber || fd.pwdNumber || 'N/A';
  const dateApplied = fd.dateApplied || new Date().toISOString().split('T')[0];
  const appType = fd.appType || 'New Applicant';
  const isNew = appType === 'New Applicant';

  const CB = ({ checked }: { checked: boolean }) => (
    <span style={{ display: 'inline-block', width: 12, height: 12, border: '1.5px solid #333', marginRight: 4, textAlign: 'center', lineHeight: '10px', fontSize: 10, verticalAlign: 'middle', flexShrink: 0 }}>
      {checked ? '✓' : ''}
    </span>
  );

  const disabilityTypes = [
    'Deaf/Hard of Hearing', 'Intellectual Disability', 'Learning Disability',
    'Mental Disability', 'Orthopedic Disability', 'Physical Disability',
    'Psychosocial Disability', 'Speech and Language Impairment',
    'Visual Disability', 'Cancer (RA4121S)', 'Rare Disease (RA12074)'
  ];
  const selectedDisabilities: string[] = Array.isArray(fd.disabilityTypes) ? fd.disabilityTypes : [];

  const occupations = [
    'Managers', 'Professionals', 'Technicians and Associate Professional',
    'Clerical support workers', 'Service and sales workers',
    'Skilled agricultural, forestry and fishery workers',
    'Craft and related trade workers',
    'Plant and machine operators and assets',
    'Elementary occupations', 'Armed forces occupations', 'Other'
  ];

  const Row = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid #333', ...style }}>{children}</div>
  );
  const Cell = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div style={{ padding: '3px 5px', fontSize: 10, borderRight: '1px solid #333', ...style }}>{children}</div>
  );
  const Label = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 9, fontWeight: 700, color: '#333', marginBottom: 2 }}>{children}</div>
  );
  const Val = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize: 11, borderBottom: '1px solid #555', minHeight: 16, paddingBottom: 1 }}>{children || ''}</div>
  );

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, color: '#000', border: '1px solid #333', padding: 0 }}>
      {/* Clean Unboxed Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', position: 'relative' }}>
        <img src="/doh_logo.png" alt="DOH Logo" style={{ width: 50, height: 50, objectFit: 'contain' }} onError={e => (e.currentTarget.style.display = 'none')} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#111' }}>DEPARTMENT OF HEALTH</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#222', marginTop: 1 }}>PHILIPPINE REGISTRY FOR PERSONS WITH DISABILITY VERSION 4.0</div>
          <div style={{ fontSize: 9, fontStyle: 'italic', color: '#444', marginTop: 1 }}>Application Form</div>
        </div>
        <div style={{ fontSize: 9, fontWeight: 'bold', color: '#333', alignSelf: 'flex-start', paddingTop: 2 }}>
          Annex A
        </div>
      </div>

      {/* Grid Block 1: Rows 1-3 with Photo Column on the Right */}
      <div style={{ display: 'flex', borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
        {/* Left Side: Rows 1-3 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Row 1: App Type */}
          <div style={{ display: 'flex', borderBottom: '1px solid #333', minHeight: 26, alignItems: 'center', padding: '2px 6px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 16, fontWeight: 700 }}><CB checked={isNew} /> NEW APPLICANT</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}><CB checked={!isNew} /> RENEWAL</span>
          </div>

          {/* Row 2: PWD Number & Date Applied */}
          <div style={{ display: 'flex', borderBottom: '1px solid #333', minHeight: 32 }}>
            <div style={{ flex: 1.2, padding: '3px 6px', borderRight: '1px solid #333' }}>
              <Label>1. PWD NUMBER (RR-PPMM-BBB-NNNNNNN):</Label>
              <Val>{fd.pwdNumber || refNo}</Val>
            </div>
            <div style={{ flex: 0.8, padding: '3px 6px' }}>
              <Label>2. DATE APPLIED:*</Label>
              <Val>{dateApplied}</Val>
            </div>
          </div>

          {/* Row 3: Full Name */}
          <div style={{ display: 'flex', minHeight: 32 }}>
            <div style={{ flex: 3, padding: '3px 6px', borderRight: '1px solid #333' }}><Label>3. LAST NAME:*</Label><Val>{fd.lastName}</Val></div>
            <div style={{ flex: 3, padding: '3px 6px', borderRight: '1px solid #333' }}><Label>FIRST NAME:*</Label><Val>{fd.firstName}</Val></div>
            <div style={{ flex: 3, padding: '3px 6px', borderRight: '1px solid #333' }}><Label>MIDDLE NAME:*</Label><Val>{fd.middleName}</Val></div>
            <div style={{ flex: 1, padding: '3px 6px' }}><Label>SUFFIX:</Label><Val>{fd.suffix}</Val></div>
          </div>
        </div>

        {/* Right Side: Solid Photo Box Column spanning all 3 rows */}
        <div style={{ width: 110, borderLeft: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 6, background: '#fdfdfd' }}>
          <div style={{ border: '1px solid #333', width: '100%', height: '100%', minHeight: 85, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 9, fontWeight: 'bold', color: '#333', lineHeight: 1.3 }}>
            Place 2x2<br />Photo
          </div>
        </div>
      </div>

      {/* Row 4+5: Disability + Cause */}
      <Row style={{ alignItems: 'stretch' }}>
        <Cell style={{ flex: 1, borderRight: '1px solid #333' }}>
          <Label>4. TYPE OF DISABILITY: (Check all that apply)*</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px 4px', marginTop: 2 }}>
            {disabilityTypes.map(d => (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9 }}>
                <CB checked={selectedDisabilities.includes(d)} />{d}
              </div>
            ))}
          </div>
        </Cell>
        <Cell style={{ flex: 1 }}>
          <Label>5. CAUSE OF DISABILITY:*</Label>
          {[['Congenital/Inborn', 'Acquired'], ['Autism', 'Chronic'], ['ADHD', 'Cerebral Injury'], ['Cerebral Palsy', ''], ['Down Syndrome', '']].map(([a, b]) => (
            <div key={a} style={{ display: 'flex', gap: 8, fontSize: 9, marginTop: 2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><CB checked={fd.disabilityCause === a} />{a}</span>
              {b && <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}><CB checked={fd.disabilityCause === b} />{b}</span>}
            </div>
          ))}
        </Cell>
      </Row>

      {/* Row 6: Address */}
      <Row>
        <Cell style={{ flex: 1 }}>
          <Label>6. ADDRESS:* HOUSE NO. AND STREET NAME:*</Label>
          <Val>{addr.houseNo ? `${addr.houseNo}` : '—'}</Val>
        </Cell>
        <Cell style={{ flex: 1 }}>
          <Label>BARANGAY:*</Label>
          <Val>{addr.barangay}</Val>
        </Cell>
      </Row>
      <Row>
        <Cell style={{ flex: 1 }}><Label>CITY/MUNICIPALITY:*</Label><Val>{addr.city || 'Dasmariñas'}</Val></Cell>
        <Cell style={{ flex: 1 }}><Label>PROVINCE:*</Label><Val>{addr.province || 'Cavite'}</Val></Cell>
        <Cell style={{ flex: 1 }}><Label>REGION:</Label><Val>{addr.region || 'Region IV-A'}</Val></Cell>
      </Row>

      {/* Row 7: Contact */}
      <Row>
        <Cell style={{ flex: 1 }}><Label>7. CONTACT DETAILS — LANDLINE:</Label><Val>{contact.landline}</Val></Cell>
        <Cell style={{ flex: 1 }}><Label>MOBILE NO.:</Label><Val>{contact.mobile}</Val></Cell>
        <Cell style={{ flex: 2 }}><Label>EMAIL ADDRESS:</Label><Val>{contact.email}</Val></Cell>
      </Row>

      {/* Row 8-10: DOB, Sex, Civil Status */}
      <Row>
        <Cell style={{ flex: 1 }}><Label>8. DATE OF BIRTH (mm/dd/yyyy):*</Label><Val>{fd.dob}</Val></Cell>
        <Cell style={{ flex: 1 }}>
          <Label>9. SEX*</Label>
          <div style={{ display: 'flex', gap: 10, marginTop: 2, fontSize: 10 }}>
            <span><CB checked={fd.sex === 'Male'} />Male</span>
            <span><CB checked={fd.sex === 'Female'} />Female</span>
          </div>
        </Cell>
        <Cell style={{ flex: 2 }}>
          <Label>10. CIVIL STATUS</Label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2, fontSize: 9 }}>
            {['Single','Separated','Cohabitation','Married','Widow/er'].map(s => (
              <span key={s}><CB checked={fd.civilStatus === s} />{s}</span>
            ))}
          </div>
        </Cell>
      </Row>

      {/* Row 11-13: Education, Employment, Occupation */}
      <Row style={{ alignItems: 'stretch' }}>
        <Cell style={{ flex: 1 }}>
          <Label>11. EDUCATIONAL ATTAINMENT*</Label>
          {['None','Kindergarten','Elementary','Junior High School','Senior High School','College','Vocational','Post Graduate'].map(e => (
            <div key={e} style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 2 }}><CB checked={fd.educationalAttainment === e} />{e}</div>
          ))}
        </Cell>
        <Cell style={{ flex: 1 }}>
          <Label>12. EMPLOYMENT STATUS*</Label>
          {['Employed','Unemployed','Self-employed'].map(e => (
            <div key={e} style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 2 }}><CB checked={fd.employmentStatus === e} />{e}</div>
          ))}
          <Label style={{ marginTop: 4 }}>12.1 CATEGORY OF EMPLOYMENT:</Label>
          {['Government','Private'].map(e => (
            <div key={e} style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 2 }}><CB checked={fd.categoryOfEmployment === e} />{e}</div>
          ))}
          <Label style={{ marginTop: 4 }}>12.2 NATURE OF EMPLOYMENT*</Label>
          {['Permanent/Regular','Casual','Seasonal','Emergency'].map(e => (
            <div key={e} style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 2 }}><CB checked={fd.natureOfEmployment === e} />{e}</div>
          ))}
        </Cell>
        <Cell style={{ flex: 2 }}>
          <Label>13. OCCUPATION*</Label>
          {occupations.map(o => (
            <div key={o} style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 2 }}><CB checked={fd.occupation === o} />{o}</div>
          ))}
        </Cell>
      </Row>

      {/* Row 14-16: Blood, Org, ID Reference */}
      <Row style={{ alignItems: 'stretch' }}>
        <Cell style={{ flex: 1 }}>
          <Label>14. BLOOD TYPE:</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, marginTop: 2 }}>
            {['A+','A-','A3+','A3-','B+','B-','O+','O-'].map(b => (
              <div key={b} style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 2 }}><CB checked={fd.bloodType === b} />{b}</div>
            ))}
          </div>
        </Cell>
        <Cell style={{ flex: 2 }}>
          <Label>15. ORGANIZATION AFFILIATED</Label>
          <Val>{fd.organizationAffiliated}</Val>
          <Label style={{ marginTop: 4 }}>Contact Person:</Label><Val></Val>
          <Label style={{ marginTop: 4 }}>Office Address:</Label><Val></Val>
          <Label style={{ marginTop: 4 }}>Tel. Nos.:</Label><Val></Val>
        </Cell>
        <Cell style={{ flex: 1.5 }}>
          <Label>16. ID REFERENCE NO.</Label>
          <Label>SSS NO.:</Label><Val>{idRef.sss}</Val>
          <Label>GSIS NO.:</Label><Val>{idRef.gsis}</Val>
          <Label>PSN NO.:</Label><Val>{idRef.psn}</Val>
          <Label>PHILHEALTH NO.:</Label><Val>{idRef.philhealth}</Val>
          <div style={{ marginTop: 4, fontSize: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}><CB checked={fd.philhealthStatus === 'Member'} />Philhealth Member</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}><CB checked={fd.philhealthStatus === 'Dependent'} />Philhealth Member-Dependent</div>
          </div>
        </Cell>
      </Row>

      {/* Row 17: Family Background */}
      <Row>
        <Cell style={{ flex: 1 }}><Label>17. FAMILY BACKGROUND</Label></Cell>
        <Cell style={{ flex: 2 }}><Label>LAST NAME</Label></Cell>
        <Cell style={{ flex: 2 }}><Label>FIRST NAME</Label></Cell>
        <Cell style={{ flex: 2 }}><Label>MIDDLE NAME</Label></Cell>
      </Row>
      <Row>
        <Cell style={{ flex: 1 }}><div style={{ fontSize: 9, fontWeight: 700 }}>FATHER'S NAME:</div></Cell>
        <Cell style={{ flex: 2 }}><Val>{family.father?.lastName}</Val></Cell>
        <Cell style={{ flex: 2 }}><Val>{family.father?.firstName}</Val></Cell>
        <Cell style={{ flex: 2 }}><Val>{family.father?.middleName}</Val></Cell>
      </Row>
      <Row>
        <Cell style={{ flex: 1 }}><div style={{ fontSize: 9, fontWeight: 700 }}>MOTHER'S NAME:</div></Cell>
        <Cell style={{ flex: 2 }}><Val>{family.mother?.lastName}</Val></Cell>
        <Cell style={{ flex: 2 }}><Val>{family.mother?.firstName}</Val></Cell>
        <Cell style={{ flex: 2 }}><Val>{family.mother?.middleName}</Val></Cell>
      </Row>

      {/* Rows 18-23: Official Use */}
      <Row>
        <Cell style={{ flex: 1 }}>
          <Label>18. ACCOMPLISHED BY:*</Label>
          <div style={{ display: 'flex', gap: 12, marginTop: 2, fontSize: 9 }}>
            <span><CB checked />Applicant</span>
            <span><CB checked={false} />Guardian</span>
            <span><CB checked={false} />Representative</span>
          </div>
        </Cell>
      </Row>
      <Row><Cell style={{ flex: 1 }}><Label>19. Name of Certifying Physician:</Label><Val></Val></Cell></Row>
      <Row>
        <Cell style={{ flex: 2 }}><Label>20. NAME OF REPORTING UNIT:*</Label><Val></Val></Cell>
        <Cell style={{ flex: 1 }}><Label>License No.:</Label><Val></Val></Cell>
      </Row>
      <Row><Cell style={{ flex: 1 }}><Label>21. Control No.:</Label><Val></Val></Cell></Row>
      <Row><Cell style={{ flex: 1 }}><Label>22. Processing Officer:*</Label><Val></Val></Cell></Row>
      <Row><Cell style={{ flex: 1 }}><Label>23. Approving Officer:*</Label><Val></Val></Cell></Row>
      <Row><Cell style={{ flex: 1 }}><Label>24. Encoder*</Label><Val></Val></Cell></Row>
    </div>
  );
}

function BrgyCertPreview({ data }: { data: any }) {
  const fd = data.formData || {};
  return (
    <>
      <div className="text-center mb-8">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Republic of the Philippines</p>
        <p className="text-[10px] font-bold text-neutral-500">Province of Cavite</p>
        <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wide mt-2">Barangay San Antonio de Padua 1</h2>
        <p className="text-[10px] font-bold text-neutral-500">City of Dasmariñas, Cavite</p>
      </div>
      <div className="text-center mb-6">
        <div className="inline-block bg-neutral-900 text-white text-sm font-black uppercase tracking-widest px-8 py-2.5 rounded-xl">
          Sertipiko ng Burial Assistance
        </div>
        <p className="text-[10px] font-mono mt-2 text-neutral-400">Ref No: {data.referenceNumber}</p>
      </div>
      <div className="space-y-1">
        <Field label="Pangalan ng Claimant" value={data.applicantName} />
        <Field label="Tirahan"              value={data.address} />
        <Field label="Pangalan ng Pumanaw"  value={fd.deceasedName} />
        <Field label="Petsa ng Kamatayan"   value={fd.dateOfDeath} />
        <Field label="Relasyon"             value={fd.relationship} />
        <Field label="Halaga"               value={fd.amount} />
      </div>
      <SignatureBlock submittedAt={data.submittedAt} />
    </>
  );
}

function CancellationPreview({ data }: { data: any }) {
  const fd = data.formData || {};
  return (
    <>
      <div className="text-center mb-8">
        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Republic of the Philippines</p>
        <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wide mt-2">Certificate of Cancellation</h2>
        <h3 className="text-[12px] font-bold text-neutral-600">PWD Membership Cancellation Form</h3>
        <p className="text-[10px] font-mono mt-2 text-neutral-400">Ref No: {data.referenceNumber}</p>
      </div>
      <SectionTitle>Impormasyon ng Miyembro</SectionTitle>
      <div className="space-y-1">
        <Field label="Buong Pangalan"  value={data.applicantName} />
        <Field label="Address"         value={data.address} />
        <Field label="Contact No."     value={data.contactNumber} />
        <Field label="Email"           value={data.applicantEmail} />
        <Field label="Dahilan"         value={fd.reason} />
      </div>
      <SignatureBlock submittedAt={data.submittedAt} />
    </>
  );
}

function SignatureBlock({ submittedAt }: { submittedAt?: any }) {
  const dateStr = submittedAt?.toDate
    ? submittedAt.toDate().toLocaleDateString('fil-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('fil-PH', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div className="mt-10 pt-6 border-t border-neutral-200">
      <div className="grid grid-cols-2 gap-10">
        <div>
          <div className="border-b border-neutral-800 h-8 mb-1" />
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Pirma ng Aplikante</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Petsa: {dateStr}</p>
        </div>
        <div>
          <div className="border-b border-neutral-800 h-8 mb-1" />
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Nakatanggap / Verified by</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">Barangay PWD Officer</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Modal ──────────────────────────────────────────── */
export default function DocumentViewerModal({
  isOpen, onClose, docId, collectionName, autoDownload, previewData
}: DocumentViewerModalProps) {
  const [appData, setAppData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError('');

    // If previewData is passed, use it directly — no Firestore fetch needed
    if (previewData) {
      setAppData(previewData);
      setLoading(false);
      return;
    }

    if (!docId) return;
    setLoading(true);
    setAppData(null);
    getDoc(doc(db, collectionName, docId))
      .then(snap => {
        if (snap.exists()) {
          setAppData({ id: snap.id, ...snap.data() });
        } else {
          setError('Hindi mahanap ang dokumento.');
        }
      })
      .catch(e => setError('Error: ' + e.message))
      .finally(() => setLoading(false));
  }, [isOpen, docId, collectionName, previewData]);

  // Auto-download once data is loaded if requested
  useEffect(() => {
    if (autoDownload && appData && !loading) {
      handleDownload();
    }
  }, [autoDownload, appData, loading]);

  const handleDownload = async () => {
    if (!printRef.current) return;
    setDownloading(true);
    try {
      // Short bond paper: 8.5" × 11" = 215.9 × 279.4 mm
      const PAGE_W_MM = 215.9;
      const PAGE_H_MM = 279.4;
      const MARGIN_MM = 14;
      const CONTENT_W_MM = PAGE_W_MM - MARGIN_MM * 2;
      const CONTENT_H_MM = PAGE_H_MM - MARGIN_MM * 2;

      // Capture the white paper div at high resolution
      const canvas = await html2canvas(printRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        removeContainer: true,
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [PAGE_W_MM, PAGE_H_MM],
        compress: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgW = CONTENT_W_MM;
      const imgH = (canvas.height / canvas.width) * imgW;

      if (imgH <= CONTENT_H_MM) {
        // Single page — fits perfectly
        pdf.addImage(imgData, 'JPEG', MARGIN_MM, MARGIN_MM, imgW, imgH);
      } else {
        // Multi-page: slice canvas row-by-row per page
        const pxPerMm = canvas.width / imgW;
        const pageHeightPx = CONTENT_H_MM * pxPerMm;
        let offsetPx = 0;
        let firstPage = true;

        while (offsetPx < canvas.height) {
          const sliceH = Math.min(pageHeightPx, canvas.height - offsetPx);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = Math.ceil(sliceH);
          const ctx = pageCanvas.getContext('2d')!;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, -offsetPx);
          const sliceImg = pageCanvas.toDataURL('image/jpeg', 0.95);
          const sliceHMm = (sliceH / pxPerMm);
          if (!firstPage) pdf.addPage([PAGE_W_MM, PAGE_H_MM]);
          pdf.addImage(sliceImg, 'JPEG', MARGIN_MM, MARGIN_MM, imgW, sliceHMm);
          offsetPx += sliceH;
          firstPage = false;
        }
      }

      // Use Blob URL for reliable cross-browser download
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${appData?.referenceNumber || docId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
    } catch (e: any) {
      console.error('PDF generation error:', e);
      alert('Hindi ma-generate ang PDF: ' + (e?.message || 'Subukan ulit.'));
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <html><head><title>${appData?.referenceNumber || 'Application'}</title>
      <style>
        @page { size: 8.5in 11in; margin: 0.5in; }
        body { font-family: Arial, sans-serif; margin: 0; }
        * { box-sizing: border-box; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-10 { gap: 2.5rem; }
        .gap-x-6 { column-gap: 1.5rem; }
        .gap-y-1 { row-gap: 0.25rem; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .items-end { align-items: flex-end; }
        .justify-between { justify-content: space-between; }
        .gap-3 { gap: 0.75rem; }
        .gap-2 { gap: 0.5rem; }
        .gap-6 { gap: 1.5rem; }
        .flex-1 { flex: 1 1 0%; }
        .shrink-0 { flex-shrink: 0; }
        .font-black { font-weight: 900; }
        .font-bold { font-weight: 700; }
        .font-medium { font-weight: 500; }
        .uppercase { text-transform: uppercase; }
        .tracking-wide { letter-spacing: 0.025em; }
        .tracking-widest { letter-spacing: 0.1em; }
        .border-b { border-bottom-width: 1px; border-bottom-style: solid; }
        .border-neutral-800 { border-color: #262626; }
        .border-neutral-200 { border-color: #e5e5e5; }
        .text-neutral-900 { color: #171717; }
        .text-neutral-700 { color: #404040; }
        .text-neutral-600 { color: #525252; }
        .text-neutral-500 { color: #737373; }
        .text-neutral-400 { color: #a3a3a3; }
        .text-blue-600 { color: #2563eb; }
        .text-white { color: #fff; }
        .bg-neutral-900 { background-color: #171717; }
        .bg-slate-100 { background-color: #f1f5f9; }
        .rounded { border-radius: 0.25rem; }
        .rounded-xl { border-radius: 0.75rem; }
        .inline-block { display: inline-block; }
        .min-w-\[170px\] { min-width: 170px; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-5 { margin-top: 1.25rem; }
        .mt-10 { margin-top: 2.5rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-5 { margin-bottom: 1.25rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-8 { margin-bottom: 2rem; }
        .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
        .py-1\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
        .py-2\.5 { padding-top: 0.625rem; padding-bottom: 0.625rem; }
        .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
        .px-4 { padding-left: 1rem; padding-right: 1rem; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .pb-0\.5 { padding-bottom: 0.125rem; }
        .pt-6 { padding-top: 1.5rem; }
        .h-8 { height: 2rem; }
        .h-14 { height: 3.5rem; }
        .h-16 { height: 4rem; }
        .w-14 { width: 3.5rem; }
        .w-16 { width: 4rem; }
        .space-y-1 > * + * { margin-top: 0.25rem; }
        .leading-snug { line-height: 1.375; }
        .object-contain { object-fit: contain; }
        .text-lg { font-size: 1.125rem; }
        .text-xl { font-size: 1.25rem; }
      </style></head>
      <body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 600);
  };

  if (!isOpen) return null;

  const renderPreview = () => {
    if (!appData) return null;
    const ft = appData.formType || '';
    // Also detect by collectionName for previewData passed directly from form components
    if (ft === 'pwd_burial_assistance' || collectionName === 'burial_assistance') return <BurialAssistancePreview data={appData} />;
    if (ft === 'doh_prpwd_registry' || collectionName === 'doh_registry')         return <DOHPRPWDPreview data={appData} />;
    if (ft === 'burial_assistance_certificate' || collectionName === 'brgy_certification') return <BrgyCertPreview data={appData} />;
    if (ft === 'cancellation_certificate' || collectionName === 'membership_cancellation') return <CancellationPreview data={appData} />;
    // Generic fallback
    return (
      <>
        <div className="text-center mb-6">
          <h2 className="text-lg font-black uppercase tracking-wide">{appData.formTitle || 'Application Form'}</h2>
          <p className="text-[10px] font-mono text-neutral-400 mt-1">Ref: {appData.referenceNumber}</p>
        </div>
        <div className="space-y-1">
          <Field label="Applicant"     value={appData.applicantName} />
          <Field label="Email"         value={appData.applicantEmail} />
          <Field label="Contact"       value={appData.contactNumber} />
          <Field label="Address"       value={appData.address} />
          <Field label="Disability"    value={appData.disabilityType} />
          <Field label="Status"        value={appData.status} />
          {appData.remarks && <Field label="Remarks" value={appData.remarks} />}
        </div>
        <SignatureBlock submittedAt={appData.submittedAt} />
      </>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-[#f0f4f8] rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 bg-white rounded-t-3xl border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Document Preview</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Encrypted Official Record</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {appData && (
              <>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  <Printer className="w-4 h-4" /> I-Print
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-60"
                >
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PDF
                </button>
              </>
            )}
            <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kinukuha ang dokumento...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <AlertCircle className="w-10 h-10 text-red-400" />
              <p className="text-sm font-bold text-slate-600">{error}</p>
            </div>
          ) : (
            /* White paper preview */
            <div
              ref={printRef}
              className="bg-white rounded-2xl shadow-xl p-10 border border-slate-100 min-h-[600px]"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {renderPreview()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-7 py-4 bg-white rounded-b-3xl border-t border-slate-100 flex items-center justify-between">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
            Authorized for Private Use Only
          </p>
          <button onClick={onClose} className="text-[10px] font-black text-slate-400 hover:text-slate-700 uppercase tracking-widest transition-colors">
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
