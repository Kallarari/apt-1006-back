import { ConfigService } from '@nestjs/config';

export function getDatabaseUrl(configService: ConfigService): string {
  const dbUser = configService.get<string>('DB_USER');
  const dbPassword = configService.get<string>('DB_PASSWORD');
  const dbHost = configService.get<string>('DB_HOST');
  const dbPort = configService.get<string>('DB_PORT');
  const dbDatabase = configService.get<string>('DB_DATABASE');

  if (!dbUser || !dbPassword || !dbHost || !dbPort || !dbDatabase) {
    throw new Error('Missing required database environment variables');
  }

  // URL encode a senha para evitar problemas com caracteres especiais
  const encodedPassword = encodeURIComponent(dbPassword);
  
  // Configurações para Supabase com pgbouncer para evitar prepared statements
  return `postgresql://${dbUser}:${encodedPassword}@${dbHost}:${dbPort}/${dbDatabase}?pgbouncer=true&connection_limit=1&pool_timeout=20&statement_timeout=0&prepared_statements=false`;
}

