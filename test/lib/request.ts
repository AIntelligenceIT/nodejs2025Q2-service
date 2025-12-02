import * as supertest from 'supertest';
import 'dotenv/config';

const port = process.env.PORT || 4000;
const host = `http://localhost:${port}`;

let instance: any = null;

const handler: ProxyHandler<any> = {
  get(_, prop) {
    if (!instance) {
      instance = supertest(host);
    }
    const value = instance[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
};

const _request = new Proxy({}, handler);

export default _request;
