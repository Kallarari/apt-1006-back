import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  IsDateString, 
  MaxLength, 
  Min, 
  IsDecimal 
} from 'class-validator';

export class CreateBusinessDto {
  @IsString({ message: 'Lead ID deve ser uma string' })
  @IsOptional()
  @MaxLength(50, { message: 'Lead ID deve ter no máximo 50 caracteres' })
  leadId?: string;

  @IsString({ message: 'Property ID deve ser uma string' })
  @IsOptional()
  @MaxLength(50, { message: 'Property ID deve ter no máximo 50 caracteres' })
  propertyId?: string;

  @IsString({ message: 'Stage ID deve ser uma string' })
  @IsOptional()
  @MaxLength(50, { message: 'Stage ID deve ter no máximo 50 caracteres' })
  stageId?: string;

  @IsString({ message: 'Título deve ser uma string' })
  @IsOptional()
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title?: string;

  @IsString({ message: 'Descrição deve ser uma string' })
  @IsOptional()
  description?: string;

  @IsString({ message: 'Origem do negócio deve ser uma string' })
  @IsOptional()
  @MaxLength(100, { message: 'Origem do negócio deve ter no máximo 100 caracteres' })
  businessOrigin?: string;

  @IsString({ message: 'Status deve ser uma string' })
  @IsOptional()
  @MaxLength(50, { message: 'Status deve ter no máximo 50 caracteres' })
  status?: string;

  @IsNumber({}, { message: 'Margem estimada deve ser um número' })
  @IsOptional()
  @Min(0, { message: 'Margem estimada deve ser maior ou igual a 0' })
  estimatedMargin?: number;

  @IsNumber({}, { message: 'Valor de fechamento deve ser um número' })
  @IsOptional()
  @Min(0, { message: 'Valor de fechamento deve ser maior ou igual a 0' })
  closingValue?: number;

  @IsString({ message: 'Método de pagamento deve ser uma string' })
  @IsOptional()
  @MaxLength(50, { message: 'Método de pagamento deve ter no máximo 50 caracteres' })
  paymentMethod?: string;

  @IsString({ message: 'Motivo da perda deve ser uma string' })
  @IsOptional()
  lossReason?: string;

  @IsString({ message: 'Responsável pela comissão deve ser uma string' })
  @IsOptional()
  @MaxLength(100, { message: 'Responsável pela comissão deve ter no máximo 100 caracteres' })
  commissionResponsible?: string;

  @IsString({ message: 'Responsável pela venda deve ser uma string' })
  @IsOptional()
  @MaxLength(100, { message: 'Responsável pela venda deve ter no máximo 100 caracteres' })
  saleResponsible?: string;

  @IsNumber({}, { message: 'Reuniões agendadas deve ser um número' })
  @IsOptional()
  @Min(0, { message: 'Reuniões agendadas deve ser maior ou igual a 0' })
  scheduledMeetings?: number;

  @IsNumber({}, { message: 'Tempo no estágio deve ser um número' })
  @IsOptional()
  @Min(0, { message: 'Tempo no estágio deve ser maior ou igual a 0' })
  timeInStage?: number;

  @IsDateString({}, { message: 'Data esperada de fechamento deve ser uma data válida' })
  @IsOptional()
  expectedClosingDate?: string;

  @IsBoolean({ message: 'Documento pendente deve ser um booleano' })
  @IsOptional()
  documentPending?: boolean;

  @IsString({ message: 'Observação deve ser uma string' })
  @IsOptional()
  observation?: string;

  @IsString({ message: 'Criado por deve ser uma string' })
  @IsOptional()
  @MaxLength(100, { message: 'Criado por deve ter no máximo 100 caracteres' })
  createdBy?: string;
}





