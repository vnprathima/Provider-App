import KJUR, {KEYUTIL} from 'jsrsasign';
import config from '../properties.json';


export async function login(){
    const types = {
    error: "errorClass",
    info: "infoClass",
    debug: "debugClass",
    warning: "warningClass"
  };
    const tokenUrl = "https://54.227.173.76:8443/auth/realms/"+config.realm+"/protocol/openid-connect/token";
    console.log("Retrieving OAuth token from "+tokenUrl,types.info);
    let params = {
        grant_type:"password",
        username:"john",
        password:"john123",
        client_id:"app-login"
      };
    if(config.client){
    console.log("Using client {" + config.client + "}",types.info)
    }else{
    console.log("No client id provided in properties.json",this.warning);
    }

    // Encodes the params to be compliant with
    // x-www-form-urlencoded content types.
    const searchParams = Object.keys(params).map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    // We get the token from the url
    const tokenResponse =  await fetch(tokenUrl, {
        method: "POST",
        headers: {
            "Content-Type":"application/x-www-form-urlencoded"
          },
        body: searchParams
    })
    .then((response) =>{
        return response.json();
    })
    .then((response)=>{
        const token = response?response.access_token:null;
        if(token){
        console.log("Successfully retrieved token",types.info);
        }else{
        console.log("Failed to get token",types.warning);
        if(response.error_description){
            console.log(response.error_description,types.error);
        }
        }
        return token;

    })
    .catch(reason =>{
    console.log("Failed to get token", types.error);
    console.log("Bad request");
    });
    let t = await tokenResponse
    // console.log("tokenResponse:",t)
    return tokenResponse;

}