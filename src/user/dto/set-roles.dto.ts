import { ApiProperty } from "@nestjs/swagger"

export class SetRolesDto {
    @ApiProperty({example:0, required:true})
    readonly userId: number
    @ApiProperty({example:[1,2], required:true})
    readonly rolesId: number[]
}