import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ChangeStageDto {
  @IsString({ message: 'Stage ID deve ser uma string' })
  @IsNotEmpty({ message: 'Stage ID é obrigatório' })
  @MaxLength(50, { message: 'Stage ID deve ter no máximo 50 caracteres' })
  stageId: string;
}





