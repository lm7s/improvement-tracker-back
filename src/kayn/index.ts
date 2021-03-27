import { Kayn, REGIONS } from 'kayn';

const kayn = Kayn(process.env.RIOT_API_KEY)({
  region: REGIONS.BRAZIL,
});

export default kayn;
