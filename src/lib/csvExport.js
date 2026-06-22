/**
 * Export an array of objects to a CSV file and trigger download.
 * @param {Array<Object>} rows - Array of row objects
 * @param {string} filename - Output filename (without extension is fine)
 */
export function exportToCSV(rows, filename) {
  if (!rows || rows.length === 0) {
    return;
  }

  const headers = Object.keys(rows[0]);
  const escape = (val) => {
    const str = val == null ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = [
    headers.map(escape).join(','),
    ...rows.map((row) => headers.map((h) => escape(row[h])).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}