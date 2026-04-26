import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { BaseModel } from '../Base.model';

export class PaymentMethodModel extends BaseModel {
  @IsNotEmpty()
  @ApiProperty()
  store_id: string;

  @IsNotEmpty()
  @ApiProperty()
  method_name: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  is_active: boolean;
}
