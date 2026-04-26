import { Controller, Get } from '@nestjs/common';
import { GoogleSheetsService } from '@Service/GoogleSheets.service';
import { ApiTags } from '@nestjs/swagger';
import { JWTAuthController } from '@Controller/JWTAuth.controller';

@ApiTags('Sync')
@Controller({ path: 'Sync', version: '1' })
export class SyncController extends JWTAuthController {
  constructor(private readonly _GoogleSheetsService: GoogleSheetsService) {
    super();
  }

  @Get('GoogleSheets')
  async syncToGoogleSheets() {
    try {
      await this._GoogleSheetsService.syncAllData();
      return { success: true, message: 'All CRM data has been synced to Google Sheets tabs.' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
