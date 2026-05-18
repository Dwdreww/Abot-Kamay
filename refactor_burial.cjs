const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'dashboard', 'forms', 'BurialForm.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Extract the preview JSX block
const startIdx = content.indexOf('<div id="form-p-preview"');
const endMarker = '</div>\n            </div>\n            \n            <div className="mt-8 flex justify-center">';
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error("Could not find preview JSX block bounds.");
  process.exit(1);
}

// The actual preview block ends just before `</div>` that closes `id="form-p-preview"`... wait.
// Let's just find the closing tag.
const previewJSX = content.substring(startIdx, endIdx + 6); // +6 for `</div>`

// 2. Remove the original `if (submitted) { ... }` block
const submitIfStart = content.indexOf('if (submitted) {');
const submitIfEndMarker = '  }\n\n  return (';
const submitIfEnd = content.indexOf(submitIfEndMarker) + 3;

const submitBlock = content.substring(submitIfStart, submitIfEnd);

// Rewrite the component to use a variable for previewJSX
// and include it in the success screen

const newSubmitBlock = `
  const previewContent = (
    ${previewJSX.replace(/\n/g, '\n    ')}
  );

  if (submitted) {
    return (
      <div className="relative">
${submitBlock.replace('if (submitted) {', '').replace('return (', '').replace(/}\s*$/, '').trim()}
        <div className="fixed left-[-9999px] top-[-9999px] opacity-0 pointer-events-none z-[-1]">
          {previewContent}
        </div>
      </div>
    );
  }
`;

content = content.substring(0, submitIfStart) + newSubmitBlock + '\n\n  return (' + content.substring(submitIfEndMarker.length + submitIfStart + submitBlock.length - 3);

// 3. Replace the original preview block with {previewContent}
content = content.replace(previewJSX, '{previewContent}');

// 4. Update the "I-download ang Kopya" button to show loading state
content = content.replace(
  '<button \n            onClick={handleDownload}\n            className="px-8 py-3 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-2"\n          >\n            <Download className="w-5 h-5" />\n            I-download ang Kopya\n          </button>',
  '<button \n            onClick={handleDownload}\n            disabled={loading}\n            className="px-8 py-3 bg-white border border-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"\n          >\n            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}\n            {loading ? "Nagda-download..." : "I-download ang Kopya"}\n          </button>'
);


fs.writeFileSync(filePath, content, 'utf-8');
console.log("Successfully refactored BurialForm.tsx");
