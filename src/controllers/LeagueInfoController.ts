import { Request, Response } from 'express';
import { LeagueV4LeagueEntryDTO } from 'kayn/typings/dtos';
import prisma from '../database';
import kayn from '../kayn';

class LeagueInfoController {
  async retrieve(req: Request, res: Response): Promise<Response> {
    const { username }: {[key: string]: string} = req.params;

    // query user league info
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
      include: {
        leagueInfo: true,
      },
    });

    // user should exist
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // league info should exist
    if (!user.leagueInfo) {
      return res.json({ message: 'No league info found for this user. Try updating the info.' });
    }

    return res.json({
      ...user.leagueInfo,
      id: undefined,
      userId: undefined,
    });
  }

  // TODO: decide: do I actually need this?
  //   async register(req: Request, res: Response): Promise<Response> {
  //     return res.sendStatus(501);
  //   }

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
      return res.status(400).json({ error: 'User has no registered account' });
    }

    // get data from riot API
    // TODO: make this include flex queue too
    const leagueInfosDTO: LeagueV4LeagueEntryDTO[] = await kayn.League.Entries.by
      .summonerID(user.account.summonerId);

    const [soloQueueDTO] = leagueInfosDTO.filter((infoDTO) => infoDTO.queueType === 'RANKED_SOLO_5x5');

    if (!soloQueueDTO) {
      return res.status(400).json({ error: 'Only Solo Queue is supported for now' });
    }

    // save in database
    try {
      const newLeagueInfo = await prisma.leagueInfo.create({
        data: {
          queueType: soloQueueDTO.queueType!,
          tier: soloQueueDTO.tier!,
          rank: soloQueueDTO.rank!,
          leaguePoints: soloQueueDTO.leaguePoints!,
          wins: soloQueueDTO.wins!,
          losses: soloQueueDTO.losses!,
          veteran: soloQueueDTO.veteran!,
          inactive: soloQueueDTO.inactive!,
          freshBlood: soloQueueDTO.freshBlood!,
          hotStreak: soloQueueDTO.hotStreak!,
          user: {
            connect: {
              username,
            },
          },
        },
      });

      return res.json({
        ...newLeagueInfo,
        userId: undefined,
      });
    } catch (err) {
      console.log(err);

      return res.status(500).json({ error: 'Could not update league info' });
    }
  }
}

export default new LeagueInfoController();
