//const fetch = require('node-fetch');
import buildPage from 'gitee-pages-build';
// import { NextRequest } from '_next@12.0.1@next/dist/server/web/spec-extension/request';

export default async function handler(req, res) {
  //let resp = await fetch("https://www.baidu.com");
  //let html = await resp.text();
  console.log(req);
  console.log(req.body);
}

