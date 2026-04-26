import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class StockAdjustmentModel {
  @IsNotEmpty()
  @ApiProperty()
  product_id: string;

  @IsNotEmpty()
  @ApiProperty()
  movement_type: string; // IN, OUT

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  quantity: number;

  @IsOptional()
  @ApiProperty()
  reference_id: string;
}
