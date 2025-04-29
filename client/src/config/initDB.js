const sequelize = require('./database');
const User = require('../models/User')(sequelize);

const initDB = async () => {
  try {
    // Sincronizar todos los modelos
    await sequelize.sync({ force: true });
    console.log('Database synchronized successfully');

    // Crear usuario administrador por defecto
    await User.create({
      name: 'Admin',
      email: 'admin@market.com',
      password: 'admin1234',
      role: 'admin'
    });
    console.log('Admin user created successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Cerrar la conexión
    await sequelize.close();
  }
};

initDB(); 