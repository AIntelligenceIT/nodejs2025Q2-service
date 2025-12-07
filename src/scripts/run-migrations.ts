import AppDataSource from '../database/typeorm.config';

async function run() {
  try {
    console.log('[migrations] Initializing data source...');
    const ds = AppDataSource;
    if (!ds.isInitialized) {
      await ds.initialize();
    }
    console.log('[migrations] Running pending migrations...');
    const res = await ds.runMigrations();
    console.log('[migrations] Migrations executed:', res.map(r => r.name));
    await ds.destroy();
    console.log('[migrations] Done.');
  } catch (err) {
    console.error('[migrations] Error running migrations:', err);
    process.exit(1);
  }
}

run();
