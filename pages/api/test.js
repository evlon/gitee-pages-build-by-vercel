export default async function handler(req, res) {
  //let resp = await fetch("https://www.baidu.com");
  //let html = await resp.text();
  console.log(req);
  console.log(req.body);
  res.status(200).json({ req})
}

