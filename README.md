# Matrimonial Backend — Var Kanya Parichay Kendra

TypeScript + Express + Prisma + PostgreSQL + Redis

## Run karne ke steps (VS Code)

1. Is folder ko VS Code me kholo (File > Open Folder)
2. Terminal kholo (Ctrl + ~)
3. Commands chalao:

```bash
npm install --legacy-peer-deps       # packages (1-2 min)
```

4. `.env` file banao (`.env.example` copy karke) aur values bharo (neeche dekho)

5. Prisma setup:
```bash
npx prisma migrate dev --name init   # DB tables banao
npm run seed                         # super admin + default plans
```

6. Server chalao:
```bash
npm run dev                          # http://localhost:8000
```

## .env me kya bharna hai (zaroori)

Local testing ke liye sirf ye 3 zaroori hain:

```
NODE_ENV=development
PORT=8000
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/matrimonial?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_ACCESS_SECRET="koi_lamba_random_32_character_ka_secret_yahan"
JWT_REFRESH_SECRET="dusra_lamba_random_32_character_ka_secret"
SUPER_ADMIN_PHONE="6392061026"
```

- PostgreSQL aur Redis laptop me install/chalu hone chahiye
- DATABASE_URL me apna postgres password daalo
- MSG91/Razorpay/Cloudinary dev me optional (OTP terminal/log me dikh jaayega)

## Dev me OTP kaise milega?
Dev mode me SMS nahi jaata — OTP terminal (console) me log hota hai.
Login karte waqt terminal dekho, wahan OTP dikhega.

## Zaroori (frontend ke saath)
- Ye backend port 8000 pe chalta hai
- Frontend (localhost:3000) isi se baat karta hai
