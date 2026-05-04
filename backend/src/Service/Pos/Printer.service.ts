import { Injectable } from '@nestjs/common';
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { exec } from 'child_process';

@Injectable()
export class PrinterService {
  private readonly ESC = '\u001b';
  private readonly GS = '\u001d';

  async printRaw(ip: string, port: number, text: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const client = new net.Socket();
      
      const initPrinter = this.ESC + '@';
      const cutPaper = this.GS + 'V' + '\u0042' + '\u0000'; // Full cut
      const fullText = initPrinter + text + '\r\n\r\n\r\n\r\n\r\n' + cutPaper;

      client.connect(port, ip, () => {
        client.write(fullText, 'latin1');
        client.end();
        resolve({ success: true, message: 'Print command sent successfully to Network Printer' });
      });

      client.on('error', (err) => {
        console.error('Printer Socket Error:', err);
        resolve({ success: false, message: `Connection failed: ${err.message}` });
      });

      // Timeout
      setTimeout(() => {
        if (!client.destroyed) {
          client.destroy();
          resolve({ success: false, message: 'Printer connection timed out' });
        }
      }, 5000);
    });
  }

  async printRawUSB(printerName: string, text: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      try {
        const cutPaper = this.GS + 'V' + '\u0042' + '\u0000';
        // Add more line breaks to ensure the buffer is flushed and visible
        const fullText = '\r\n\r\n' + text + '\r\n\r\n\r\n\r\n\r\n' + cutPaper;

        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
        
        const tempFilePath = path.join(tempDir, `print_${Date.now()}.bin`);
        fs.writeFileSync(tempFilePath, fullText, { encoding: 'latin1' });

        // Use Machine Hostname for the share path
        const hostname = os.hostname();
        const command = `copy /b "${tempFilePath}" "\\\\${hostname}\\${printerName}"`;
        console.log("Executing USB Print Command:", command);

        exec(command, (error, stdout, stderr) => {
          if (stdout) console.log("USB Print Stdout:", stdout);
          if (stderr) console.error("USB Print Stderr:", stderr);
          
          // Clean up
          if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

          if (error) {
            console.error('USB Print Error:', error);
            resolve({ success: false, message: `USB Print failed: ${error.message}. Ensure printer is shared as "${printerName}"` });
          } else {
            resolve({ success: true, message: 'Print command sent successfully to USB Printer' });
          }
        });
      } catch (err: any) {
        resolve({ success: false, message: `System error: ${err.message}` });
      }
    });
  }
}
