import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { BaseModel } from '../Base.model';

export class InvoiceItemModel {
  @IsNotEmpty()
  @ApiProperty()
  product_id: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  quantity: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  unit_price: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  gst_percentage: number;

  @IsOptional()
  @IsArray()
  @ApiProperty({ required: false, type: [String] })
  serial_numbers?: string[];

  @IsOptional()
  @ApiProperty({ required: false })
  discount_type?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  discount_value?: number;
}

export class CreateInvoiceModel {
  @IsOptional()
  @ApiProperty({ required: false })
  customer_id: string;

  @IsNotEmpty()
  @ApiProperty()
  store_id: string;

  @IsNotEmpty()
  @ApiProperty()
  payment_method: string;

  @IsOptional()
  @ApiProperty({ required: false })
  bank_account_id?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  upi_reference?: string;

  @IsOptional()
  @ApiProperty({ required: false })
  paid_amount?: number;

  @IsOptional()
  @ApiProperty({ required: false })
  discount_percentage: number;

  @IsOptional()
  @ApiProperty({ required: false })
  customer_phone: string;

  @IsOptional()
  @ApiProperty({ required: false })
  customer_name: string;

  @IsOptional()
  @ApiProperty({ required: false })
  discount_amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemModel)
  @ApiProperty({ type: [InvoiceItemModel] })
  items: InvoiceItemModel[];
}
