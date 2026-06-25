/**
 * WHY: Export functionality is complex enough to isolate. PDF via jspdf + autotable,
 *      Excel via xlsx. Both libraries support rich formatting.
 * HOW: exportToPDF creates a table-structured PDF. exportToExcel creates a worksheet.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

export const exportToPDF = (friends, filename = 'wishmate-friends') => {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(20);
  doc.setTextColor(108, 99, 255);
  doc.text('WishMate — Friends List', 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Exported on ${dayjs().format('DD MMM YYYY, HH:mm')}`, 14, 28);
  doc.text(`Total: ${friends.length} friends`, 14, 34);

  const rows = friends.map((f, idx) => [
    idx + 1,
    f.name,
    f.gender || '—',
    f.dateOfBirth ? dayjs(f.dateOfBirth).format('DD MMM YYYY') : '—',
    f.age || '—',
    f.mobile || '—',
    f.email || '—',
    f.city || '—',
    f.relationship || '—',
  ]);

  autoTable(doc, {
    startY: 40,
    head: [['#', 'Name', 'Gender', 'Date of Birth', 'Age', 'Mobile', 'Email', 'City', 'Relationship']],
    body: rows,
    headStyles: { fillColor: [108, 99, 255], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 239, 255] },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 40 },
      2: { cellWidth: 20 },
    },
  });

  doc.save(`${filename}-${dayjs().format('YYYY-MM-DD')}.pdf`);
};

export const exportToExcel = (friends, filename = 'wishmate-friends') => {
  const data = friends.map((f, idx) => ({
    '#': idx + 1,
    'Name': f.name,
    'Gender': f.gender || '',
    'Date of Birth': f.dateOfBirth ? dayjs(f.dateOfBirth).format('DD/MM/YYYY') : '',
    'Age': f.age || '',
    'Mobile': f.mobile || '',
    'WhatsApp': f.whatsapp || '',
    'Email': f.email || '',
    'Address': f.address || '',
    'City': f.city || '',
    'State': f.state || '',
    'Country': f.country || '',
    'Pincode': f.pincode || '',
    'Occupation': f.occupation || '',
    'Company': f.company || '',
    'Blood Group': f.bloodGroup || '',
    'Relationship': f.relationship || '',
    'Favorite Color': f.favoriteColor || '',
    'Spouse Name': f.spouse?.name || '',
    'Wedding Anniversary': f.spouse?.weddingAnniversary
      ? dayjs(f.spouse.weddingAnniversary).format('DD/MM/YYYY') : '',
    'Notes': f.notes || '',
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Friends');
  XLSX.writeFile(wb, `${filename}-${dayjs().format('YYYY-MM-DD')}.xlsx`);
};

export const shareToWhatsApp = (message) => {
  const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
