import { Request, Response } from 'express';
import prisma from '../database';
import kayn from '../kayn';

class AccountController {
  async retrieve(req: Request, res: Response): Promise<Response> {
    const { username }: {[key: string]: string} = req.params;

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        account: true,
      },
    });

    // user should exist
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // user should have a tied account
    if (!user.account) {
      return res.status(400).json({ error: 'User account was not found' });
    }

    const { name, profileIconId, summonerLevel } = user.account;

    return res.json({
      name,
      profileIconId,
      summonerLevel,
    });
  }

  async register(req: Request, res: Response): Promise<Response> {
    const { username }: {[key: string]: string} = req.params;
    const { summonerName, region }: {[key: string]: string} = req.body;

    // get data from riot API
    const summonerDTO = await kayn.Summoner.by
      .name(summonerName)
      .region(region);

    // register account
    try {
      await prisma.account.create({
        data: {
          accountId: summonerDTO.accountId!,
          name: summonerDTO.name!,
          profileIconId: summonerDTO.profileIconId!,
          puuid: summonerDTO.puuid!,
          summonerId: summonerDTO.id!,
          summonerLevel: summonerDTO.summonerLevel!,
          user: {
            connect: {
              username,
            },
          },
          region,
        },
      });
    } catch (err) {
      console.log('account/register:', err);
      return res.status(400).json({ error: 'Could not register account.' });
    }

    return res.sendStatus(204);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { username }: {[key: string]: string} = req.params;

    // query user
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        account: true,
      },
    });

    // user should exist
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // user should have a tied account
    if (!user.account) {
      return res.status(400).json({ error: 'User account was not found' });
    }

    // get riot api data
    const summonerDTO = await kayn.Summoner.by
      .accountID(user.account.accountId);

    // update info
    const updatedAccount = await prisma.account.update({
      where: {
        id: user.account.id,
      },
      data: {
        name: summonerDTO.name!,
        profileIconId: summonerDTO.profileIconId!,
        summonerLevel: summonerDTO.summonerLevel!,
      },
    });

    return res.json({
      name: updatedAccount.name,
      profileIconId: updatedAccount.profileIconId,
      summonerLevel: updatedAccount.summonerLevel,
    });
  }
}

export default new AccountController();
