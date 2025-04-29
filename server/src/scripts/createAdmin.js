const { User } = require('../models');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('Ya existe un administrador con las siguientes credenciales:');
      console.log('Email:', existingAdmin.email);
      console.log('Contraseña: admin123');
      return;
    }

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Administrador creado exitosamente con las siguientes credenciales:');
    console.log('Email: admin@example.com');
    console.log('Contraseña: admin123');
  } catch (error) {
    console.error('Error al crear administrador:', error);
  }
};

createAdmin(); 