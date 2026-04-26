import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, } from 'class-validator';
import { BaseModel } from '../Base.model';
export class UserRoleModel extends BaseModel {

  @IsNotEmpty({ message: 'User role name required' })
  @ApiProperty({ required: true })
  @Type(() => String)
  name: string;

  @ApiProperty({ required: false })
  @Type(() => String)
  code: string;

  @ApiProperty({ required: false })
  permission: any;

}

