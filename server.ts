// ========================================================
// BANUARASA WEEKEND MARKET - SECURE BACKEND API GATEWAY
// Production-Ready Domain Separation & PII Protection
// ========================================================

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

// Konfigurasi parser dengan limit wajar (tanpa payload 50MB Base64 raksasa)
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// In-Memory Token Session Store
interface ActiveSession {
  token: string;
  userId: string;
  memberId?: string;
  username: string;
  role: string;
  createdAt: number;
}
const activeSessions = new Map<string, ActiveSession>();

// Inisialisasi Mock Master Users (Keamanan: Password disimpan dalam hash SHA-256)
const hashPassword = (plainText: string) => {
  return crypto.createHash('sha256').update(plainText).digest('hex');
};

const SYSTEM_ACCOUNTS = [
  {
    userId: 'USR-SUPERADMIN',
    username: 'superadmin',
    passwordHash: hashPassword('Banu@rasa2026!'), // Ganti kredensial default yang aman
    role: 'SUPER_ADMIN',
    fullName: 'Super Administrator Banuarasa'
  },
  {
    userId: 'USR-ADM-KOP',
    username: 'adminkoperasi',
    passwordHash: hashPassword('KoperasiBwm#2026'),
    role: 'ADMIN_KOPERASI',
    fullName: 'Admin Pengurus Koperasi'
  },
  {
    userId: 'USR-ADM-EVT',
    username: 'adminevent',
    passwordHash: hashPassword('EventBwm#2026'),
    role: 'ADMIN_EVENT',
    fullName: 'Admin Pelaksana Event'
  }
];

// Helper: Logging Audit Trail Server
const logAudit = (actor: string, role: string, action: string, details: string) => {
  const timestampWita = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Makassar',
    dateStyle: 'short',
    timeStyle: 'medium'
  }).format(new Date()).replace(' ', 'T') + '+08:00';

  console.log(`[AUDIT] ${timestampWita} | ${role} (${actor}) -> ${action}: ${details}`);
};

// --------------------------------------------------------
// AUTH MIDDLEWARES
// --------------------------------------------------------

interface AuthenticatedRequest extends Request {
  userSession?: ActiveSession;
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Akses ditolak. Token sesi tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    return res.status(401).json({ success: false, error: 'Sesi kedaluwarsa atau tidak valid. Silakan login kembali.' });
  }

  req.userSession = session;
  next();
};

const requireRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.userSession || !allowedRoles.includes(req.userSession.role)) {
      return res.status(403).json({ success: false, error: 'Akses ditolak. Peran Anda tidak memiliki izin untuk fitur ini.' });
    }
    next();
  };
};

// --------------------------------------------------------
// AUTH ROUTES
// --------------------------------------------------------

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username/Email dan password wajib diisi.' });
  }

  const inputHash = hashPassword(password);
  const matchedUser = SYSTEM_ACCOUNTS.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === inputHash
  );

  if (!matchedUser) {
    logAudit(username, 'GUEST', 'LOGIN_FAILED', 'Percobaan login gagal dengan kredensial tidak cocok');
    return res.status(401).json({ success: false, error: 'Username atau kata sandi tidak cocok.' });
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  const sessionData: ActiveSession = {
    token: sessionToken,
    userId: matchedUser.userId,
    username: matchedUser.username,
    role: matchedUser.role,
    createdAt: Date.now()
  };

  activeSessions.set(sessionToken, sessionData);
  logAudit(matchedUser.fullName, matchedUser.role, 'LOGIN_SUCCESS', 'Berhasil login ke sistem');

  return res.json({
    success: true,
    data: {
      token: sessionToken,
      user: {
        user_id: matchedUser.userId,
        username: matchedUser.username,
        role: matchedUser.role,
        nama_lengkap: matchedUser.fullName
      }
    }
  });
});

app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.userSession) {
    activeSessions.delete(req.userSession.token);
    logAudit(req.userSession.username, req.userSession.role, 'LOGOUT', 'Sesi berhasil diakhiri');
  }
  return res.json({ success: true, message: 'Berhasil keluar dari sistem.' });
});

// --------------------------------------------------------
// 1. PUBLIC ROUTES (Tanpa NIK, Alamat, Nomor HP, atau Password)
// --------------------------------------------------------

app.get('/api/public/events', (_req: Request, res: Response) => {
  // Hanya mengirimkan data acara tanpa informasi peserta pribadi
  return res.json({
    success: true,
    data: [
      {
        event_id: 'EVT-2026-001',
        title: 'Banuarasa Weekend Market — Edisi Ramadhan Berau',
        event_date: '2026-09-06',
        start_time: '06:00',
        end_time: '12:00',
        timezone: 'Asia/Makassar',
        location: 'Tepian Sambaliung, Berau, Kalimantan Timur',
        status: 'UPCOMING',
        total_stands: 64,
        available_stands: 18
      }
    ]
  });
});

app.get('/api/public/stands', (_req: Request, res: Response) => {
  // Hanya mengekspos kode stand, zona, dan ketersediaan, tanpa detail NIK yang memesan
  return res.json({
    success: true,
    data: Array.from({ length: 64 }, (_, i) => ({
      stand_id: `STD-${String(i + 1).padStart(2, '0')}`,
      stand_code: `A-${String(i + 1).padStart(2, '0')}`,
      zone: i < 20 ? 'ZONA_A' : i < 40 ? 'ZONA_B' : 'ZONA_C',
      base_price: 150000,
      is_available: i % 3 !== 0
    }))
  });
});

// --------------------------------------------------------
// 2. MEMBER ROUTES (Terisolasi per Member ID di Token)
// --------------------------------------------------------

app.get('/api/member/profile', requireAuth, requireRoles(['MEMBER']), (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    success: true,
    data: {
      member_id: req.userSession?.memberId,
      username: req.userSession?.username,
      status: 'ACTIVE'
    }
  });
});

// --------------------------------------------------------
// 3. ADMIN ROUTES (Hanya Role Admin Berwenang)
// --------------------------------------------------------

app.get('/api/admin/members', requireAuth, requireRoles(['SUPER_ADMIN', 'ADMIN_KOPERASI']), (req: AuthenticatedRequest, res: Response) => {
  logAudit(req.userSession!.username, req.userSession!.role, 'READ_MEMBERS_PII', 'Mengakses database anggota');
  return res.json({
    success: true,
    data: [] // Data akan dialirkan dari Google Spreadsheet backend
  });
});

app.get('/api/admin/audit-logs', requireAuth, requireRoles(['SUPER_ADMIN']), (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: []
  });
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`[BANUARASA SERVER v2] API Gateway aktif di http://localhost:${PORT}`);
  console.log(`[SECURITY] Polling full-state dinonaktifkan. Endpoint PII dan Public telah dipisahkan.`);
});

export default app;
