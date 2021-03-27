import { NextFunction, Request, Response } from 'express';

const getFormattedCurrentTime = (): string => {
  const today = new Date();

  const formattedHours = today.getHours().toString().padStart(2, '0');
  const formattedMinutes = today.getMinutes().toString().padStart(2, '0');
  const formattedSeconds = today.getSeconds().toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

const logRequest = (req: Request, res: Response, next: NextFunction) => {
  const { method, originalUrl, body } = req;

  const formattedTime = getFormattedCurrentTime();

  const message = `[${formattedTime}] ${method} to ${originalUrl} | ${body}`;

  console.log(message);
  next();
};

// eslint-disable-next-line import/prefer-default-export
export { logRequest };
