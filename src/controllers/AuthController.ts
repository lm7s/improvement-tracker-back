import { Request, Response } from 'express';
import argon2 from 'argon2';
import prisma from '../database';

class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const { username, password }: {[key: string]: string} = req.body;

    let user;
    try {
      user = await prisma.user.findUnique({
        where: {
          username,
        },
        include: {
          authInfo: true,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: 'Login error' });
    }

    // user should exist
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // verify if password is correct
    const isValidPassword = await argon2.verify(
      user.authInfo?.passwordHash as string,
      password,
    );

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    return res.json({
      ...user,
      authInfo: undefined,
    });
  }

  async register(req: Request, res: Response): Promise<Response> {
    const { username, email, password }: {[key: string]: string} = req.body;

    const passwordHash = await argon2.hash(password);

    try {
      await prisma.user.create({
        data: {
          email,
          username,
          authInfo: {
            create: {
              passwordHash,
            },
          },
        },
      });

      return res.sendStatus(201);
    } catch (err) {
      console.log(err);
      return res.status(400).json({ error: 'Could not register' });
    }
  }
}

export default new AuthController();
