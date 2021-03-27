import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { REGIONS } from 'kayn';
import { MatchV4ParticipantDTO } from 'kayn/typings/dtos';
import { v4 } from 'uuid';
import prisma from '../database';
import kayn from '../kayn';

const getSeasonStartTimestamp = (region: REGIONS) => {
  // season 11: 2021-01-08, 04:00
  const timestamps = {
    [REGIONS.NORTH_AMERICA]: 1610107200000, // UTC-8 PST
    [REGIONS.LATIN_AMERICA_NORTH]: 1610100000000, // UTC-6 CST
    [REGIONS.LATIN_AMERICA_SOUTH]: 1610089200000, // UTC-3
    [REGIONS.BRAZIL]: 1610089200000, // UTC-3 BRT
    [REGIONS.EUROPE_WEST]: 1610078400000, // GMT
    [REGIONS.EUROPE]: 1610074800000, // UTC+1 CET
    [REGIONS.RUSSIA]: 1610067600000, // UTC+3 MSK
    [REGIONS.TURKEY]: 1610067600000, // UTC+3
    [REGIONS.JAPAN]: 1610046000000, // UTC+9 JST
    [REGIONS.KOREA]: 1610046000000, // UTC+9 KST
    [REGIONS.OCEANIA]: 1610038800000, // UTC+11 AEDT
  };

  return timestamps[region];
};

class MatchController {
  async listAll(req: Request, res: Response): Promise<Response> {
    return res.sendStatus(501);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { username }: {[key: string]: string} = req.params;

    // query user
    console.log('querying user...');
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
    console.log('user exists');

    // user should have a tied account
    if (!user.account) {
      return res.status(400).json({ error: 'User has no registered account' });
    }

    console.log('user has account');

    // query riot api for most recent 10 matches
    console.log('querying matchlist data..');
    let matchlistDTO = await kayn.Matchlist.by
      .accountID(user.account.accountId)
      .query({
        queue: [420],
        beginTime: getSeasonStartTimestamp(user.account.region as REGIONS),
        beginIndex: 0,
        endIndex: 10,
      });

    // ? am I getting the latest matches?
    if (matchlistDTO.totalGames! > matchlistDTO.endIndex!) {
      console.log('querying MORE matchlist data..');
      const beginIndex = matchlistDTO.totalGames! - 10 < 0
        ? 0
        : matchlistDTO.totalGames! - 10;

      matchlistDTO = await kayn.Matchlist.by
        .accountID(user.account.accountId)
        .query({
          queue: [420],
          beginTime: getSeasonStartTimestamp(user.account.region as REGIONS),
          beginIndex,
          endIndex: matchlistDTO.totalGames!,
        });
    }

    // riot api: get match info for every match in matchlist
    console.log('resolving data for each match data..');
    const matchesDTOPromises = matchlistDTO.matches!.map(
      async (matchInfo) => kayn.Match.get(matchInfo.gameId!),
    );

    const matchesDTO = await Promise.all(matchesDTOPromises);
    console.log('got match info.');

    // generate transaction promises
    console.log('generating transaction promises...');
    const createMatchTransactionPromises = matchesDTO.map(async (matchDTO) => {
      // get match data from DTO
      const {
        gameId,
        platformId,
        gameCreation: creationDateGMT,
        gameDuration: durationTime,
        queueId,
        mapId,
        seasonId,
        gameVersion,
        gameMode,
        gameType,
      } = matchDTO;

      // query database to check if this game and a review already exist
      const existingMatch = await prisma.match.findUnique({
        where: {
          gameId: gameId!,
        },
      });

      const existingReview = await prisma.review.findUnique({
        where: {
          matchId_userId: {
            matchId: gameId!,
            userId: user.id,
          },
        },
      });

      // * team DTOs -- 1 match: 2 teams -- 1 team: 5 bans, 5 participants
      const [blueTeamDTO] = matchDTO.teams!.filter((team) => team.teamId === 100);
      const [redTeamDTO] = matchDTO.teams!.filter((team) => team.teamId === 200);

      const blueTeamParticipants = matchDTO.participants!
        .filter((participant) => participant.teamId === 100);

      const redTeamParticipants = matchDTO.participants!
        .filter((participant) => participant.teamId === 200);

      // * create uuids: blue Team, red Team
      const blueTeamUUID = v4();
      const redTeamUUID = v4();

      // * create match
      let createMatch = null;
      let createBlueTeam = null;
      let createRedTeam = null;
      let createReview = null;

      if (!existingMatch) {
        createMatch = prisma.match.create({
          data: {
            gameId: gameId!,
            platformId: platformId!,
            creationDateGMT: new Date(creationDateGMT!),
            durationTime: durationTime!,
            queueId: queueId!,
            mapId: mapId!,
            seasonId: seasonId!,
            gameVersion: gameVersion!,
            gameMode: gameMode!,
            gameType: gameType!,
          },
        });

        createBlueTeam = prisma.team.create({
          data: {
            id: blueTeamUUID,
            hasWon: blueTeamDTO.win === 'Win',
            drewFirstBlood: blueTeamDTO.firstBlood!,
            brokeFirstTower: blueTeamDTO.firstTower!,
            brokeFirstInhibitor: blueTeamDTO.firstInhibitor!,
            killedFirstBaron: blueTeamDTO.firstBaron!,
            killedFirstDragon: blueTeamDTO.firstDragon!,
            towerKills: blueTeamDTO.towerKills!,
            inhibitorKills: blueTeamDTO.inhibitorKills!,
            baronKills: blueTeamDTO.baronKills!,
            dragonKills: blueTeamDTO.dragonKills!,
            riftHeraldKills: blueTeamDTO.riftHeraldKills!,
            bans: {
              createMany: {
                data: blueTeamDTO.bans!.map((banDTO) => {
                  const { pickTurn, championId } = banDTO;

                  const banObject: Prisma.BanCreateInput = {
                    pickTurn: pickTurn!,
                    championId: championId!,
                    // team: {
                    //   connect: {
                    //     id: blueTeamUUID,
                    //   },
                    // },
                  };

                  return banObject;
                }),
              },
            },
            participants: {
              createMany: {
                data: blueTeamParticipants.map((participantDTO) => {
                  const participantObject: Prisma.ParticipantCreateInput = {
                    participantId: participantDTO.participantId!,
                    championId: participantDTO.championId!,
                    spell1Id: participantDTO.spell1Id!,
                    spell2Id: participantDTO.spell2Id!,
                    item0: participantDTO.stats!.item0!,
                    item1: participantDTO.stats!.item1!,
                    item2: participantDTO.stats!.item2!,
                    item3: participantDTO.stats!.item3!,
                    item4: participantDTO.stats!.item4!,
                    item5: participantDTO.stats!.item5!,
                    item6: participantDTO.stats!.item6!,
                    kills: participantDTO.stats!.kills!,
                    deaths: participantDTO.stats!.deaths!,
                    assists: participantDTO.stats!.assists!,
                  };

                  return participantObject;
                }),
              },
            },
            match: {
              connect: {
                gameId,
              },
            },
          },
        });

        createRedTeam = prisma.team.create({
          data: {
            id: redTeamUUID,
            hasWon: redTeamDTO.win === 'Win',
            drewFirstBlood: redTeamDTO.firstBlood!,
            brokeFirstTower: redTeamDTO.firstTower!,
            brokeFirstInhibitor: redTeamDTO.firstInhibitor!,
            killedFirstBaron: redTeamDTO.firstBaron!,
            killedFirstDragon: redTeamDTO.firstDragon!,
            towerKills: redTeamDTO.towerKills!,
            inhibitorKills: redTeamDTO.inhibitorKills!,
            baronKills: redTeamDTO.baronKills!,
            dragonKills: redTeamDTO.dragonKills!,
            riftHeraldKills: redTeamDTO.riftHeraldKills!,
            bans: {
              createMany: {
                data: redTeamDTO.bans!.map((banDTO) => {
                  const { pickTurn, championId } = banDTO;

                  const banObject: Prisma.BanCreateInput = {
                    pickTurn: pickTurn!,
                    championId: championId!,
                    // team: {
                    //   connect: {
                    //     id: blueTeamUUID,
                    //   },
                    // },
                  };

                  return banObject;
                }),
              },
            },
            participants: {
              createMany: {
                data: redTeamParticipants.map((participantDTO) => {
                  const participantObject: Prisma.ParticipantCreateInput = {
                    participantId: participantDTO.participantId!,
                    championId: participantDTO.championId!,
                    spell1Id: participantDTO.spell1Id!,
                    spell2Id: participantDTO.spell2Id!,
                    item0: participantDTO.stats!.item0!,
                    item1: participantDTO.stats!.item1!,
                    item2: participantDTO.stats!.item2!,
                    item3: participantDTO.stats!.item3!,
                    item4: participantDTO.stats!.item4!,
                    item5: participantDTO.stats!.item5!,
                    item6: participantDTO.stats!.item6!,
                    kills: participantDTO.stats!.kills!,
                    deaths: participantDTO.stats!.deaths!,
                    assists: participantDTO.stats!.assists!,
                  };

                  return participantObject;
                }),
              },
            },
            match: {
              connect: {
                gameId,
              },
            },
          },
        });
      }

      if (!existingReview) {
        createReview = prisma.review.create({
          data: {
            match: {
              connect: {
                gameId,
              },
            },
            user: {
              connect: {
                id: user.id,
              },
            },
            reflection: '',
          },
        });
      }

      const transactions = [
        createMatch,
        createBlueTeam,
        createRedTeam,
        createReview,
      ];

      // return only not-null transactions
      return prisma.$transaction(transactions.filter(Boolean));
    });

    try {
      // execute transaction promises
      console.log('executing transaction promises...');
      await Promise.all(createMatchTransactionPromises);
    } catch (err) {
      console.log('err', err);
      return res.status(500).send({ error: 'Could not update matches' });
    }

    console.log('done.');
    return res.sendStatus(200);
  }
}

export default new MatchController();
