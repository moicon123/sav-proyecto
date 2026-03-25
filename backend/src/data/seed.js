import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const levels = [
  { id: 'l1', codigo: 'pasante', nombre: 'pasante', deposito: 0, ingreso_diario: 7.20, num_tareas_diarias: 4, comision_por_tarea: 1.80, orden: 0, activo: true },
  { id: 'l2', codigo: 'S1', nombre: 'S1', deposito: 200, ingreso_diario: 7.20, num_tareas_diarias: 4, comision_por_tarea: 1.80, orden: 1, activo: true },
  { id: 'l3', codigo: 'S2', nombre: 'S2', deposito: 720, ingreso_diario: 25.76, num_tareas_diarias: 8, comision_por_tarea: 3.22, orden: 2, activo: true },
  { id: 'l4', codigo: 'S3', nombre: 'S3', deposito: 2830, ingreso_diario: 101.40, num_tareas_diarias: 15, comision_por_tarea: 6.76, orden: 3, activo: true },
  { id: 'l5', codigo: 'S4', nombre: 'S4', deposito: 9150, ingreso_diario: 339.90, num_tareas_diarias: 30, comision_por_tarea: 11.33, orden: 4, activo: false },
  { id: 'l6', codigo: 'S5', nombre: 'S5', deposito: 28200, ingreso_diario: 1045.80, num_tareas_diarias: 60, comision_por_tarea: 17.43, orden: 5, activo: false },
  { id: 'l7', codigo: 'S6', nombre: 'S6', deposito: 58000, ingreso_diario: 2235, num_tareas_diarias: 100, comision_por_tarea: 22.35, orden: 6, activo: false },
  { id: 'l8', codigo: 'S7', nombre: 'S7', deposito: 124000, ingreso_diario: 4961.60, num_tareas_diarias: 160, comision_por_tarea: 31.01, orden: 7, activo: false },
  { id: 'l9', codigo: 'S8', nombre: 'S8', deposito: 299400, ingreso_diario: 11977.50, num_tareas_diarias: 250, comision_por_tarea: 47.91, orden: 8, activo: false },
  { id: 'l10', codigo: 'S9', nombre: 'S9', deposito: 541600, ingreso_diario: 23548, num_tareas_diarias: 400, comision_por_tarea: 58.87, orden: 9, activo: false },
];

const genCode = () => Math.random().toString(36).slice(2, 10).toUpperCase();

export async function initStore() {
  const hash = await bcrypt.hash('123456', 10);
  const hashFondo = await bcrypt.hash('123456', 10);

  const adminId = uuidv4();
  const user1Id = uuidv4();
  const userA1Id = uuidv4();

  const admin = {
    id: adminId,
    telefono: '+59170000000',
    nombre_usuario: 'admin',
    nombre_real: 'Administrador',
    password_hash: await bcrypt.hash('admin123', 10),
    password_fondo_hash: hashFondo,
    codigo_invitacion: 'ADMIN001',
    nivel_id: levels[1].id,
    rol: 'admin',
    saldo_principal: 0,
    saldo_comisiones: 0,
    bloqueado: false,
  };

  const user1 = {
    id: user1Id,
    telefono: '+59163907641',
    nombre_usuario: 'alexj',
    nombre_real: 'Alexander Jimenez',
    password_hash: hash,
    password_fondo_hash: hashFondo,
    codigo_invitacion: 'VUSBV2GTX',
    invitado_por: null,
    nivel_id: levels[0].id,
    saldo_principal: 14.40,
    saldo_comisiones: 28.80,
    rol: 'usuario',
    bloqueado: false,
  };

  const userA1 = {
    id: userA1Id,
    telefono: '+59170000111',
    nombre_usuario: 'equipo_a1',
    nombre_real: 'Invitado A1',
    password_hash: hash,
    password_fondo_hash: hashFondo,
    codigo_invitacion: 'EQUIPOA1',
    invitado_por: user1Id,
    nivel_id: levels[1].id,
    saldo_principal: 300,
    saldo_comisiones: 40,
    rol: 'usuario',
    bloqueado: false,
  };

  const userA2 = {
    id: uuidv4(),
    telefono: '+59170000112',
    nombre_usuario: 'equipo_a2',
    nombre_real: 'Invitado A2',
    password_hash: hash,
    password_fondo_hash: hashFondo,
    codigo_invitacion: 'EQUIPOA2',
    invitado_por: user1Id,
    nivel_id: levels[2].id,
    saldo_principal: 520,
    saldo_comisiones: 30,
    rol: 'usuario',
    bloqueado: false,
  };

  const userB1 = {
    id: uuidv4(),
    telefono: '+59170000121',
    nombre_usuario: 'equipo_b1',
    nombre_real: 'Invitado B1',
    password_hash: hash,
    password_fondo_hash: hashFondo,
    codigo_invitacion: 'EQUIPOB1',
    invitado_por: userA1Id,
    nivel_id: levels[1].id,
    saldo_principal: 180,
    saldo_comisiones: 15,
    rol: 'usuario',
    bloqueado: false,
  };

  const testUser = {
    id: uuidv4(),
    telefono: '+59171234567',
    nombre_usuario: 'usuario_test',
    nombre_real: 'Usuario de Prueba',
    password_hash: await bcrypt.hash('password123', 10),
    password_fondo_hash: hashFondo,
    codigo_invitacion: 'TEST712',
    invitado_por: adminId,
    nivel_id: levels[0].id, // pasante
    saldo_principal: 0,
    saldo_comisiones: 0,
    rol: 'usuario',
    bloqueado: false,
  };

  const tasks = [
    { id: '7f8392a1-1b2c-4d3e-8f9a-0b1c2d3e4f5a', nivel_id: 'pasante', nombre: 'Task Trainee 1', recompensa: 1.80, video_url: '/video/adidas1.mp4', descripcion: 'Experience the fusion of high-performance engineering and innovative design with Adidas, the global leader in sports excellence.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'ADIDAS', opciones: ['ADIDAS', 'NIKE', 'PUMA', 'REEBOK'] },
    { id: '8a9b0c1d-2e3f-4a5b-6c7d-8e9f0a1b2c3d', nivel_id: 'pasante', nombre: 'Task Trainee 2', recompensa: 1.80, video_url: '/video/chanel1.mp4', descripcion: 'Discover the world of Chanel, where timeless elegance meets haute couture, redefining luxury and sophistication for the modern era.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'CHANEL', opciones: ['CHANEL', 'DIOR', 'GUCCI', 'PRADA'] },
    { id: '9b0c1d2e-3f4a-5b6c-7d8e-9f0a1b2c3d4e', nivel_id: 'pasante', nombre: 'Task Trainee 3', recompensa: 1.80, video_url: '/video/cocacola1.mp4', descripcion: 'Feel the refreshing spark of happiness with Coca-Cola, the world’s most iconic beverage that brings people together everywhere.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'COCACOLA', opciones: ['COCACOLA', 'PEPSI', 'FANTA', 'SPRITE'] },
    { id: '0c1d2e3f-4a5b-6c7d-8e9f-0a1b2c3d4e5f', nivel_id: 'pasante', nombre: 'Task Trainee 4', recompensa: 1.80, video_url: '/video/dior1.mp4', descripcion: 'Explore the sophisticated heritage of Dior, reinterpreting modern beauty through exclusive fashion and legendary French craftsmanship.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'DIOR', opciones: ['CHANEL', 'DIOR', 'HERMES', 'LV'] },
    { id: '1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a', nivel_id: 'S1', nombre: 'Task S1 - 1', recompensa: 1.80, video_url: '/video/lamborghini1.mp4', descripcion: 'Witness the ultimate power and audacious Italian design of Lamborghini, the pinnacle of high-performance supercar engineering.', pregunta: 'Select the brand', respuesta_correcta: 'LAMBORGHINI', opciones: ['LAMBORGHINI', 'FERRARI', 'PORSCHE', 'MCLAREN'] },
    { id: '2e3f4a5b-6c7d-8e9f-0a1b-2c3d4e5f6a7b', nivel_id: 'S1', nombre: 'Task S1 - 2', recompensa: 1.80, video_url: '/video/nike1.mp4', descripcion: 'Ignite your athletic spirit with Nike’s cutting-edge technology and the legendary "Just Do It" philosophy that inspires champions.', pregunta: 'Select the brand', respuesta_correcta: 'NIKE', opciones: ['NIKE', 'ADIDAS', 'PUMA', 'UNDER ARMOUR'] },
    { id: '3f4a5b6c-7d8e-9f0a-1b2c-3d4e5f6a7b8c', nivel_id: 'S1', nombre: 'Task S1 - 3', recompensa: 1.80, video_url: '/video/puma1.mp4', descripcion: 'Combine dynamic sports performance with sleek urban style through Puma’s innovative range of activewear and lifestyle products.', pregunta: 'Select the brand', respuesta_correcta: 'PUMA', opciones: ['PUMA', 'NIKE', 'ADIDAS', 'REEBOK'] },
    { id: '4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d', nivel_id: 'S1', nombre: 'Task S1 - 4', recompensa: 1.80, video_url: '/video/rolex1.mp4', descripcion: 'Step into the realm of prestige with Rolex, the global benchmark in master watchmaking, representing success and precision.', pregunta: 'Select the brand', respuesta_correcta: 'ROLEX', opciones: ['ROLEX', 'OMEGA', 'CASIO', 'CARTIER'] },
    { id: '5b6c7d8e-9f0a-1b2c-3d4e-5f6a7b8c9d0e', nivel_id: 'S2', nombre: 'Task S2 - 1', recompensa: 3.22, video_url: '/video/adidas1.mp4', descripcion: 'Adidas leads the way in sustainable sports innovation, crafting elite gear for athletes who strive for excellence daily.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'ADIDAS', opciones: ['ADIDAS', 'NIKE', 'PUMA', 'REEBOK'] },
    { id: '6c7d8e9f-0a1b-2c3d-4e5f-6a7b8c9d0e1f', nivel_id: 'S2', nombre: 'Task S2 - 2', recompensa: 3.22, video_url: '/video/nike1.mp4', descripcion: 'Experience the revolution of sports footwear with Nike, blending comfort, speed, and iconic style for every athlete.', pregunta: 'Select the brand', respuesta_correcta: 'NIKE', opciones: ['NIKE', 'ADIDAS', 'PUMA', 'REEBOK'] },
    { id: '7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a', nivel_id: 'S2', nombre: 'Task S2 - 3', recompensa: 3.22, video_url: '/video/puma1.mp4', descripcion: 'Puma redefines urban fashion, merging athletic functionality with contemporary street style for a dynamic lifestyle.', pregunta: 'Select the brand', respuesta_correcta: 'PUMA', opciones: ['PUMA', 'NIKE', 'ADIDAS', 'REEBOK'] },
    { id: '8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b', nivel_id: 'S2', nombre: 'Task S2 - 4', recompensa: 3.22, video_url: '/video/chanel1.mp4', descripcion: 'Embrace the legacy of Chanel, a symbol of freedom and elegance that continues to shape the future of high-end fashion.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'CHANEL', opciones: ['CHANEL', 'DIOR', 'GUCCI', 'PRADA'] },
    { id: '9f0a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c', nivel_id: 'S2', nombre: 'Task S2 - 5', recompensa: 3.22, video_url: '/video/cocacola1.mp4', descripcion: 'Refresh your world with Coca-Cola, the classic taste that delivers moments of pure joy and global connection.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'COCACOLA', opciones: ['COCACOLA', 'PEPSI', 'FANTA', 'SPRITE'] },
    { id: '0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', nivel_id: 'S2', nombre: 'Task S2 - 6', recompensa: 3.22, video_url: '/video/dior1.mp4', descripcion: 'Dior represents the art of living, offering a unique vision of luxury through its exquisite and sophisticated creations.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'DIOR', opciones: ['CHANEL', 'DIOR', 'HERMES', 'LV'] },
    { id: '1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', nivel_id: 'S2', nombre: 'Task S2 - 7', recompensa: 3.22, video_url: '/video/lamborghini1.mp4', descripcion: 'Feel the adrenaline of Lamborghini’s V12 engines, a masterpiece of power and aerodynamic perfection from Italy.', pregunta: 'Select the brand', respuesta_correcta: 'LAMBORGHINI', opciones: ['LAMBORGHINI', 'FERRARI', 'PORSCHE', 'MCLAREN'] },
    { id: '2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', nivel_id: 'S2', nombre: 'Task S2 - 8', recompensa: 3.22, video_url: '/video/rolex1.mp4', descripcion: 'Rolex timepieces are crafted from the finest raw materials and assembled with scrupulous attention to every detail.', pregunta: 'Select the brand', respuesta_correcta: 'ROLEX', opciones: ['ROLEX', 'OMEGA', 'CASIO', 'CARTIER'] },
    { id: '3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a', nivel_id: 'S3', nombre: 'Task S3 - 1', recompensa: 6.76, video_url: '/video/lamborghini1.mp4', descripcion: 'The Lamborghini experience is defined by uncompromising performance and a design that challenges the limits of speed.', pregunta: 'Select the brand', respuesta_correcta: 'LAMBORGHINI', opciones: ['LAMBORGHINI', 'FERRARI', 'PORSCHE', 'MCLAREN'] },
    { id: '4e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8a9b', nivel_id: 'S3', nombre: 'Task S3 - 2', recompensa: 6.76, video_url: '/video/rolex1.mp4', descripcion: 'A Rolex watch is more than just a timepiece; it is a legacy of achievement and an enduring icon of global prestige.', pregunta: 'Select the brand', respuesta_correcta: 'ROLEX', opciones: ['ROLEX', 'OMEGA', 'CASIO', 'CARTIER'] },
    { id: '5f6a7b8c-9d0e-1f2a-3b4c-5d6e7f8a9b0c', nivel_id: 'S3', nombre: 'Task S3 - 3', recompensa: 6.76, video_url: '/video/adidas1.mp4', descripcion: 'Push your boundaries with Adidas performance gear, designed to empower athletes through advanced sports science.', pregunta: 'Select the brand', respuesta_correcta: 'ADIDAS', opciones: ['ADIDAS', 'NIKE', 'PUMA', 'REEBOK'] },
    { id: '6a7b8c9d-0e1f-2a3b-4c5d-6e7f8a9b0c1d', nivel_id: 'S3', nombre: 'Task S3 - 4', recompensa: 6.76, video_url: '/video/nike1.mp4', descripcion: 'Nike continues to innovate, creating the future of sport by providing inspiration and innovation to every athlete.', pregunta: 'Select the brand', respuesta_correcta: 'NIKE', opciones: ['NIKE', 'ADIDAS', 'PUMA', 'UNDER ARMOUR'] },
    { id: '7b8c9d0e-1f2a-3b4c-5d6e-7f8a9b0c1d2e', nivel_id: 'S3', nombre: 'Task S3 - 5', recompensa: 6.76, video_url: '/video/puma1.mp4', descripcion: 'Puma’s Forever Faster spirit drives the brand to create the fastest products for the world’s fastest athletes.', pregunta: 'Select the brand', respuesta_correcta: 'PUMA', opciones: ['PUMA', 'NIKE', 'ADIDAS', 'REEBOK'] },
    { id: '8c9d0e1f-2a3b-4c5d-6e7f-8a9b0c1d2e3f', nivel_id: 'S3', nombre: 'Task S3 - 6', recompensa: 6.76, video_url: '/video/chanel1.mp4', descripcion: 'Chanel haute couture is an extraordinary display of craftsmanship, bringing artistic vision to the world of fashion.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'CHANEL', opciones: ['CHANEL', 'DIOR', 'GUCCI', 'PRADA'] },
    { id: '9d0e1f2a-3b4c-5d6e-7f8a-9b0c1d2e3f4a', nivel_id: 'S3', nombre: 'Task S3 - 7', recompensa: 6.76, video_url: '/video/cocacola1.mp4', descripcion: 'Coca-Cola represents a global culture of sharing and optimism, refreshing the world one bottle at a time.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'COCACOLA', opciones: ['COCACOLA', 'PEPSI', 'FANTA', 'SPRITE'] },
    { id: '0e1f2a3b-4c5d-6e7f-8a9b-0c1d2e3f4a5b', nivel_id: 'S3', nombre: 'Task S3 - 8', recompensa: 6.76, video_url: '/video/dior1.mp4', descripcion: 'Dior’s legendary elegance is reflected in every detail, from its iconic fashion collections to its world-class perfumes.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'DIOR', opciones: ['CHANEL', 'DIOR', 'HERMES', 'LV'] },
    { id: '1f2a3b4c-5d6e-7f8a-9b0c-1d2e3f4a5b6c', nivel_id: 'S3', nombre: 'Task S3 - 9', recompensa: 6.76, video_url: '/video/lamborghini1.mp4', descripcion: 'Discover the innovation behind Lamborghini’s hybrid supercars, merging future technology with raw Italian power.', pregunta: 'Select the brand', respuesta_correcta: 'LAMBORGHINI', opciones: ['LAMBORGHINI', 'FERRARI', 'PORSCHE', 'MCLAREN'] },
    { id: '2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d', nivel_id: 'S3', nombre: 'Task S3 - 10', recompensa: 6.76, video_url: '/video/rolex1.mp4', descripcion: 'The Rolex Oyster Perpetual is the ultimate symbol of timeless style and waterproof watchmaking excellence.', pregunta: 'Select the brand', respuesta_correcta: 'ROLEX', opciones: ['ROLEX', 'OMEGA', 'CASIO', 'CARTIER'] },
    { id: '3b4c5d6e-7f8a-9b0c-1d2e-3f4a5b6c7d8e', nivel_id: 'S3', nombre: 'Task S3 - 11', recompensa: 6.76, video_url: '/video/adidas1.mp4', descripcion: 'Adidas Originals brings the spirit of the archives to the streets, celebrating heritage and modern culture.', pregunta: 'Select the brand', respuesta_correcta: 'ADIDAS', opciones: ['ADIDAS', 'NIKE', 'PUMA', 'REEBOK'] },
    { id: '4c5d6e7f-8a9b-0c1d-2e3f-4a5b6c7d8e9f', nivel_id: 'S3', nombre: 'Task S3 - 12', recompensa: 6.76, video_url: '/video/nike1.mp4', descripcion: 'Nike’s mission is to bring inspiration and innovation to every athlete* in the world (*if you have a body, you are an athlete).', pregunta: 'Select the brand', respuesta_correcta: 'NIKE', opciones: ['NIKE', 'ADIDAS', 'PUMA', 'REEBOK'] },
    { id: '5d6e7f8a-9b0c-1d2e-3f4a-5b6c7d8e9f0a', nivel_id: 'S3', nombre: 'Task S3 - 13', recompensa: 6.76, video_url: '/video/puma1.mp4', descripcion: 'Experience the dynamic energy of Puma’s collaborations with world-class designers and elite athletes.', pregunta: 'Select the brand', respuesta_correcta: 'PUMA', opciones: ['PUMA', 'NIKE', 'ADIDAS', 'REEBOK'] },
    { id: '6e7f8a9b-0c1d-2e3f-4a5b-6c7d8e9f0a1b', nivel_id: 'S3', nombre: 'Task S3 - 14', recompensa: 6.76, video_url: '/video/chanel1.mp4', descripcion: 'Luxury fashion meets artistic expression in every Chanel collection, setting the global standard for style.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'CHANEL', opciones: ['CHANEL', 'DIOR', 'GUCCI', 'PRADA'] },
    { id: '7f8a9b0c-1d2e-3f4a-5b6c-7d8e9f0a1b2c', nivel_id: 'S3', nombre: 'Task S3 - 15', recompensa: 6.76, video_url: '/video/cocacola1.mp4', descripcion: 'Coca-Cola Zero Sugar offers the same great taste you love without the sugar, refreshing your day anytime.', pregunta: 'Which brand is promoted?', respuesta_correcta: 'COCACOLA', opciones: ['COCACOLA', 'PEPSI', 'FANTA', 'SPRITE'] },
  ];

  const banners = [
    { id: uuidv4(), imagen_url: '/imag/carrusel1.jpeg', titulo: 'Banner 1', orden: 0, activo: true },
    { id: uuidv4(), imagen_url: '/imag/carrusel2.jpeg', titulo: 'Banner 2', orden: 1, activo: true },
    { id: uuidv4(), imagen_url: '/imag/carrusel3.jpeg', titulo: 'Banner 3', orden: 2, activo: true },
    { id: uuidv4(), imagen_url: '/imag/carrusel4.jpeg', titulo: 'Banner 4', orden: 3, activo: true },
  ];

  const tarjetas = [
    { id: uuidv4(), usuario_id: user1Id, tipo: 'yape', numero_masked: '7945', nombre_banco: 'yape' },
  ];

  const metodosQr = [
    { id: uuidv4(), nombre_titular: 'SAV Cobro', imagen_qr_url: '', imagen_base64: null, activo: true, orden: 0 },
  ];

  const retiros = [
    { id: uuidv4(), usuario_id: user1Id, monto: 500, estado: 'pendiente', created_at: new Date().toISOString() },
  ];

  return {
    users: [admin, user1, userA1, userA2, userB1, testUser],
    levels,
    tasks,
    metodosQr,
    banners,
    tarjetas,
    retiros,
    recargas: [],
    transacciones: [],
    notificaciones: [
      { id: uuidv4(), usuario_id: user1Id, titulo: 'Bienvenido', mensaje: '¡Bienvenido a SAV!', leida: false },
    ],
    publicContent: {
      home_guide: 'GUIA PARA PRINCIPIANTES. LIDERANDO EL FUTURO. ALCANZA TUS SUENOS.',
      popup_title: 'Aviso',
      popup_message: 'Bienvenido a SAV. Revisa tareas y notificaciones nuevas.',
      popup_enabled: true,
      conferencia_title: 'Noticias de conferencia',
      conferencia_noticias:
        '• Reunión general: sábado 10:00\n• Tema: nuevos niveles y bonos\n• Enlace de Zoom: (lo publicará el admin)\n• Recordatorio: traer código de invitación',
      horario_recarga: {
        enabled: false,
        dias_semana: [1, 2, 3, 4, 5, 6, 0],
        hora_inicio: '09:00',
        hora_fin: '18:00',
      },
      horario_retiro: {
        enabled: false,
        dias_semana: [1, 2, 3, 4, 5, 6, 0],
        hora_inicio: '09:00',
        hora_fin: '18:00',
      },
    },
  };
}
