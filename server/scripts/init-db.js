const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function runMigrations() {
  try {
    console.log('Ejecutando migraciones...');
    await execAsync('npx sequelize-cli db:migrate');
    console.log('Migraciones ejecutadas exitosamente');
  } catch (error) {
    console.error('Error al ejecutar las migraciones:', error);
  }
}

runMigrations(); 