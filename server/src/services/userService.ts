import bcrypt from 'bcryptjs';

import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import type { UserCreateInput, UserUpdateInput } from '../validators/userSchemas';

const SALT_ROUNDS = 10;

export const listUsers = async () => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  return users.map(({ passwordHash, ...rest }) => rest);
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const createUser = async (data: UserCreateInput) => {
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      role: data.role,
      passwordHash,
    },
  });

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};

export const updateUser = async (id: number, data: UserUpdateInput) => {
  const updatePayload: Prisma.UserUpdateInput = {};

  if (typeof data.username !== 'undefined') {
    updatePayload.username = data.username;
  }
  if (typeof data.email !== 'undefined') {
    updatePayload.email = data.email;
  }
  if (typeof data.role !== 'undefined') {
    updatePayload.role = data.role;
  }
  if (typeof data.password !== 'undefined') {
    updatePayload.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updatePayload,
  });

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
};

export const deleteUser = async (id: number) => {
  await prisma.user.delete({ where: { id } });
};
