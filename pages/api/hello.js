//const fetch = require('node-fetch');
import buildPage from 'gitee-pages-build';

export default async function handler(req, res) {
  //let resp = await fetch("https://www.baidu.com");
  //let html = await resp.text();
   let giteeToken = req.headers["X-Gitee-Token"];
   let giteeTimestamp = req.headers["X-Gitee-Timestamp"];
   let giteeEvent = req.headers["X-Gitee-Event"];


  
   
 
  if(process.env.GITEE_USERNAME){
    //await buildPage();

    res.status(200).json({ msg: 'build success.'})
  }
  else{
    res.status(200).json({msg:`设置环境变量    
    GITEE_USERNAME=your_name
    GITEE_PASSWORD=your_password
    GITEE_REPO=your_repo
    GITEE_BRANCH=main
    GITEE_DIRECTORY=/
    GITEE_HTTPS=1
    GITEE_GIST_TOKEN=token_string
    GITEE_GIST_ID=gist_id
    `})
  }
 
  
}