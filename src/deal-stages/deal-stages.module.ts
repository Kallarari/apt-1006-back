import { Module } from '@nestjs/common';
import { DealStagesService } from './deal-stages.service';
import { DealStagesController } from './deal-stages.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DealStagesController],
  providers: [DealStagesService],
  exports: [DealStagesService],
})
export class DealStagesModule {}


