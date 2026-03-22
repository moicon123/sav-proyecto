import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { findUserByTelefono, findUserByCodigo, createUser, getLevels, updateUser } from '../lib/queries.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sav-demo-secret';

router.post('/register', async (req, res) => {
  try {
    const { telefono, nombre_usuario, password, codigo_invitacion, deviceId } = req.body;
    if (!telefono || !nombre_usuario || !password || !codigo_invitacion) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const exists = await findUserByTelefono(telefono);
    if (exists) return res.status(400).json({ error: 'Teléfono ya registrado' });
    const inviter = await findUserByCodigo(codigo_invitacion);
    if (!inviter) return res.status(400).json({ error: 'Código de invitación inválido' });
    const codigo = Math.random().toString(36).slice(2, 10).toUpperCase();
    const levels = await getLevels();
    const user = {
      id: uuidv4(),
      telefono,
      nombre_usuario,
      nombre_real: nombre_usuario,
      password_hash: await bcrypt.hash(password, 10),
      codigo_invitacion: codigo,
      invitado_por: inviter.id,
      nivel_id: levels[0].id,
      saldo_principal: 0,
      saldo_comisiones: 0,
      rol: 'usuario',
      bloqueado: false,
      oportunidades_sorteo: 1,
      last_device_id: deviceId || null,
    };
    await createUser(user);
    const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: sanitizeUser(user, levels), token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { telefono, password, deviceId } = req.body;
    const user = await findUserByTelefono(telefono);
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    if (user.bloqueado) return res.status(401).json({ error: 'Cuenta bloqueada' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });

    if (deviceId) {
      await updateUser(user.id, { last_device_id: deviceId });
    }

    const levels = await getLevels();
    const token = jwt.sign({ id: user.id, rol: user.rol }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: sanitizeUser(user, levels), token });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function sanitizeUser(u, levels) {
  const level = levels.find(l => l.id === u.nivel_id);
  return {
    id: u.id,
    telefono: u.telefono,
    nombre_usuario: u.nombre_usuario,
    nombre_real: u.nombre_real,
    codigo_invitacion: u.codigo_invitacion,
    nivel: level?.nombre || 'pasante',
    nivel_id: u.nivel_id,
    nivel_codigo: level?.codigo || 'internar',
    saldo_principal: u.saldo_principal || 0,
    saldo_comisiones: u.saldo_comisiones || 0,
    rol: u.rol,
    avatar_url: u.avatar_url,
    oportunidades_sorteo: u.oportunidades_sorteo ?? 0,
    tiene_password_fondo: !!u.password_fondo_hash,
  };
}

export default router;
