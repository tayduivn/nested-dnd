
const AuthService = {
	setLoggedOn(bool){
		localStorage["IS_LOGGED_ON"] = !!bool;
	},
	isLoggedOn(){
		return localStorage["IS_LOGGED_ON"].localeCompare("true") === 0;	
	},
	checkLoggedOn(callback){
		let _this = this;
		
		fetch("/api/loggedOn", { 
			credentials: 'include',
		  "Accept": "application/json" 
		}).then((response)=>{
			if(response.status !== 200){
				_this.setLoggedOn(false);
				return callback(false);
			}
			else{
				return response.json();
			}
		}).then((json)=>{
			if(!json)
				_this.setLoggedOn(false);
			else 
				_this.setLoggedOn(json.loggedOn);
			callback(_this.isLoggedOn())
		});
	},
	logOff(callback){
		fetch('/api/logout', { credentials: 'include', method: 'post' }).then((response)=>{
			if(response.status === 200){
				this.setLoggedOn(false);
				window.location = "/";
			}
			else{
				console.error("Could not log out");
			}
			callback(this.isLoggedOn());
		});
		
	}
}

export default AuthService;