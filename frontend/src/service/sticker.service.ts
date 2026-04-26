import { jsPDF } from "jspdf";
import QRCode from 'qrcode';

export const StickerService = {
  generateProductSticker: async (product: any) => {
    try {
      // Create a small PDF for the sticker (50mm x 25mm)
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [50, 25]
      });

      // 1. Add Product Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      const name = product.name.length > 30 ? product.name.substring(0, 27) + "..." : product.name;
      doc.text(name, 25, 6, { align: 'center' });

      // 2. Add Price
      doc.setFontSize(11);
      doc.text(`MRP: Rs. ${product.selling_price}`, 25, 11, { align: 'center' });

      // 3. Generate 1D Barcode using bwipjs API
      // Using Code128 which is standard for retail
      const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(product.barcode)}&scale=2&rotate=N&includetext=true`;
      
      // Load image and add to PDF
      // Note: We use a helper to load the image as jsPDF's addImage requires it to be loaded
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = barcodeUrl;
      });

      doc.addImage(img, 'PNG', 5, 13, 40, 10);

      // Save the PDF
      doc.save(`Barcode_${product.barcode}.pdf`);
    } catch (err) {
      console.error("Failed to generate Barcode sticker", err);
      throw new Error("Barcode generation failed");
    }
  }
};
