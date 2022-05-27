import buildPage from 'gitee-pages-build';
let jsonObj  = await gist.sync_obj(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, "json_build.mem");
  //更新环境变量
  process.env.GITEE_USERNAME=jsonObj.gituser
  process.env.GITEE_PASSWORD=jsonObj.gitpwd
  process.env.GITEE_REPO=jsonObj.repo
  process.env.GITEE_BRANCH=jsonobj.branch
  process.env.GITEE_DIRECTORY=jsonobj.gitdir
  process.env.GITEE_HTTPS=1
  process.env.GITEE_GIST_TOKEN=jsonobj.gisttoken;
  process.env.GITEE_GIST_ID=jsonobj.gistid;

let loginResult = await buildPage.gitee_login_with_obj_cookie();
let buildResult = await buildPage.pagebuild_with_obj_cookie();