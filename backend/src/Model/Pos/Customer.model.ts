import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseModel } from '../Base.model';

export class CustomerModel extends BaseModel {
  @IsNotEmpty({ message: 'Name required' })
  @ApiProperty({ required: true })
  @Type(() => String)
  name: string;

  @IsNotEmpty({ message: 'Phone required' })
  @ApiProperty({ required: true })
  @Type(() => String)
  phone: string;

  @IsOptional()
  @ApiProperty({ required: false })
  @Type(() => String)
  email: string;

  @IsOptional()
  @ApiProperty({ required: false })
  @Type(() => String)
  address: string;

  @IsNotEmpty({ message: 'Store ID required' })
  @ApiProperty({ required: true })
  @Type(() => String)
  store_id: string;
}
