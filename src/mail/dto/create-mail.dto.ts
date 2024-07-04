import { ApiProperty } from "@nestjs/swagger";

export class CreateMailDto  {
    @ApiProperty({ example: 'email' })
    readonly to: string;
    @ApiProperty({ example: 'subject' })
    readonly subject: string;
    @ApiProperty({ example: 'text' })
    readonly text: string;
  }
