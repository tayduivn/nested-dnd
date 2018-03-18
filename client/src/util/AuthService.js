import DB from "../actions/CRUDAction";

const AuthService = {
	setLoggedOn(bool){
		localStorage["IS_LOGGED_ON"] = !!bool;
	},
	isLoggedOn(){
		if(typeof localStorage["IS_LOGGED_ON"] !== "string") return false; 

		return localStorage["IS_LOGGED_ON"].localeCompare("true") === 0;	
	},
	async checkLoggedOn(){	
		var { err, data } = await DB.fetch("loggedOn");

		if(err || !data)
			this.setLoggedOn(false);
		else 
			this.setLoggedOn(data.loggedOn);

		return this.isLoggedOn()
	},
	login(url, payload){
		if(url!=="login") url = "signup";
		return DB.create(url, payload).then(({ error, data })=>{
			if(error) {
				this.setLoggedOn(false);
				return { error, data };
			}
			else {
				this.setLoggedOn(true);
				window.location = "/";
			}
		})
	},
	logOff(){
		return DB.fetch('logout', "POST").then(({ error, data })=>{
			if(error){
				console.error("Could not log out");
				return this.isLoggedOn();
			}
			else {
				this.setLoggedOn(false);
				window.location = "/";
				return false;
			}
		});
		
	}
}

export default AuthService;