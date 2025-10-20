import { Module } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CampaignsController, CampaignsPublicController } from './campaigns.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CampaignsController, CampaignsPublicController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}


