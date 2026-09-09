const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'sqlite';
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const envPath = path.join(__dirname, '..', '.env');

if (!fs.existsSync(schemaPath)) {
  console.error('schema.prisma not found');
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

if (target === 'sqlite') {
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Switched schema.prisma provider to sqlite');

  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  if (env.includes('DATABASE_URL=')) {
    env = env.replace(/DATABASE_URL=.*/, 'DATABASE_URL="file:./dev.db"');
  } else {
    env += '\nDATABASE_URL="file:./dev.db"\n';
  }
  fs.writeFileSync(envPath, env);
  console.log('✅ Updated .env to DATABASE_URL="file:./dev.db"');
} else if (target === 'postgres' || target === 'postgresql') {
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  fs.writeFileSync(schemaPath, schema);
  console.log('✅ Switched schema.prisma provider to postgresql');

  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const pgUrl = 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jangkriknet?schema=public"';
  if (env.includes('DATABASE_URL=')) {
    env = env.replace(/DATABASE_URL=.*/, pgUrl);
  } else {
    env += `\n${pgUrl}\n`;
  }
  fs.writeFileSync(envPath, env);
  console.log('✅ Updated .env to PostgreSQL connection string');
} else {
  console.log('Usage: node scripts/switch-db.js [sqlite|postgres]');
}
