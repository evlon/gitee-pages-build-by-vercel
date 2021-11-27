import buildPage from 'gitee-pages-build';
import fetch from 'node-fetch'
import sleep from 'sleep-anywhere'
import  URLSearchParams  from 'url-search-params'
let actionsmap = {};

export default async function handler(req, res) {
  let giteeToken = req.headers["x-gitee-token"];
  if (giteeToken != process.env.X_GITEE_TOKEN) {
    res.status(403).json({ msg: 'access not allowd.' })
    return;
  }
  if (process.env.GITEE_USERNAME && process.env.GITEE_PASSWORD && process.env.GITEE_REPO) {

    let repo = req.body.repository.path;
    let branch  = req.body.ref.split('/').pop();
    if(branch == process.env.GITEE_BRANCH){
      res.status(200).json({ msg: 'skip branch ' + branch })
      return ;
    }

    if(req.method == "POST"){      
      let giteeTimestamp = req.headers["x-gitee-timestamp"];
      let giteeEvent = req.headers["x-gitee-event"];
    
      addAction(1, async state=>{
        return {args: {giteeTimestamp, giteeEvent, repo, branch}, stacks: [{msg:'init api', time :new Date()}] };
      })
    }
    else  if(req.method == "GET"){

      addAction(2, async state=>{
         //更新环境变量
        process.env.GITEE_REPO = state.args.repo;
        let loginResult = await buildPage.gitee_login_with_obj_cookie();
        state.stacks.push({msg:'gitee_login_with_obj_cookie', time :new Date(), result:loginResult});
        return state;
      })
      
      addAction(3, async state=>{
        //更新环境变量
        process.env.GITEE_REPO = state.args.repo;
        let buildResult = await buildPage.pagebuild_with_obj_cookie();
        state.stacks.push({msg:'pagebuild_with_obj_cookie', time :new Date(), result:buildResult});
        console.log('build success.')
        return state;     
      })   
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

  console.log(req.url);
  await doAction(req); 
  res.status(200).json({ code:0, msg:"ok"}) 
}

function actions(step){
  return actionsmap[step];
}

function addAction(step, fn_argState){
  actionsmap[step] = fn_argState;
}

async function doAction(req){
  let currentStep = parseInt(req.query.step || '1');
  let state = req.query.state;
  //add your code here...
  console.log('your code here...',new Date(),state)
  //await sleep(5000);

  let action = actions(currentStep);
  if(action){
    state = await action(state);
  }

  let nextAction = actions(currentStep + 1);

  console.log('end code here...',new Date(), state)
  // do next step action to get more cpu time

 
  if(nextAction){
    let state = {currentStep:currentStep}
    
    await doNext(currentStep + 1,  state);
  }
  else{
    console.log('finished...')
  }
  
}

async function doNext(step,state){
  
  let url = process.env.API_PAGE_BUILD_SELF_URI || 'http://localhost:3000/api/pagebuild';
  let query = new URLSearchParams({ step:step , state: JSON.stringify(state)}).toString();
  let queryUri = url + '?' + query;
  console.log('doNext ', queryUri, step, state);
  fetch(queryUri,{
    method:"GET",
    headers:{
      "x-gitee-token": process.env.X_GITEE_TOKEN
    }
  })
  await sleep(1000);
}