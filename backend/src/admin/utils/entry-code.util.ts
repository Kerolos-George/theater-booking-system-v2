import { PrismaService } from '../../prisma/prisma.service';

export async function generateUniqueEntryCode(prisma: PrismaService): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt++) {
    let code = String(Math.floor(100000 + Math.random() * 900000));

    if (attempt >= 15) {
      const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      code = `${code}${suffix}`;
    }

    const existing = await prisma.booking.findFirst({
      where: {
        entryCode: code,
        status: 'CONFIRMED',
      },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  return `${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;
}
