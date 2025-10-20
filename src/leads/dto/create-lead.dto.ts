import { 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsEmail, 
  MaxLength, 
  Min, 
  IsInt 
} from 'class-validator';

export class CreateLeadDto {
  @IsInt({ message: 'Business ID deve ser um número inteiro' })
  @IsOptional()
  businessId?: number;

  @IsString({ message: 'Status do lead deve ser uma string' })
  @IsOptional()
  @MaxLength(50, { message: 'Status do lead deve ter no máximo 50 caracteres' })
  leadStatus?: string;

  @IsString({ message: 'Primeiro nome deve ser uma string' })
  @IsOptional()
  @MaxLength(100, { message: 'Primeiro nome deve ter no máximo 100 caracteres' })
  firstName?: string;

  @IsString({ message: 'Sobrenome deve ser uma string' })
  @IsOptional()
  @MaxLength(100, { message: 'Sobrenome deve ter no máximo 100 caracteres' })
  lastName?: string;

  @IsEmail({}, { message: 'Email deve ser um endereço de email válido' })
  @IsOptional()
  @MaxLength(150, { message: 'Email deve ter no máximo 150 caracteres' })
  email?: string;

  @IsString({ message: 'CPF/CNPJ deve ser uma string' })
  @IsOptional()
  @MaxLength(20, { message: 'CPF/CNPJ deve ter no máximo 20 caracteres' })
  cpfCnpj?: string;

  @IsString({ message: 'Telefone deve ser uma string' })
  @IsOptional()
  @MaxLength(20, { message: 'Telefone deve ter no máximo 20 caracteres' })
  phone?: string;

  @IsString({ message: 'Telefone 2 deve ser uma string' })
  @IsOptional()
  @MaxLength(20, { message: 'Telefone 2 deve ter no máximo 20 caracteres' })
  phone2?: string;

  @IsString({ message: 'Tipo de pessoa deve ser uma string' })
  @IsOptional()
  @MaxLength(10, { message: 'Tipo de pessoa deve ter no máximo 10 caracteres' })
  personType?: string;

  @IsString({ message: 'Dispositivo usado deve ser uma string' })
  @IsOptional()
  @MaxLength(100, { message: 'Dispositivo usado deve ter no máximo 100 caracteres' })
  deviceUsed?: string;

  @IsString({ message: 'ID da campanha deve ser uma string' })
  @IsOptional()
  @MaxLength(50, { message: 'ID da campanha deve ter no máximo 50 caracteres' })
  campaignId?: string;

  @IsString({ message: 'URL da foto deve ser uma string' })
  @IsOptional()
  photoUrl?: string;

  @IsString({ message: 'Motivo do interesse deve ser uma string' })
  @IsOptional()
  interestReason?: string;

  @IsNumber({}, { message: 'Ticket médio estimado deve ser um número' })
  @IsOptional()
  @Min(0, { message: 'Ticket médio estimado deve ser maior ou igual a 0' })
  estimatedAverageTicket?: number;
}





