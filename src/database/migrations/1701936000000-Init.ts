import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class Init1701936000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'login',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
        ],
      }),
      true,
    );

    // Create artists table
    await queryRunner.createTable(
      new Table({
        name: 'artist',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'grammy',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
        ],
      }),
      true,
    );

    // Create albums table
    await queryRunner.createTable(
      new Table({
        name: 'album',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'artistId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'year',
            type: 'int',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
        ],
      }),
      true,
    );

    // Create tracks table
    await queryRunner.createTable(
      new Table({
        name: 'track',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'artistId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'albumId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'int',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
        ],
      }),
      true,
    );

    // Create favorites table
    await queryRunner.createTable(
      new Table({
        name: 'favorites',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'artistId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'albumId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'trackId',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'version',
            type: 'int',
            default: 1,
          },
        ],
      }),
      true,
    );

    // Add foreign keys for albums
    await queryRunner.createForeignKey(
      'album',
      new TableForeignKey({
        columnNames: ['artistId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'artist',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign keys for tracks
    await queryRunner.createForeignKey(
      'track',
      new TableForeignKey({
        columnNames: ['artistId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'artist',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'track',
      new TableForeignKey({
        columnNames: ['albumId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'album',
        onDelete: 'SET NULL',
      }),
    );

    // Add foreign keys for favorites
    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['artistId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'artist',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['albumId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'album',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'favorites',
      new TableForeignKey({
        columnNames: ['trackId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'track',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const favoritesTable = await queryRunner.getTable('favorites');
    const albumTable = await queryRunner.getTable('album');
    const trackTable = await queryRunner.getTable('track');

    if (favoritesTable) {
      const foreignKeys = favoritesTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('favorites', fk);
      }
    }

    if (trackTable) {
      const foreignKeys = trackTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('track', fk);
      }
    }

    if (albumTable) {
      const foreignKeys = albumTable.foreignKeys;
      for (const fk of foreignKeys) {
        await queryRunner.dropForeignKey('album', fk);
      }
    }

    // Drop tables in reverse order
    await queryRunner.dropTable('favorites', true);
    await queryRunner.dropTable('track', true);
    await queryRunner.dropTable('album', true);
    await queryRunner.dropTable('artist', true);
    await queryRunner.dropTable('user', true);
  }
}
