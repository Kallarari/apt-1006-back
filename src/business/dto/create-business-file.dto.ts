import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  MaxLength,
  IsUrl
} from 'class-validator';

export class CreateBusinessFileDto {
  @IsString({ message: 'Nome do arquivo deve ser uma string' })
  @IsNotEmpty({ message: 'Nome do arquivo é obrigatório' })
  @MaxLength(255, { message: 'Nome do arquivo deve ter no máximo 255 caracteres' })
  filename: string;

  @IsString({ message: 'Tipo do arquivo deve ser uma string' })
  @IsOptional()
  @MaxLength(100, { message: 'Tipo do arquivo deve ter no máximo 100 caracteres' })
  fileType?: string;

  @IsString({ message: 'URL pública deve ser uma string' })
  @IsOptional()
  @IsUrl({}, { message: 'URL pública deve ser uma URL válida' })
  publicUrl?: string;
}

