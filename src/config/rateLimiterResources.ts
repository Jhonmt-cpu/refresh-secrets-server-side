interface RateLimiterResources {
  [key: string]: {
    [key: string]: number;
  };
}

const rateLimiterResourcesTest: RateLimiterResources = {
  '/': {
    GET: 100,
  },
  '/login': {
    POST: 100,
  },
  '/refresh': {
    POST: 100,
  },
  '/synchronize-cache': {
    POST: 100,
  },
  '/users': {
    POST: 100,
    GET: 100,
  },
};

const rateLimiterResourcesProd: RateLimiterResources = {
  '/': {
    GET: 4,
  },
  '/login': {
    POST: 3,
  },
  '/refresh': {
    POST: 10,
  },
  '/synchronize-cache': {
    POST: 1,
  },
  '/users': {
    POST: 3,
    GET: 5,
  },
};

const rateLimiterResources =
  process.env.NODE_ENV === 'test'
    ? rateLimiterResourcesTest
    : rateLimiterResourcesProd;

export default rateLimiterResources;
