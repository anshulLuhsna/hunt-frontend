// Configuration utility for fetching timing settings
import timingsConfig from '../config/timings.json';

export const getConfig = () => {
  return timingsConfig;
};

export const getMainHuntStartTime = () => {
  return new Date(timingsConfig.mainHunt.startTime);
};

export const getBonusRoundStartTime = (roundId) => {
  const roundKey = `bonus${roundId}`;
  return new Date(timingsConfig[roundKey].startTime);
};

export const getBonusRoundConfig = (roundId) => {
  const roundKey = `bonus${roundId}`;
  return timingsConfig[roundKey];
};

export const isMainHuntStarted = () => {
  const now = new Date();
  const huntStartTime = getMainHuntStartTime();
  return now >= huntStartTime;
};

export const isBonusRoundStarted = (roundId) => {
  const now = new Date();
  const roundStartTime = getBonusRoundStartTime(roundId);
  return now >= roundStartTime;
};
