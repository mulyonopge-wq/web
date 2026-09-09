import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser, comparePassword, hashPassword, signToken, AUTH_CONFIG } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data profil' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, currentPassword, newPassword } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nama dan Email wajib diisi' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // If changing email, check if new email is already taken by another user
    const normalizedEmail = email.toLowerCase().trim();
    if (normalizedEmail !== user.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existingEmail && existingEmail.id !== user.id) {
        return NextResponse.json(
          { error: 'Email tersebut sudah digunakan oleh akun lain' },
          { status: 400 }
        );
      }
    }

    // Data to update
    const updateData: any = {
      name: name.trim(),
      email: normalizedEmail,
    };

    // If changing password, current password is REQUIRED and must match
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Password lama wajib dimasukkan untuk mengganti password' },
          { status: 400 }
        );
      }

      const isCurrentValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: 'Password lama tidak sesuai' },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password baru minimal 6 karakter' },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(newPassword);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
      },
    });

    // Generate new JWT token if email changed
    const token = signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Profil dan kredensial admin berhasil diperbarui',
      user: updatedUser,
    });

    response.cookies.set({
      name: AUTH_CONFIG.cookieName,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Update profile error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar pada akun lain' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Gagal memperbarui profil admin' }, { status: 500 });
  }
}
