import buildPage from 'gitee-pages-build';
import fetch from 'node-fetch'
import sleep from 'sleep-anywhere'
import URLSearchParams from 'url-search-params'

let GiteePage = buildPage.GiteePage;
let gist = buildPage.giteeGistSync
let actionsmap = {};


async function uploadToGithub(owner, token, repo, gitfile,base64Content, commitMsg){
    //完整链接
    let uri = 'https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + gitfile;

    //调整头
    let outBody, outStatus = 204,  reqHeaders = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36",
        "Authorization":"token " + token,
        "Content-Type": "application/json"
    };

    let res = await fetch(uri, {
        timeout: 50000,
        method: "PUT",
        body: JSON.stringify({
            message: commitMsg || 'put file by api',
            committer : {
                name: "committer",
                email:"committer@github.com"
            },
            content: base64Content
        }),
        headers:  reqHeaders
    });

    //成功
    if (res.status == 201) { //422 created?
        //let rj = await res.json();
        //outBody = JSON.stringify(rj);
        return {success: true, msg: 'created'};
    }
    else if(res.status == 422){
       // let rj = await res.json();
        //outBody = JSON.stringify(rj);
        return {success: true, msg: 'exists' };
    } else {
        outBody = res.body;
        return {success: false, msg: res.status + ':' + res.statusText, outBody:outBody };
    }
}

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

    const syncResult = await gist.save_obj(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, "json_build.mem", jsonObject);
  
    if(process.env.GITHUB_USERNAME && process.env.GITHUB_TOKEN && process.env.GITHUB_REPO){
        let gitfile = process.env.GITEE_USERNAME + '/' + process.env.GITEE_REPO + new Date().valueOf() + ".md"
        let gitfileContent = process.env.GITEE_USERNAME + '/' + process.env.GITEE_REPO;
        let base64Content = Buffer.from(gitfileContent,'utf8').toString('base64');
        await uploadToGithub(process.env.GITHUB_USERNAME,process.env.GITHUB_TOKEN, process.env.GITHUB_REPO,gitfile,base64Content);
    }
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

    