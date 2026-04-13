import { nanoid } from 'nanoid';
import { AppError } from './appError';
import Link from '../models/link';

const MAX_RETRIES = 5;

const generateShortLink = () => nanoid(8);

const isUniqueError = (err: unknown): boolean => {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === '23505'
  );
};

export const createUrl = async (input: {
  originalLink: string;
  userId?: number | null;
}) => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const shortLink = generateShortLink();

    try {
      return await Link.createLink({
        originalLink: input.originalLink,
        shortLink,
        userId: input.userId ?? null,
      });
    } catch (err: unknown) {
      if (isUniqueError(err)) continue;
      throw err;
    }
  }

  throw new AppError(500, 'Could not generate unique short link.', {
    code: 'SHORT_LINK_GENERATION_FAILED',
    devMessage: `Exceeded ${MAX_RETRIES} attempts to generate a unique short link`,
  });
};

export const getLinksByUserId = async (userId: number) => {
  return await Link.findManyByUserId(userId);
};

export const getOriginalLinkByShortCode = async (shortLink: string) => {
  const link = await Link.findByShortLink(shortLink);

  if (!link) {
    throw new AppError(404, 'This short link does not exist.', {
      code: 'NOT_FOUND',
      devMessage: `No URL found for short link: ${shortLink}`,
    });
  }

  return link.originalLink;
};

export const deleteUserLinkById = async (id: string, userId: number) => {
  const deleted = await Link.deleteByIdAndUserId(id, userId);

  if (!deleted) {
    throw new AppError(404, 'We could not find that link.', {
      code: 'NOT_FOUND',
      devMessage: `No link found for id=${id} and userId=${userId}`,
    });
  }

  return deleted;
};
