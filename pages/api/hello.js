import buildPage from 'gitee-pages-build';


export default async function handler(req, res) {

  let giteeToken = req.headers["x-gitee-token"];
  let giteeTimestamp = req.headers["x-gitee-timestamp"];
  let giteeEvent = req.headers["x-gitee-event"];


  if (giteeToken != process.env.X_GITEE_TOKEN) {
    res.status(403).json({ msg: 'access not allowd.' })
    return;
  }
  let repo = req.body.repository.path;
  //更新环境变量
  process.env.GITEE_REPO = repo;

  if (process.env.GITEE_USERNAME && process.env.GITEE_PASSWORD && process.env.GITEE_REPO) {
    let loginResult = await buildPage.gitee_login_with_obj_cookie();
    let buildResult = await buildPage.pagebuild_with_obj_cookie();

    res.status(200).json({ msg: 'build success.' })
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
    `})
  }


}