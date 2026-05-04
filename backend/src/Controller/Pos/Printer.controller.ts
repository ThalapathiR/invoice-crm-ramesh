import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PrinterService } from '../../Service/Pos/Printer.service';
import { AuthGuard } from '@nestjs/passport';

@Controller({ path: 'printer', version: '1' })
export class PrinterController {
  constructor(private readonly printerService: PrinterService) {}

  @Post('print')
  async print(@Body() body: { mode?: string; ip?: string; port?: number; text: string; printerName?: string }) {
    if (body.mode === 'usb' && body.printerName) {
      return await this.printerService.printRawUSB(body.printerName, body.text);
    }
    
    // Default to Network if IP is provided
    const ip = body.ip || '127.0.0.1';
    const port = body.port || 9100;
    return await this.printerService.printRaw(ip, port, body.text);
  }
}
