import { vercelHandler } from '../server/index.js';

export default function handler(req, res) {
  return vercelHandler(req, res);
}
