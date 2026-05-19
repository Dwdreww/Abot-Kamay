export const pdfCaptureColorFallbacks = `
  [data-pdf-capture], [data-pdf-capture] * {
    color: #111827 !important;
    background-color: transparent !important;
    background-image: none !important;
    border-color: #e5e7eb !important;
    box-shadow: none !important;
    outline-color: #111827 !important;
    text-decoration-color: currentColor !important;
    text-shadow: none !important;
  }
  [data-pdf-capture] {
    background-color: #ffffff !important;
    border-color: #f1f5f9 !important;
  }
  [data-pdf-capture] .bg-white { background-color: #ffffff !important; }
  [data-pdf-capture] .bg-blue-900 { background-color: #1e3a8a !important; }
  [data-pdf-capture] .bg-blue-600 { background-color: #2563eb !important; }
  [data-pdf-capture] .bg-emerald-600 { background-color: #059669 !important; }
  [data-pdf-capture] .bg-green-600 { background-color: #16a34a !important; }
  [data-pdf-capture] .bg-neutral-900 { background-color: #171717 !important; }
  [data-pdf-capture] .bg-slate-100 { background-color: #f1f5f9 !important; }
  [data-pdf-capture] .text-white { color: #ffffff !important; }
  [data-pdf-capture] .text-neutral-900 { color: #171717 !important; }
  [data-pdf-capture] .text-neutral-800 { color: #262626 !important; }
  [data-pdf-capture] .text-neutral-700 { color: #404040 !important; }
  [data-pdf-capture] .text-neutral-600 { color: #525252 !important; }
  [data-pdf-capture] .text-neutral-500 { color: #737373 !important; }
  [data-pdf-capture] .text-neutral-400 { color: #a3a3a3 !important; }
  [data-pdf-capture] .text-slate-900 { color: #0f172a !important; }
  [data-pdf-capture] .text-slate-800 { color: #1e293b !important; }
  [data-pdf-capture] .text-slate-600 { color: #475569 !important; }
  [data-pdf-capture] .text-blue-900 { color: #1e3a8a !important; }
  [data-pdf-capture] .text-blue-800 { color: #1e40af !important; }
  [data-pdf-capture] .text-blue-600 { color: #2563eb !important; }
  [data-pdf-capture] .border-neutral-900 { border-color: #171717 !important; }
  [data-pdf-capture] .border-neutral-800 { border-color: #262626 !important; }
  [data-pdf-capture] .border-neutral-200 { border-color: #e5e5e5 !important; }
  [data-pdf-capture] .border-neutral-100 { border-color: #f5f5f5 !important; }
  [data-pdf-capture] .border-slate-100 { border-color: #f1f5f9 !important; }
  [data-pdf-capture] .border-blue-900 { border-color: #1e3a8a !important; }
  [data-pdf-capture] .decoration-slate-900\\/20 { text-decoration-color: rgba(15, 23, 42, 0.2) !important; }
`;

export function applyPdfCaptureColorFallbacks(clonedDocument: Document) {
  const style = clonedDocument.createElement('style');
  style.textContent = pdfCaptureColorFallbacks;
  clonedDocument.head.appendChild(style);
}
