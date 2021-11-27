import buildPage from 'gitee-pages-build';
import fetch from 'node-fetch'
import sleep from 'sleep-anywhere'
import URLSearchParams from 'url-search-params'
let GiteePage = buildPage.GiteePage;
let gist = buildPage.giteeGistSync
let actionsmap = {};

export default async function handler(req, res) {
  let giteeToken = req.headers["x-gitee-token"];
  if (giteeToken != process.env.X_GITEE_TOKEN) {
    res.status(403).json({ msg: 'access not allowd.' })
    return;
  }
  if (process.env.GITEE_USERNAME && process.env.GITEE_PASSWORD && process.env.GITEE_REPO) {

    if (req.method == "POST") {
      let repo = req.body.repository.path;
      let branch = req.body.ref.split('/').pop();
      if (branch != process.env.GITEE_BRANCH) {
        res.status(200).json({ msg: 'skip branch ' + branch })
        return;
      }

      let giteeTimestamp = req.headers["x-gitee-timestamp"];
      let giteeEvent = req.headers["x-gitee-event"];

      addAction(1, async state => {
        let jsonObject = {};
        // sync from gitee gist
        const syncResult = await gist.sync_obj(process.env.GITEE_GIST_TOKEN, process.env.GITEE_GIST_ID, "json_cookie.mem", jsonObject)
        console.log('sync cookie to local ' + syncResult)

        return { args: { cookie: jsonObject, repo, branch }, stacjsonObjectks: [{ msg: 'init api', time: new Date() }] };
      })
    }


    addAction(2, async state => {

      //更新环境变量
      process.env.GITEE_REPO = state.args.repo;
      GiteePage.delayFetch = 50;

      let gitee = new GiteePage(process.env.GITEE_USERNAME,
        process.env.GITEE_PASSWORD,
        process.env.GITEE_REPO,
        process.env.GITEE_BRANCH,
        process.env.GITEE_DIRECTORY,
        process.env.GITEE_HTTPS)

      // 设置COOKIE
      await gitee.setCookieStoreJsonObject(state.args.cookie)

      const loginResult = await gitee.login()
      console.log('login ' + syncResult)

      state.stacks.push({ msg: 'gitee_login_with_obj_cookie', time: new Date(), result: loginResult });
      return state;
    })

    addAction(3, async state => {
      //更新环境变量
      process.env.GITEE_REPO = state.args.repo;
      GiteePage.delayFetch = 50;

      let gitee = new GiteePage(process.env.GITEE_USERNAME,
        process.env.GITEE_PASSWORD,
        process.env.GITEE_REPO,
        process.env.GITEE_BRANCH,
        process.env.GITEE_DIRECTORY,
        process.env.GITEE_HTTPS)

      // 设置COOKIE
      await gitee.setCookieStoreJsonObject(state.args.cookie)

      let buildResult = await gitee.pageBuild();
      state.stacks.push({ msg: 'pagebuild_with_obj_cookie', time: new Date(), result: buildResult });
      console.log('build success.')
      return state;
    })

    addAction(4, async state => {
      let jsonObject = state.args.cookie;
      const saveResult = await gist.save_obj(process.env.GITEE_GIST_TOKEN, jsonObject, process.env.GITEE_GIST_ID, "json_cookie.mem")
      console.log('sync cookie to gitee gist  ' + saveResult)
      console.log('build ok')
      return state;
    })
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

  console.log(req.url);
  await doAction(req);
  res.status(200).json({ code: 0, msg: "ok" })
}

function actions(step) {
  return actionsmap[step];
}

function addAction(step, fn_argState) {
  actionsmap[step] = fn_argState;
}

async function doAction(req) {
  let currentStep = parseInt(req.query.step || '1');
  let state = JSON.parse(req.query.state || '{}');
  //add your code here...
  console.log('your code here...', new Date(), state)
  //await sleep(5000);

  let action = actions(currentStep);
  if (action) {
    state = await action(state);
  }

  let nextAction = actions(currentStep + 1);

  console.log('end code here...', new Date(), state)
  // do next step action to get more cpu time


  if (nextAction) {
    await doNext(currentStep + 1, state);
  }
  else {
    console.log('finished...')
  }

}

async function doNext(step, state) {

  let url = process.env.API_PAGE_BUILD_SELF_URI || 'http://localhost:3000/api/pagebuild';
  let query = new URLSearchParams({ step: step, state: JSON.stringify(state) }).toString();
  let queryUri = url + '?' + query;
  console.log('doNext ', queryUri, step, state);
  fetch(queryUri, {
    method: "GET",
    headers: {
      "x-gitee-token": process.env.X_GITEE_TOKEN
    }
  })
  await sleep(1000);
}