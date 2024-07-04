// src/user/dto/update-user.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ example: 'user email', required: false })
  readonly email?: string;

  @ApiProperty({ example: 'user name', required: false })
  readonly name?: string;

  @ApiProperty({ example: "user resetpassword" })
  readonly resetpassword?: string;
}