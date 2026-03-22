import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const levels = [
  { id: 'l1', codigo: 'pasante', nombre: 'pasante', deposito: 0, ingreso_diario: 7.20, num_tareas_diarias: 4, comision_por_tarea: 1.80 },
  { id: 'l2', codigo: 'S1', nombre: 'S1', deposito: 200, ingreso_diario: 7.20, num_tareas_diarias: 4, comision_por_tarea: 1.80 },
  { id: 'l3', codigo: 'S2', nombre: 'S2', deposito: 720, ingreso_diario: 25.76, num_tareas_diarias: 8, comision_por_tarea: 3.22 },
  { id: 'l4', codigo: 'S3', nombre: 'S3', deposito: 2830, ingreso_diario: 101.40, num_tareas_diarias: 15, comision_por_tarea: 6.76 },
  { id: 'l5', codigo: 'S4', nombre: 'S4', deposito: 9150, ingreso_diario: 339.90, num_tareas_diarias: 30, comision_por_tarea: 11.33 },
  { id: 'l6', codigo: 'S5', nombre: 'S5', deposito: 28200, ingreso_diario: 1045.80, num_tareas_diarias: 60, comision_por_tarea: 17.43 },
  { id: 'l7', codigo: 'S6', nombre: 'S6', deposito: 58000, ingreso_diario: 2235, num_tareas_diarias: 100, comision_por_tarea: 22.35 },
  { id: 'l8', codigo: 'S7', nombre: 'S7', deposito: 124000, ingreso_diario: 4961.60, num_tareas_diarias: 160, comision_por_tarea: 31.01 },
  { id: 'l9', codigo: 'S8', nombre: 'S8', deposito: 299400, ingreso_diario: 11977.50, num_tareas_diarias: 250, comision_por_tarea: 47.91 },
  { id: 'l10', codigo: 'S9', nombre: 'S9', deposito: 541600, ingreso_diario: 23548, num_tareas_diarias: 400, comision_por_tarea: 58.87 },
];

const genCode = () => Math.random().toString(36).slice(2, 10).toUpperCase();

export async function initStore() {
  const hash = await bcrypt.hash('123456', 10);
  const hashFondo = await bcrypt.hash('123456', 10);

  const admin = {
    id: uuidv4(),
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
    oportunidades_sorteo: 10,
  };

  const user1 = {
    id: uuidv4(),
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
    oportunidades_sorteo: 3,
  };

  const userA1 = {
    id: uuidv4(),
    telefono: '+59170000111',
    nombre_usuario: 'equipo_a1',
    nombre_real: 'Invitado A1',
    password_hash: hash,
    password_fondo_hash: hashFondo,
    codigo_invitacion: 'EQUIPOA1',
    invitado_por: user1.id,
    nivel_id: levels[1].id,
    saldo_principal: 300,
    saldo_comisiones: 40,
    rol: 'usuario',
    bloqueado: false,
    oportunidades_sorteo: 1,
  };

  const userA2 = {
    id: uuidv4(),
    telefono: '+59170000112',
    nombre_usuario: 'equipo_a2',
    nombre_real: 'Invitado A2',
    password_hash: hash,
    password_fondo_hash: hashFondo,
    codigo_invitacion: 'EQUIPOA2',
    invitado_por: user1.id,
    nivel_id: levels[2].id,
    saldo_principal: 520,
    saldo_comisiones: 30,
    rol: 'usuario',
    bloqueado: false,
    oportunidades_sorteo: 1,
  };

  const userB1 = {
    id: uuidv4(),
    telefono: '+59170000121',
    nombre_usuario: 'equipo_b1',
    nombre_real: 'Invitado B1',
    password_hash: hash,
    password_fondo_hash: hashFondo,
    codigo_invitacion: 'EQUIPOB1',
    invitado_por: userA1.id,
    nivel_id: levels[1].id,
    saldo_principal: 180,
    saldo_comisiones: 15,
    rol: 'usuario',
    bloqueado: false,
    oportunidades_sorteo: 0,
  };

  const newUser = {
    id: uuidv4(),
    telefono: '+59174344916',
    nombre_usuario: 'usuario_74344916',
    nombre_real: 'Usuario Nuevo',
    password_hash: hash,
    password_fondo_hash: hashFondo,
    codigo_invitacion: genCode(),
    invitado_por: admin.id,
    nivel_id: levels[0].id, // pasante
    saldo_principal: 0,
    saldo_comisiones: 0,
    rol: 'usuario',
    bloqueado: false,
    oportunidades_sorteo: 1,
  };

  const tasks = [
    { id: uuidv4(), nivel_id: levels[0].id, nombre: 'Tarea Pasante 1', recompensa: 1.80, video_url: 'https://placehold.co/400x300?text=Video+1', pregunta: '¿Qué marca se promociona?', respuesta_correcta: 'CHANEL', opciones: ['CHANEL', 'HERMES', 'DIOR', 'LV'] },
    { id: uuidv4(), nivel_id: levels[0].id, nombre: 'Tarea Pasante 2', recompensa: 1.80, video_url: 'https://placehold.co/400x300?text=Video+2', pregunta: '¿Qué marca se promociona?', respuesta_correcta: 'HERMES', opciones: ['CHANEL', 'HERMES'] },
    { id: uuidv4(), nivel_id: levels[0].id, nombre: 'Tarea Pasante 3', recompensa: 1.80, video_url: 'https://placehold.co/400x300?text=Video+3', pregunta: '¿Qué marca se promociona?', respuesta_correcta: 'DIOR', opciones: ['CHANEL', 'DIOR'] },
    { id: uuidv4(), nivel_id: levels[0].id, nombre: 'Tarea Pasante 4', recompensa: 1.80, video_url: 'https://placehold.co/400x300?text=Video+4', pregunta: '¿Qué marca se promociona?', respuesta_correcta: 'LV', opciones: ['LV', 'GUCCI'] },
    { id: uuidv4(), nivel_id: levels[1].id, nombre: 'Tarea S1 - 1', recompensa: 1.80, video_url: 'https://placehold.co/400x300?text=Video+S1+1', pregunta: 'Selecciona la marca', respuesta_correcta: 'COCA-COLA', opciones: ['COCA-COLA', 'PEPSI'] },
    { id: uuidv4(), nivel_id: levels[1].id, nombre: 'Tarea S1 - 2', recompensa: 1.80, video_url: 'https://placehold.co/400x300?text=Video+S1+2', pregunta: 'Selecciona la marca', respuesta_correcta: 'PEPSI', opciones: ['COCA-COLA', 'PEPSI'] },
    { id: uuidv4(), nivel_id: levels[1].id, nombre: 'Tarea S1 - 3', recompensa: 1.80, video_url: 'https://placehold.co/400x300?text=Video+S1+3', pregunta: 'Selecciona la marca', respuesta_correcta: 'FANTA', opciones: ['FANTA', 'SPRITE'] },
    { id: uuidv4(), nivel_id: levels[1].id, nombre: 'Tarea S1 - 4', recompensa: 1.80, video_url: 'https://placehold.co/400x300?text=Video+S1+4', pregunta: 'Selecciona la marca', respuesta_correcta: 'SPRITE', opciones: ['FANTA', 'SPRITE'] },
  ];

  const banners = [
    { id: uuidv4(), imagen_url: '/imag/carrusel1.jpeg', titulo: 'Banner 1', orden: 0, activo: true },
    { id: uuidv4(), imagen_url: '/imag/carrusel2.jpeg', titulo: 'Banner 2', orden: 1, activo: true },
    { id: uuidv4(), imagen_url: '/imag/carrusel3.jpeg', titulo: 'Banner 3', orden: 2, activo: true },
    { id: uuidv4(), imagen_url: '/imag/carrusel4.jpeg', titulo: 'Banner 4', orden: 3, activo: true },
  ];

  const tarjetas = [
    { id: uuidv4(), usuario_id: user1.id, tipo: 'yape', numero_masked: '7945', nombre_banco: 'yape' },
  ];

  const metodosQr = [
    { id: uuidv4(), nombre_titular: 'SAV Cobro', imagen_qr_url: '', imagen_base64: null, activo: true, orden: 0 },
  ];

  const retiros = [
    { id: uuidv4(), usuario_id: user1.id, monto: 500, estado: 'pendiente', created_at: new Date().toISOString() },
  ];

  return {
    users: [admin, user1, userA1, userA2, userB1, newUser],
    levels,
    tasks,
    metodosQr,
    banners,
    tarjetas,
    retiros,
    recargas: [],
    transacciones: [],
    notificaciones: [
      { id: uuidv4(), usuario_id: user1.id, titulo: 'Bienvenido', mensaje: '¡Bienvenido a SAV!', leida: false },
    ],
    premiosRuleta: [
      { id: uuidv4(), nombre: '0.01 BOB', valor: 0.01, color: '#f59e0b', probabilidad: 0.15, orden: 0, activo: true },
      { id: uuidv4(), nombre: '0.02 BOB', valor: 0.02, color: '#ea580c', probabilidad: 0.15, orden: 1, activo: true },
      { id: uuidv4(), nombre: '1 BOB', valor: 1, color: '#e11d48', probabilidad: 0.15, orden: 2, activo: true },
      { id: uuidv4(), nombre: '5 BOB', valor: 5, color: '#db2777', probabilidad: 0.12, orden: 3, activo: true },
      { id: uuidv4(), nombre: '10 BOB', valor: 10, color: '#c026d3', probabilidad: 0.1, orden: 4, activo: true },
      { id: uuidv4(), nombre: '50 BOB', valor: 50, color: '#7c3aed', probabilidad: 0.08, orden: 5, activo: true },
      { id: uuidv4(), nombre: '100 BOB', valor: 100, color: '#4f46e5', probabilidad: 0.04, orden: 6, activo: true },
      { id: uuidv4(), nombre: '10000 BOB', valor: 10000, color: '#059669', probabilidad: 0.01, orden: 7, activo: true },
    ],
    sorteosGanadores: [
      { id: uuidv4(), usuario_id: user1.id, premio_nombre: '1 BOB', premio_valor: 1, premio_color: '#e11d48', created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: uuidv4(), usuario_id: null, premio_nombre: '0.02 BOB', premio_valor: 0.02, premio_color: '#ea580c', created_at: new Date(Date.now() - 172800000).toISOString() },
      { id: uuidv4(), usuario_id: null, premio_nombre: '10000 BOB', premio_valor: 10000, premio_color: '#059669', created_at: new Date(Date.now() - 259200000).toISOString() },
      { id: uuidv4(), usuario_id: null, premio_nombre: '5 BOB', premio_valor: 5, premio_color: '#db2777', created_at: new Date(Date.now() - 345600000).toISOString() },
      { id: uuidv4(), usuario_id: null, premio_nombre: '0.01 BOB', premio_valor: 0.01, premio_color: '#f59e0b', created_at: new Date(Date.now() - 432000000).toISOString() },
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
