import { toast } from "sonner";
import { CommonService } from "./commonservice.page";

export interface PrinterSettings {
  ip: string;
  port: string;
  autoPrint: boolean;
  connectionMode: 'rawbt' | 'network' | 'usb';
  printerName?: string; // For USB share name
}

export class ThermalPrintService {
  private static LINE_WIDTH = 42;

  private static getSettings(): PrinterSettings {
    const saved = localStorage.getItem("printer_settings");
    if (saved) {
      return JSON.parse(saved);
    }
    return { ip: "", port: "9100", autoPrint: false, connectionMode: 'network' };
  }

  private static formatLine(left: string, right: string = ""): string {
    if (!right) {
      return left.substring(0, this.LINE_WIDTH);
    }
    const spaceCount = this.LINE_WIDTH - left.length - right.length;
    if (spaceCount < 1) {
      return (left + " " + right).substring(0, this.LINE_WIDTH);
    }
    return left + " ".repeat(spaceCount) + right;
  }

  private static centerText(text: string): string {
    const spaceCount = Math.floor((this.LINE_WIDTH - text.length) / 2);
    if (spaceCount < 1) return text.substring(0, this.LINE_WIDTH);
    return " ".repeat(spaceCount) + text;
  }

  private static separator(): string {
    return "-".repeat(this.LINE_WIDTH);
  }

  private static wrapText(text: string, width: number = this.LINE_WIDTH): string {
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      if ((currentLine + word).length <= width) {
        currentLine += (currentLine === '' ? '' : ' ') + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    });
    lines.push(currentLine);
    return lines.join('\r\n');
  }

  /**
   * Triggers the printer using a hidden iframe for RawBT (Mobile).
   */
  private static triggerRawBT(ip: string, port: string, text: string) {
    const url = `http://${ip}:${port}/print?text=${encodeURIComponent(text)}&t=${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    setTimeout(() => {
      if (document.body.contains(iframe)) document.body.removeChild(iframe);
    }, 5000);
  }

  /**
   * Triggers the printer via the backend bridge (USB or Network).
   */
  private static async triggerBackendPrint(settings: PrinterSettings, text: string) {
    try {
      const payload = {
        mode: settings.connectionMode,
        ip: settings.ip,
        port: parseInt(settings.port),
        printerName: settings.printerName,
        text: text
      };
      const response = await CommonService.CommonPost(payload, '/printer/print');
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Backend printing failed:", error);
      toast.error("Failed to connect to printer bridge.");
    }
  }

  static async printReceipt(invoiceData: any) {
    const settings = this.getSettings();

    if (settings.connectionMode === 'rawbt' && !settings.ip) {
      toast.error("RawBT IP not configured.");
      return;
    }
    if (settings.connectionMode === 'network' && !settings.ip) {
      toast.error("Printer IP not configured.");
      return;
    }
    if (settings.connectionMode === 'usb' && !settings.printerName) {
      toast.error("USB Printer Share Name not configured.");
      return;
    }

    try {
      const company = invoiceData.company || {};
      let receipt = "";

      // 1. Header Section
      receipt += this.centerText(company.name || "RAMESH COLLECTION") + "\r\n";
      if (company.website) receipt += this.centerText(company.website) + "\r\n";
      if (company.address) receipt += this.centerText(company.address) + "\r\n";
      if (company.state) receipt += this.centerText("State: " + company.state) + "\r\n";
      if (company.telephone_no) receipt += this.centerText("Ph.No.: " + company.telephone_no) + "\r\n";
      if (company.uen_no) receipt += this.centerText("GSTIN: " + company.uen_no) + "\r\n";
      if (company.email) receipt += this.centerText("Email: " + company.email) + "\r\n";

      receipt += this.separator() + "\r\n";
      receipt += this.centerText("Tax Invoice") + "\r\n";
      receipt += (invoiceData.customer_name || invoiceData.customer?.name || "Cash Customer") + "\r\n";

      const dateStr = new Date(invoiceData.created_at || Date.now()).toLocaleDateString();
      receipt += this.formatLine("Date:", dateStr) + "\r\n";
      receipt += this.formatLine("Invoice No:", invoiceData.invoice_number?.toString() || "N/A") + "\r\n";
      receipt += "\r\n";

      // 2. Table Header (42 chars width)
      receipt += "#  Name               Qty  Price   Amount" + "\r\n";
      receipt += this.separator() + "\r\n";

      // 3. Items
      let totalQty = 0;
      invoiceData.items?.forEach((item: any, index: number) => {
        const idx = (index + 1).toString().padStart(2, '0');
        const itemName = (item.name || item.product?.name || "Item").substring(0, 18).padEnd(18, ' ');
        const qtyVal = item.quantity || 0;
        const priceVal = item.unit_price ?? item.price ?? 0;

        const qty = qtyVal.toString().padStart(3, ' ');
        const price = Number(priceVal).toFixed(0).padStart(6, ' ');
        const amount = (Number(priceVal) * qtyVal).toFixed(0).padStart(7, ' ');

        receipt += `${idx} ${itemName} ${qty} ${price} ${amount}\r\n`;

        // Add MRP / SP / Discount line if MRP exists and there is a discount
        const mrpNum = Number(item.mrp ?? item.product?.mrp ?? 0);
        const spNum = Number(priceVal);
        if (mrpNum > spNum) {
          const discVal = mrpNum - spNum;
          const detailsLine = `MRP:${mrpNum.toFixed(0)} Price:${spNum.toFixed(0)} Discount:${discVal.toFixed(0)}`;
          receipt += this.centerText(detailsLine) + "\r\n";
        }

        totalQty += qtyVal;
      });

      receipt += this.separator() + "\r\n";

      // 4. Totals Section
      const subTotalVal = Number(invoiceData.total_amount ?? invoiceData.subtotal ?? 0);
      const finalTotalVal = Number(invoiceData.final_total ?? invoiceData.final_amount ?? invoiceData.total ?? subTotalVal);
      const discountVal = Number(invoiceData.discount_amount ?? 0);
      const paidVal = Number(invoiceData.paid_amount ?? invoiceData.received_amount ?? 0);

      const totalSavings = (invoiceData.items || []).reduce((acc: number, item: any) => {
        const m = Number(item.mrp ?? item.product?.mrp ?? (item.price || 0));
        const p = Number(item.unit_price ?? item.price ?? 0);
        return acc + (Math.max(0, m - p) * (item.quantity || 1));
      }, 0) + discountVal;

      receipt += this.formatLine(`Total Items: ${totalQty}`, finalTotalVal.toFixed(2)) + "\r\n";
      receipt += this.formatLine("  Sub Total  :", subTotalVal.toFixed(2)) + "\r\n";

      if (discountVal > 0) {
        receipt += this.formatLine("  Disc.      :", "-" + discountVal.toFixed(2)) + "\r\n";
      }

      receipt += this.separator() + "\r\n";
      // ESC a 1 for Center, ESC ! 10 for Double Height
      // Using finalTotalVal for the big amount as it is the actual amount to pay
      receipt += "\x1B\x61\x01\x1B\x21\x10" + "Total bill amount: " + finalTotalVal.toFixed(0) + "\r\n" + "\x1B\x21\x00\x1B\x61\x00";
      receipt += this.separator() + "\r\n";

      receipt += this.formatLine("  Received   :", paidVal.toFixed(2)) + "\r\n";
      const balance = finalTotalVal - paidVal;
      receipt += this.formatLine("  Balance    :", (balance > 0 ? balance : 0).toFixed(2)) + "\r\n";

      receipt += this.separator() + "\r\n";

      if (totalSavings > 0) {
        receipt += this.centerText("*** TODAY'S SAVINGS ***") + "\r\n";
        receipt += this.formatLine("YOU SAVED Bill AMOUNT :", totalSavings.toFixed(2)) + "\r\n";
        receipt += this.separator() + "\r\n";
      }

      console.log("Generated Receipt Payload:", receipt);

      // 5. Footer Section
      receipt += this.separator() + "\r\n";
      receipt += "Terms & Conditions\r\n";
      const footer = company.invoice_footer || "Thank you for doing business with us.";
      receipt += this.wrapText(footer) + "\r\n";
      receipt += "\r\n";
      receipt += this.centerText("Powered By Billing POS") + "\r\n";
      receipt += "\r\n\r\n\r\n\r\n";

      if (settings.connectionMode === 'rawbt') {
        this.triggerRawBT(settings.ip, settings.port, receipt);
      } else {
        await this.triggerBackendPrint(settings, receipt);
      }
    } catch (error) {
      console.error("Printing failed:", error);
      toast.error("Failed to send print command.");
    }
  }

  static async testPrint(settings: PrinterSettings) {
    try {
      const testText = "POSIFLEX TEST PRINT\n" + this.separator() + "\nConnection Successful!\nMode: " + settings.connectionMode.toUpperCase() + "\n\n\n\n";
      if (settings.connectionMode === 'rawbt') {
        this.triggerRawBT(settings.ip, settings.port, testText);
        return true;
      } else {
        await this.triggerBackendPrint(settings, testText);
        return true;
      }
    } catch (error) {
      return false;
    }
  }
}
