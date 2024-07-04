import { ApiProperty } from "@nestjs/swagger";

export class CreatePermissionDto {
    @ApiProperty({example:"permission name"})
    permission_name!: string;
    @ApiProperty({example:"description"})
    permission_description: string;
}
