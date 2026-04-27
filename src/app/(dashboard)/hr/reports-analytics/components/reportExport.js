import * as XLSX from 'xlsx';

export const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const toCsv = (columns, rows) => {
  const header = columns.join(",");
  const lines = rows.map((row) =>
    columns
      .map((key) => {
        const value = row[key] ?? "";
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",")
  );
  // Add UTF-8 BOM for Excel compatibility
  return "\uFEFF" + [header, ...lines].join("\n");
};

export const downloadCsv = ({ columns, rows, fileName }) => {
  const csv = toCsv(columns, rows);
  downloadFile(csv, fileName, "text/csv;charset=utf-8;");
};

export const downloadExcel = ({ columns, rows, fileName }) => {
  try {
    // Create worksheet from data
    const worksheet = XLSX.utils.json_to_sheet(rows);
    
    // Create workbook and add the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Download file
    downloadFile(excelBuffer, fileName, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  } catch (error) {
    console.error("Excel export failed:", error);
    // Fallback to CSV if XLSX fails
    downloadCsv({ columns, rows, fileName: fileName.replace('.xlsx', '.csv') });
  }
};

export const downloadPdf = ({ fileName }) => {
  if (typeof window !== "undefined") {
    window.print();
  } else {
    downloadFile("", fileName, "application/pdf");
  }
};

export const printReport = () => {
  if (typeof window !== "undefined") {
    window.print();
  }
};
