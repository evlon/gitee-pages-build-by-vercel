import buildPage from 'gitee-pages-build';
import fetch from 'node-fetch'
import sleep from 'sleep-anywhere'
import URLSearchParams from 'url-search-params'
let GiteePage = buildPage.GiteePage;
let gist = buildPage.giteeGistSync
let actionsmap = {};

export default async function handler(req, res) {
  if (req.method != "POST") {
    res.status(200).json({ msg: 'ok' })
    return;
  }

  let giteeToken = req.headers["x-gitee-token"];
  if (giteeToken != process.env.X_GITEE_TOKEN) {
    res.status(403).json({ msg: 'access not allowd.' })
    return;
  }


  if (process.env.GITEE_USERNAME && process.env.GITEE_PASSWORD && process.env.GITEE_REPO) {
    //User-Agent: git-oschina-hook // req.headers['user-agent'] == "git-oschina-hook" &&
     
    let repo = req.body.repository.path;
    let branch = req.body.ref.split('/').pop();
    if (branch != process.env.GITEE_BRANCH) {
    res.status(200).json({ msg: 'skip branch ' + branch })
    return;
    }

    let giteeTimestamp = req.headers["x-gitee-timestamp"];
    let giteeEvent = req.headers["x-gitee-event"];

    let jsonObject = {repo, branch, 
        gituser:process.env.GITEE_USERNAME , gitpwd: process.env.GITEE_PASSWORD, gitdir: process.env.GITEE_DIRECTORY, 
        gisttoken: process.env.GITEE_GIST_TOKEN,
        gistid: process.env.GITEE_GIST_ID };
        
    const syncResult = await gist.save_obj(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, "json_build.mem", jsonObject)
  }
  else {
    res.status(200).json({
      msg: `设置环境变量    
    GITEE_USERNAME=your_name
    GITEE_PASSWORD=your_password
    GITEE_REPO=your_repo
    GITEE_BRANCH=main
    GITEE_DIRECTORY=/
    GITEE_HTTPS=1
    GITEE_GIST_TOKEN=token_string
    GITEE_GIST_ID=gist_id
    API_PAGE_BUILD_SELF_URI=https://xxxxxxx/api/pagebuild
    `})
  }
}

    