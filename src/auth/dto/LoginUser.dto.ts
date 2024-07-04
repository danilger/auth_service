import { ApiProperty } from "@nestjs/swagger";

export class LoginUserDto {
  @ApiProperty({ example: 'email' })
  readonly email!: string;
  @ApiProperty({ example: 'password' })
  readonly password!: string;
}