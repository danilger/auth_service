import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    @ApiProperty({ example: "user email" })
    readonly email: string;
    @ApiProperty({ example: "user name" })
    readonly name?: string;
    @ApiProperty({ example: "user password" })
    readonly password: string;
}
