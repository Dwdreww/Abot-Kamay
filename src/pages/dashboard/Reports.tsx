import React, { useState, useEffect } from 'react';
import {
  BarChart2, Download, Calendar,
  TrendingUp, TrendingDown, Users,
  CheckCircle2, FileText, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { cn } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../../App';
import jsPDF from 'jspdf';

export default function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [statsData, setStatsData] = useState({
    total: 0,
    approved: 0,
    processingDays: 2.4,
    activeMembers: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'applications'), orderBy('submittedAt', 'asc'));
      const snapshot = await getDocs(q);

      let total = 0;
      let approved = 0;

      const monthlyData: Record<string, number> = {};
      const formTypes: Record<string, number> = {
        'DOH PRPWD Registry': 0,
        'PWD Burial Assistance': 0,
        'Barangay Certification': 0,
        'Membership Cancellation': 0
      };

      snapshot.forEach(doc => {
        const data = doc.data();
        total++;
        if (data.status === 'approved' || data.status === 'completed') approved++;

        if (data.formTitle) {
          if (data.formTitle.includes('DOH') || data.formTitle.includes('PRPWD')) formTypes['DOH PRPWD Registry']++;
          else if (data.formTitle.includes('Burial')) formTypes['PWD Burial Assistance']++;
          else if (data.formTitle.includes('Cert')) formTypes['Barangay Certification']++;
          else if (data.formTitle.includes('Cancel')) formTypes['Membership Cancellation']++;
        }

        if (data.submittedAt) {
          const date = data.submittedAt.toDate();
          const month = date.toLocaleString('en-US', { month: 'short' });
          monthlyData[month] = (monthlyData[month] || 0) + 1;
        }
      });

      const usersSnap = await getDocs(query(collection(db, 'users')));
      let members = 0;
      usersSnap.forEach(doc => { if (doc.data().role === 'member') members++; });

      setStatsData({ total, approved: total > 0 ? Math.round((approved / total) * 100) : 0, processingDays: 2.4, activeMembers: members });

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedChart = months.filter(m => monthlyData[m] !== undefined).map(m => ({ name: m, value: monthlyData[m] || 0 }));
      setChartData(formattedChart.length > 0 ? formattedChart : [{ name: 'N/A', value: 0 }]);

      setDistributionData([
        { name: 'PRPWD Registry', value: formTypes['DOH PRPWD Registry'] || 0, color: '#2563FF' },
        { name: 'Burial Assistance', value: formTypes['PWD Burial Assistance'] || 0, color: '#10b981' },
        { name: 'Barangay Cert', value: formTypes['Barangay Certification'] || 0, color: '#8b5cf6' },
        { name: 'Cancellation', value: formTypes['Membership Cancellation'] || 0, color: '#ef4444' }
      ].filter(d => d.value > 0));

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ─── PDF Generation ───────────────────────────────────────────────────────

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const W = doc.internal.pageSize.getWidth();   // 210
      const H = doc.internal.pageSize.getHeight();  // 297
      const now = new Date();
      const dateStr = now.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      const totalSafe = Math.max(1, statsData.total);

      const hex = (h: string): [number, number, number] => [
        parseInt(h.slice(1, 3), 16),
        parseInt(h.slice(3, 5), 16),
        parseInt(h.slice(5, 7), 16)
      ];

      const NAVY: [number, number, number] = [11, 26, 56];
      const BLUE: [number, number, number] = [37, 99, 235];
      const SLATE: [number, number, number] = [100, 116, 139];
      const LIGHT: [number, number, number] = [248, 250, 255];
      const WHITE: [number, number, number] = [255, 255, 255];
      const DARK: [number, number, number] = [15, 23, 42];
      const MUTED: [number, number, number] = [148, 163, 184];

      const header = (title: string) => {
        doc.setFillColor(...NAVY); doc.rect(0, 0, W, 28, 'F');
        doc.setFillColor(...BLUE); doc.rect(0, 0, 6, 28, 'F');
        doc.setTextColor(...WHITE);
        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.text('ABOT-KAMAY', 14, 11);
        doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        doc.setTextColor(180, 200, 230);
        doc.text('Barangay PWD Platform  •  Analytics & Reports', 14, 19);
        doc.setTextColor(...WHITE);
        doc.setFontSize(10); doc.setFont('helvetica', 'bold');
        doc.text(title, W - 14, 15, { align: 'right' });
      };

      const footer = (pageNum: number, total: number) => {
        doc.setDrawColor(220, 225, 235); doc.setLineWidth(0.3);
        doc.line(14, H - 14, W - 14, H - 14);
        doc.setFontSize(7); doc.setFont('helvetica', 'normal');
        doc.setTextColor(...MUTED);
        doc.text('Abot-Kamay  •  Brgy. San Antonio de Padua I  •  CONFIDENTIAL', 14, H - 8);
        doc.text(`${pageNum} / ${total}`, W - 14, H - 8, { align: 'right' });
        doc.text(`Generated: ${dateStr}`, W / 2, H - 8, { align: 'center' });
      };

      // ── Page 1: Cover ────────────────────────────────────────────────────
      doc.setFillColor(...NAVY); doc.rect(0, 0, W, H, 'F');
      doc.setFillColor(...BLUE); doc.rect(0, 0, 8, H, 'F');

      // Watermark circle
      doc.setFillColor(20, 40, 80); doc.circle(W - 10, H * 0.4, 70, 'F');
      doc.setFillColor(15, 32, 65); doc.circle(W + 20, H * 0.7, 50, 'F');

      doc.setTextColor(...WHITE);
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.setTextColor(120, 150, 200);
      doc.text('BRGY. SAN ANTONIO DE PADUA I', 22, 45);

      doc.setFontSize(32); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...WHITE);
      doc.text('ABOT-KAMAY', 22, 75);
      doc.setFontSize(14); doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 180, 230);
      doc.text('Barangay PWD Platform', 22, 87);

      doc.setDrawColor(...BLUE); doc.setLineWidth(1);
      doc.line(22, 98, W - 22, 98);

      doc.setFontSize(28); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...WHITE);
      doc.text('Analytics &', 22, 120);
      doc.text('Reports', 22, 138);

      // Cover stats
      const coverStats = [
        { label: 'TOTAL APPLICATIONS', val: statsData.total.toString() },
        { label: 'APPROVAL RATE', val: `${statsData.approved}%` },
        { label: 'ACTIVE MEMBERS', val: statsData.activeMembers.toString() },
        { label: 'AVG. PROCESSING', val: `${statsData.processingDays} DAYS` },
      ];
      let csx = 22;
      coverStats.forEach(s => {
        doc.setFillColor(20, 40, 80); doc.rect(csx, 158, 40, 28, 'F');
        doc.setFillColor(...BLUE); doc.rect(csx, 158, 40, 3, 'F');
        doc.setFontSize(14); doc.setFont('helvetica', 'bold');
        doc.setTextColor(...WHITE);
        doc.text(s.val, csx + 20, 172, { align: 'center' });
        doc.setFontSize(5.5); doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 150, 200);
        doc.text(s.label, csx + 20, 180, { align: 'center' });
        csx += 46;
      });

      doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 110, 160);
      doc.text(`Prepared by: ${user?.name || 'System'}  •  Role: ${user?.role?.toUpperCase() || 'ADMIN'}`, 22, H - 22);
      doc.text(`Report Date: ${dateStr}`, 22, H - 14);

      // ── Page 2: Executive Summary ─────────────────────────────────────────
      doc.addPage();
      header('EXECUTIVE SUMMARY');

      const summaryCards = [
        { label: 'Total Applications', val: statsData.total.toString(), sub: 'All submissions recorded', color: '#2563FF' },
        { label: 'Approval Rate', val: `${statsData.approved}%`, sub: 'Approved or completed', color: '#10b981' },
        { label: 'Avg. Processing Time', val: `${statsData.processingDays} days`, sub: 'Estimated turnaround', color: '#8b5cf6' },
        { label: 'Active Members', val: statsData.activeMembers.toString(), sub: 'Registered PWD members', color: '#2563FF' },
      ];

      const cardW = (W - 38) / 2;
      summaryCards.forEach((c, i) => {
        const col = i % 2; const row = Math.floor(i / 2);
        const cx = 14 + col * (cardW + 10);
        const cy = 36 + row * 52;
        const [cr, cg, cb] = hex(c.color);
        doc.setFillColor(...LIGHT); doc.rect(cx, cy, cardW, 44, 'F');
        doc.setFillColor(cr, cg, cb); doc.rect(cx, cy, cardW, 4, 'F');
        doc.setFontSize(20); doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        doc.text(c.val, cx + 8, cy + 22);
        doc.setFontSize(9); doc.setFont('helvetica', 'bold');
        doc.setTextColor(...DARK);
        doc.text(c.label.toUpperCase(), cx + 8, cy + 33);
        doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
        doc.setTextColor(...SLATE);
        doc.text(c.sub, cx + 8, cy + 40);
      });

      // Divider
      const sumDivY = 148;
      doc.setDrawColor(220, 228, 240); doc.setLineWidth(0.3);
      doc.line(14, sumDivY, W - 14, sumDivY);

      doc.setFontSize(10); doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.text('KEY INSIGHTS', 14, sumDivY + 10);

      const insights = [
        `• ${statsData.total} application(s) have been submitted to the Abot-Kamay platform in total.`,
        `• The current approval rate is ${statsData.approved}%, reflecting the overall processing efficiency of the barangay staff.`,
        `• ${statsData.activeMembers} registered PWD member(s) are actively enrolled in the system.`,
        `• Average application processing time is estimated at ${statsData.processingDays} working days from submission to resolution.`,
        `• Application distribution across all form types is detailed on Page 4 of this report.`,
        `• Monthly trend data is available on Page 3. Peak periods can be identified from the trend table.`,
        `• All data is retrieved in real-time from the Firestore database at the time of export.`,
      ];

      let iy = sumDivY + 20;
      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE);
      insights.forEach(line => {
        const split = doc.splitTextToSize(line, W - 28);
        doc.text(split, 14, iy);
        iy += split.length * 6 + 2;
      });

      footer(2, 4);

      // ── Page 3: Application Trends ────────────────────────────────────────
      doc.addPage();
      header('APPLICATION TRENDS');

      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE);
      doc.text('Monthly breakdown of application submissions. Each row represents one calendar month with recorded activity.', 14, 36);

      // Table
      const tStartY = 44;
      const tCols = { month: 14, count: 70, share: 110, bar: 148 };

      // Table header
      doc.setFillColor(...NAVY); doc.rect(14, tStartY, W - 28, 10, 'F');
      doc.setTextColor(...WHITE); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
      doc.text('MONTH', tCols.month + 4, tStartY + 7);
      doc.text('APPLICATIONS', tCols.count + 4, tStartY + 7);
      doc.text('SHARE %', tCols.share + 4, tStartY + 7);
      doc.text('VISUAL BAR', tCols.bar + 4, tStartY + 7);

      const maxVal = Math.max(...(chartData.map(d => d.value)), 1);
      let rowY = tStartY + 10;

      chartData.forEach((row: any, i: number) => {
        if (i % 2 === 0) { doc.setFillColor(...LIGHT); doc.rect(14, rowY, W - 28, 10, 'F'); }
        doc.setTextColor(...DARK); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
        doc.text(row.name.toUpperCase(), tCols.month + 4, rowY + 7);
        doc.setFont('helvetica', 'normal');
        doc.text(String(row.value), tCols.count + 4, rowY + 7);
        const pct = ((row.value / totalSafe) * 100).toFixed(1);
        doc.text(`${pct}%`, tCols.share + 4, rowY + 7);
        const barMaxW = W - 28 - (tCols.bar - 14) - 10;
        const barW = Math.max(1, (row.value / maxVal) * barMaxW);
        doc.setFillColor(220, 230, 250); doc.rect(tCols.bar + 4, rowY + 3, barMaxW, 4, 'F');
        doc.setFillColor(...BLUE); doc.rect(tCols.bar + 4, rowY + 3, barW, 4, 'F');
        rowY += 10;
      });

      // Total row
      doc.setFillColor(...BLUE); doc.rect(14, rowY, W - 28, 10, 'F');
      doc.setTextColor(...WHITE); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', tCols.month + 4, rowY + 7);
      doc.text(String(statsData.total), tCols.count + 4, rowY + 7);
      doc.text('100.0%', tCols.share + 4, rowY + 7);
      rowY += 16;

      // Peak month annotation
      if (chartData.length > 0) {
        const peak = chartData.reduce((a: any, b: any) => a.value >= b.value ? a : b);
        doc.setFillColor(239, 246, 255); doc.rect(14, rowY, W - 28, 16, 'F');
        doc.setFillColor(...BLUE); doc.rect(14, rowY, 3, 16, 'F');
        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK);
        doc.text(`Peak Month: ${peak.name}  —  ${peak.value} application(s)`, 22, rowY + 6);
        doc.setFont('helvetica', 'normal'); doc.setTextColor(...SLATE);
        doc.text(`${peak.name} recorded the highest application volume, accounting for ${((peak.value / totalSafe) * 100).toFixed(1)}% of all submissions.`, 22, rowY + 13);
      }

      footer(3, 4);

      // ── Page 4: Application Distribution ──────────────────────────────────
      doc.addPage();
      header('APPLICATION DISTRIBUTION');

      doc.setFontSize(8.5); doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SLATE);
      doc.text('Breakdown of all applications by form type. Percentages reflect share of total submissions.', 14, 36);

      const distData = distributionData.length > 0
        ? distributionData
        : [{ name: 'No Data', value: 0, color: '#94a3b8' }];

      let dy = 44;
      distData.forEach((d: any, i: number) => {
        const [dr, dg, db] = hex(d.color);
        const pct = ((d.value / totalSafe) * 100).toFixed(1);
        const rank = i + 1;

        // Card
        doc.setFillColor(...LIGHT); doc.rect(14, dy, W - 28, 34, 'F');
        doc.setFillColor(dr, dg, db); doc.rect(14, dy, 4, 34, 'F');

        // Rank
        doc.setFillColor(dr, dg, db); doc.circle(28, dy + 12, 5, 'F');
        doc.setFontSize(8); doc.setFont('helvetica', 'bold'); doc.setTextColor(...WHITE);
        doc.text(String(rank), 28, dy + 14.5, { align: 'center' });

        // Form name
        doc.setFontSize(10); doc.setFont('helvetica', 'bold'); doc.setTextColor(...DARK);
        doc.text(d.name.toUpperCase(), 38, dy + 11);

        // Count label
        doc.setFontSize(8); doc.setFont('helvetica', 'normal'); doc.setTextColor(...SLATE);
        doc.text(`${d.value} application(s) submitted`, 38, dy + 19);

        // Percentage badge (right)
        doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(dr, dg, db);
        doc.text(`${pct}%`, W - 18, dy + 14, { align: 'right' });

        // Progress bar
        const barMaxW = W - 28 - 24 - 10;
        doc.setFillColor(220, 225, 240); doc.rect(24, dy + 25, barMaxW, 4, 'F');
        const bw = Math.max(1, (d.value / Math.max(1, distData.reduce((s: number, x: any) => s + x.value, 0))) * barMaxW);
        doc.setFillColor(dr, dg, db); doc.rect(24, dy + 25, bw, 4, 'F');

        dy += 40;
      });

      // Distribution summary table
      dy += 4;
      doc.setFillColor(...NAVY); doc.rect(14, dy, W - 28, 10, 'F');
      doc.setTextColor(...WHITE); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
      doc.text('FORM TYPE', 18, dy + 7);
      doc.text('COUNT', 110, dy + 7);
      doc.text('PERCENTAGE', 145, dy + 7);
      doc.text('RANK', 180, dy + 7);
      dy += 10;

      const sortedDist = [...distData].sort((a: any, b: any) => b.value - a.value);
      sortedDist.forEach((d: any, i: number) => {
        if (i % 2 === 0) { doc.setFillColor(...LIGHT); doc.rect(14, dy, W - 28, 8, 'F'); }
        const pct = ((d.value / totalSafe) * 100).toFixed(1);
        doc.setTextColor(...DARK); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
        doc.text(d.name.toUpperCase(), 18, dy + 6);
        doc.setFont('helvetica', 'normal');
        doc.text(String(d.value), 110, dy + 6);
        doc.text(`${pct}%`, 145, dy + 6);
        doc.text(`#${i + 1}`, 180, dy + 6);
        dy += 8;
      });

      // Grand total row
      doc.setFillColor(...BLUE); doc.rect(14, dy, W - 28, 8, 'F');
      doc.setTextColor(...WHITE); doc.setFontSize(7.5); doc.setFont('helvetica', 'bold');
      doc.text('GRAND TOTAL', 18, dy + 6);
      doc.text(String(statsData.total), 110, dy + 6);
      doc.text('100.0%', 145, dy + 6);

      footer(4, 4);

      // Save
      const fileName = `AbotKamay-Report-${now.toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Nabigong i-generate ang PDF. Subukan muli.');
    } finally {
      setGenerating(false);
    }
  };

  // ─── Stats cards ──────────────────────────────────────────────────────────

  const stats = [
    { label: 'Total Applications', value: statsData.total.toString(), grow: 'Live', isUp: true, icon: FileText, color: 'blue' },
    { label: 'Approval Rate', value: `${statsData.approved}%`, grow: 'Live', isUp: true, icon: CheckCircle2, color: 'emerald' },
    { label: 'Average Processing', value: `${statsData.processingDays} Days`, grow: 'Estimated', isUp: true, icon: Calendar, color: 'purple' },
    { label: 'Active Members', value: statsData.activeMembers.toString(), grow: 'Live', isUp: true, icon: Users, color: 'blue' },
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">Reports & Analytics</h2>
          <p className="text-slate-500 font-medium tracking-tight">System-wide data insights, application trends, and demographic analytics.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200/20 hover:bg-slate-50 transition-all">
            <Calendar className="w-5 h-5 text-blue-600" />
            Jan 01 – Jun 30, 2024
          </button>
          <button
            onClick={generatePDF}
            disabled={generating || loading}
            className="flex items-center gap-3 px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 hover:bg-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
          >
            {generating
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</>
              : <><Download className="w-5 h-5" /> Export All Data</>
            }
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-10 rounded-[45px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                    stat.color === 'blue' ? "bg-blue-50 text-blue-600 shadow-blue-100" :
                    stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600 shadow-emerald-100" :
                    "bg-purple-50 text-purple-600 shadow-purple-100"
                  )}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter", stat.isUp ? "text-emerald-500" : "text-rose-500")}>
                    {stat.grow}
                    {stat.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{stat.value}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-10">
        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white p-12 rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative z-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Application Trends</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Growth analysis of applications over time</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl">
              {['Daily', 'Weekly', 'Monthly'].map(t => (
                <button key={t} className={cn("px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all", t === 'Monthly' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563FF" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }} />
                <Area type="monotone" dataKey="value" stroke="#2563FF" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-12 rounded-[50px] border border-slate-100 shadow-2xl shadow-slate-200/20 flex flex-col">
          <div className="mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Application Distribution</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Breakdown by form type</p>
          </div>
          <div className="flex-grow flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distributionData} cx="50%" cy="50%" innerRadius={85} outerRadius={115} paddingAngle={8} dataKey="value">
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{statsData.total}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="mt-10 space-y-4">
            {distributionData.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{d.name}</span>
                </div>
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-tighter">
                  {Math.round((d.value / Math.max(1, statsData.total)) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
