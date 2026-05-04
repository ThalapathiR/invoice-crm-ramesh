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
      receipt += this.centerText(company.name || "RAMESH COLLECTION") + "\n";
      if (company.website) receipt += this.centerText(company.website) + "\n";
      if (company.address) receipt += this.centerText(company.address) + "\n";
      if (company.state) receipt += this.centerText("State: " + company.state) + "\n";
      if (company.telephone_no) receipt += this.centerText("Ph.No.: " + company.telephone_no) + "\n";
      if (company.uen_no) receipt += this.centerText("GSTIN: " + company.uen_no) + "\n";
      if (company.email) receipt += this.centerText("Email: " + company.email) + "\n";
      
      receipt += this.separator() + "\n";
      receipt += this.centerText("Tax Invoice") + "\n";
      receipt += (invoiceData.customer_name || invoiceData.customer?.name || "Cash Customer") + "\n";
      
      const dateStr = new Date(invoiceData.created_at || Date.now()).toLocaleDateString();
      receipt += this.formatLine("Date:", dateStr) + "\n";
      receipt += this.formatLine("Invoice No:", invoiceData.invoice_number?.toString() || "N/A") + "\n";
      receipt += "\n";

      // 2. Table Header (42 chars width)
      // #  Name               Qty  Price   Amount
      // XX XXXXXXXXXXXXXXXXX  XXX  XXXXXX  XXXXXX
      receipt += "#  Name               Qty  Price   Amount" + "\n";
      receipt += this.separator() + "\n";

      // 3. Items
      let totalQty = 0;
      invoiceData.items?.forEach((item: any, index: number) => {
        const idx = (index + 1).toString().padStart(2, '0');
        const name = (item.name || item.product?.name || "Item").substring(0, 18).padEnd(18, ' ');
        const qty = item.quantity.toString().padStart(3, ' ');
        const price = item.unit_price.toFixed(0).padStart(6, ' ');
        const amount = (item.unit_price * item.quantity).toFixed(0).padStart(7, ' ');
        
        receipt += `${idx} ${name} ${qty} ${price} ${amount}\n`;
        totalQty += item.quantity;
      });

      receipt += this.separator() + "\n";

      // 4. Totals Section
      receipt += this.formatLine(`Total Items: ${totalQty}`, (invoiceData.final_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })) + "\n";
      
      receipt += this.formatLine("  Sub Total  :", (invoiceData.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })) + "\n";
      
      if (invoiceData.discount_amount) {
        receipt += this.formatLine("  Disc.      :", "-" + invoiceData.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })) + "\n";
        receipt += this.formatLine("  Total Disc.:", "-" + invoiceData.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })) + "\n";
      }

      receipt += this.formatLine("  Total      :", (invoiceData.final_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })) + "\n";
      receipt += this.formatLine("  Received   :", (invoiceData.paid_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })) + "\n";
      
      const balance = (invoiceData.final_total || 0) - (invoiceData.paid_amount || 0);
      receipt += this.formatLine("  Balance    :", (balance > 0 ? balance : 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })) + "\n";
      
      receipt += this.separator() + "\n";

      if (invoiceData.discount_amount) {
        receipt += this.formatLine("You Saved    :", invoiceData.discount_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })) + "\n";
        receipt += this.separator() + "\n";
      }

      // 5. Footer Section
      receipt += "Terms & Conditions\n";
      receipt += "Thank you for doing business\nwith us.\n";
      receipt += "\n";
      receipt += this.centerText("Powered By www.vyaparapp.in") + "\n";
      receipt += "\n\n\n";

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
