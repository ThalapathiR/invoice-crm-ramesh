import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BaseModel } from '../Base.model';

export class ProductModel extends BaseModel {
  @IsNotEmpty({ message: 'Barcode required' })
  @ApiProperty({ required: true })
  @Type(() => String)
  barcode: string;

  @IsNotEmpty({ message: 'SKU required' })
  @ApiProperty({ required: true })
  @Type(() => String)
  sku: string;

  @IsNotEmpty({ message: 'Name required' })
  @ApiProperty({ required: true })
  @Type(() => String)
  name: string;

  @IsOptional()
  @ApiProperty({ required: false })
  @Type(() => String)
  size: string;

  @IsOptional()
  @ApiProperty({ required: false })
  @Type(() => String)
  color: string;

  @IsOptional()
  @ApiProperty({ required: false })
  @Type(() => String)
  category: string;

  @IsNotEmpty({ message: 'Purchase price required' })
  @IsNumber()
  @ApiProperty({ required: true })
  @Type(() => Number)
  purchase_price: number;

  @IsNotEmpty({ message: 'Selling price required' })
  @IsNumber()
  @ApiProperty({ required: true })
  @Type(() => Number)
  selling_price: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  @Type(() => Number)
  gst_percentage: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  @Type(() => Number)
  quantity_in_stock: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false, default: 5 })
  @Type(() => Number)
  reorder_level: number;

  @IsNotEmpty({ message: 'Store ID required' })
  @ApiProperty({ required: true })
  @Type(() => String)
  store_id: string;
}
