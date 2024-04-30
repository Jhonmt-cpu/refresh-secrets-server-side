interface RateLimiterResources {
  [key: string]: {
    [key: string]: number;
  };
}

interface RateLimiterSocketIOResources {
  [key: string]: number;
}

const rateLimiterResourcesTest: RateLimiterResources = {
  '/': {
    GET: 100,
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
  '/users': {
    POST: 3,
    GET: 5,
  },
};

const rateLimiterSocketIOResourcesProd: RateLimiterSocketIOResources = {
  login: 4,
  login_by_custom_token: 4,
};

const rateLimiterSocketIOResourcesTest: RateLimiterSocketIOResources = {
  login: 100,
  login_by_custom_token: 100,
};

const rateLimiterResources =
  process.env.NODE_ENV === 'test'
    ? rateLimiterResourcesTest
    : rateLimiterResourcesProd;

const rateLimiterSocketIOResources =
  process.env.NODE_ENV === 'test'
    ? rateLimiterSocketIOResourcesTest
    : rateLimiterSocketIOResourcesProd;

export { rateLimiterResources, rateLimiterSocketIOResources };
