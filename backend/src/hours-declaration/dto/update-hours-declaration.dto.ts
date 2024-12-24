import { PartialType } from '@nestjs/mapped-types';
import { CreateHoursDeclarationDto } from './create-hours-declaration.dto';

export class UpdateHoursDeclarationDto extends PartialType(CreateHoursDeclarationDto) {}
