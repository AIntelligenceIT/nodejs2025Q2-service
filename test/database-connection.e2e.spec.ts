import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from '../src/database/entities/user.entity'; // Zaimportuj przynajmniej jedną encję

describe('Database Connection (E2E)', () => {
  let dataSource: DataSource;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    // Konfiguracja modułu testowego podobna do AppModule, ale tylko z potrzebnymi elementami
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env', // Upewnij się, że ścieżka jest poprawna z kontekstu testów
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
            const dbConfig = {
              type: 'postgres' as const,
              host: configService.get<string>('POSTGRES_HOST'),
              port: parseInt(configService.get<string>('POSTGRES_PORT') || '5432', 10),
              username: configService.get<string>('POSTGRES_USER'),
              password: configService.get<string>('POSTGRES_PASSWORD'),
              database: configService.get<string>('POSTGRES_DB'),
              entities: [UserEntity], // Wystarczy jedna encja do testu połączenia
              synchronize: false, // Nie synchronizuj schematu w tym teście
              logging: false, // Wyłącz logowanie dla tego testu
            };
            console.log('[DB_CONN_TEST] Attempting to connect with config:', { ...dbConfig, password: dbConfig.password ? '***' : undefined });
            return dbConfig;
          },
          // Utwórz DataSource bezpośrednio, aby móc go zainicjować i zniszczyć
          dataSourceFactory: async (options: DataSourceOptions) => {
            const ds = new DataSource(options);
            return ds;
          },
        }),
      ],
    }).compile();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  it('should successfully connect to the database', async () => {
    expect(dataSource).toBeDefined();
    // Zakładamy, że TypeOrmModule.forRootAsync już zainicjowało połączenie
    // Jeśli dataSource jest zdefiniowane i isInitialized jest true, połączenie jest aktywne
    expect(dataSource.isInitialized).toBe(true);
    
    // Opcjonalnie: wykonaj proste zapytanie, np. SELECT 1
    const result = await dataSource.query('SELECT 1 as result');
    expect(result[0].result).toBe(1);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
    if (moduleFixture) {
      await moduleFixture.close();
    }
  });
});