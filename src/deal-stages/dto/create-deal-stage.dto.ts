import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class CreateDealStageDto {
  @IsString({ message: 'Nome deve ser uma string' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(100, { message: 'Nome deve ter no máximo 100 caracteres' })
  name: string;

  @IsInt({ message: 'Posição deve ser um número inteiro' })
  @IsOptional()
  @Min(0, { message: 'Posição deve ser maior ou igual a 0' })
  position?: number;
}


