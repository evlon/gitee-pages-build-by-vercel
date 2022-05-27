import buildPage from 'gitee-pages-build';

async function main(){
  let gist = buildPage.giteeGistSync
  let jsonObject = {};
  const syncResult = await gist.sync_obj(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, "json_cookie.mem", jsonObject)
  console.log('sync cookie to local ' + syncResult)
  let jsonObj = {};
  let syncResultBuild  = await gist.sync_obj(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, "json_build.mem",jsonObj);

  let gitee = new GiteePage(jsonObj.gituser,jsonObj.gitpwd,jsonObj.repo,jsonobj.branch,jsonobj.gitdir,1);
  
   // 设置COOKIE
   await gitee.setCookieStoreJsonObject(state.args.cookie)
    const loginStatus = await gitee.isLogin()
  
    let csrf_token = loginStatus.csrf_token;
    const loginResult = await gitee.doLogin(csrf_token)
    console.log('login ' + loginResult)
    let buildResult = await gitee.pageBuild();

    const saveResult = await gist.save_obj(process.env.GITEE_GIST_TOKEN, jsonObject, process.env.GITEE_GIST_ID, "json_cookie.mem")
}


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