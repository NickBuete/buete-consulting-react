import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { prisma } from '../src/db/prisma';

config({ path: '.env' });

interface CliArgs {
  email?: string;
  password?: string;
  username?: string;
}

const parseArgs = (): CliArgs => {
  const args: CliArgs = {};

  for (const token of process.argv.slice(2)) {
    const [rawKey, ...rest] = token.split('=');

    if (!rawKey) {
      continue;
    }

    const key = rawKey.replace(/^--/, '');
    const value = rest.length > 0 ? rest.join('=') : '';

    if (key === 'email' || key === 'password' || key === 'username') {
      (args as Record<string, string>)[key] = value;
    }
  }

  return args;
};

const main = async () => {
  const { email, password, username } = parseArgs();

  if (!email || !password || !username) {
    console.error('Usage: npx ts-node scripts/createAdmin.ts --email=user@example.com --username="Your Name" --password=StrongPassword');
    process.exit(1);
  }

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
  if (existing) {
    console.error('A user with the provided email or username already exists.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', { id: admin.id, email: admin.email, username: admin.username });
};

main()
  .catch((error) => {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
