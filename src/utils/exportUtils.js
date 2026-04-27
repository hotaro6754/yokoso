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
  // columns should be an array of { label: string, key: string }
  const header = columns.map(col => col.label).join(",");
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key] ?? "";
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
    // Transform rows to match column labels
    const transformedRows = rows.map(row => {
      const newRow = {};
      columns.forEach(col => {
        newRow[col.label] = row[col.key] ?? "";
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(transformedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    downloadFile(excelBuffer, fileName, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  } catch (error) {
    console.error("Excel export failed:", error);
    downloadCsv({ columns, rows, fileName: fileName.replace('.xlsx', '.csv') });
  }
};
