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
      doc.setFontSize(8);
      const name = product.name.length > 30 ? product.name.substring(0, 27) + "..." : product.name;
      doc.text(name, 25, 6, { align: 'center' });

      // 2. Add Price & MRP
      doc.setFontSize(7);
      doc.text(`MRP: Rs.${product.mrp || product.selling_price}  |  Price: Rs.${product.selling_price}`, 25, 10, { align: 'center' });

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

      doc.addImage(img, 'PNG', 5, 12, 40, 11);

      // Open print dialog directly
      doc.autoPrint();
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err) {
      console.error("Failed to generate Barcode sticker", err);
      throw new Error("Barcode generation failed");
    }
  }
};
