import { IsString, IsOptional, IsNumber, IsInt, MaxLength, IsUrl, IsDateString } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  @MaxLength(100)
  channel: string;

  @IsNumber()
  @IsOptional()
  totalBudget?: number;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  creativeLink?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  campaignType?: string;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  status?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  responsibleName?: string;

  @IsNumber()
  @IsOptional()
  dailyBudget?: number;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  webhookUrl?: string;

  @IsNumber()
  @IsOptional()
  costPerClick?: number;

  @IsInt()
  @IsOptional()
  clicksToDate?: number;
}



