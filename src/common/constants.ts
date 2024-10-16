// Environment Variables
export const NodeEnvironment = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TESTING: 'testing',
} as const;

export const DEFAULT_OFFSET = 0;
export const DEFAULT_LIMIT = 20;

export const AUTHENTICATED_USER_ATTRIBUTE_NAME = 'user';
export const API_KEY_HEADER_NAME = 'x-api-key';
export const API_KEY_TOKEN = 'api-key';

// Models Names
export const USERS_MODEL_NAME = 'users';
export const MOVIES_MODEL_NAME = 'movies';
export const MOVIES_RATING_MODEL_NAME = 'movies-ratings';
export const MOVIES_FAVORITE_MODEL_NAME = 'movies-favorites';

// Tokens
export const USER1_AUTH_TOKEN = 'USER1_AUTH_TOKEN';
export const USER2_AUTH_TOKEN = 'USER2_AUTH_TOKEN';
export const USER3_AUTH_TOKEN = 'USER3_AUTH_TOKEN';
