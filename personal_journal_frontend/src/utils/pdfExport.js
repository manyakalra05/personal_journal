import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportPostToPDF = (post, username) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text(post.title, 20, 20);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100);
  
  let yPos = 30;
  doc.text(`Author: ${username}`, 20, yPos);
  yPos += 5;
  doc.text(`Date: ${new Date(post.created_at).toLocaleDateString()}`, 20, yPos);
  yPos += 5;
  
  if (post.category_name) {
    doc.text(`Category: ${post.category_name}`, 20, yPos);
    yPos += 5;
  }
  
  if (post.tags) {
    doc.text(`Tags: ${post.tags}`, 20, yPos);
    yPos += 10;
  } else {
    yPos += 5;
  }
  
  doc.setFontSize(12);
  doc.setTextColor(0);
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = post.content;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  const splitText = doc.splitTextToSize(textContent, 170);
  doc.text(splitText, 20, yPos);
  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  const fileName = `${post.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(fileName);
};

export const calculateReadingTime = (content) => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  const text = tempDiv.textContent || tempDiv.innerText || '';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200); 
  return minutes;
};