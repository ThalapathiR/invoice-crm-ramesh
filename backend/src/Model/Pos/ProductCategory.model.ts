import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseModel } from '../Base.model';

export class ProductCategoryModel extends BaseModel {
  @IsNotEmpty({ message: 'Category Name required' })
  @ApiProperty({ required: true })
  @Type(() => String)
  name: string;

  @IsNotEmpty({ message: 'Store ID required' })
  @ApiProperty({ required: true })
  @Type(() => String)
  store_id: string;
}
