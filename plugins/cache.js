import NodeCache from 'node-cache';

const mcache = new NodeCache();

export default (duration) => (req, res, next) => {
  const key = `__express__${req.originalUrl}` || req.url;
  const cachedBody = mcache.get(key);
  if (cachedBody) {
    res.send(cachedBody);
  } else {
    res.sendResponse = res.send;
    res.send = (body) => {
      mcache.set(key, body, duration * 1000);
      res.sendResponse(body);
    };
    next();
  }
};
