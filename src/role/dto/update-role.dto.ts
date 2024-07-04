import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
    @ApiProperty({ required: false, example: 'new role name', description: 'The new name of the role' })
    role_name?: string;
}

export class SetPermissionsToRoleDto {
    @ApiProperty({required:true, example: 0, description: 'The role id.'})
    roleId: number
    @ApiProperty({required:true, example: [1,2], description: 'The permissions ids to be assigned to the role.'})
    permissionsId: number[]
}