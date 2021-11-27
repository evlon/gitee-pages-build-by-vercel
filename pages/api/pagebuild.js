import buildPage from 'gitee-pages-build';
import fetch from 'node-fetch'
import sleep from 'sleep-anywhere'
import  URLSearchParams  from 'url-search-params'

export default async function handler(req, res) {

  console.log(req.url);
  let currentStep = parseInt(req.query.step || '1');
  let state = req.query.state;
  

 
  await doAction(req); 
  res.status(200).json({step: currentStep, code:0, msg:"ok"}) 
}

async function doAction(req){
  //add your code here...
  console.log('your code here...',new Date())
  await sleep(5000);

  console.log('end code here...',new Date())
  // do next step action to get more cpu time

  let currentStep = parseInt(req.query.step || '1');
  if(currentStep < 3){
    let state = {currentStep:currentStep}
    
    doNext(currentStep + 1,  state);
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
  fetch(queryUri)
  await sleep(1000);
}