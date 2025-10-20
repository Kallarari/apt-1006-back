import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController, LeadsPublicController } from './leads.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [LeadsController, LeadsPublicController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}





