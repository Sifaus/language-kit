/// VARIABLES
var __user: User;
var __elements: Elements;
var __langKit: LanguageKit;

/// INTERFACES
interface signupForm {
	username: string;
	email: string;
	password: string;
}

interface loginForm {
	username: string;
	password: string;
}

interface generalData {
	data: object;
}

/// ENTRY
document.addEventListener("DOMContentLoaded", function () {
	__elements = new Elements();
	__user = new User();
	__langKit = new LanguageKit();

	Array.from(document.getElementsByTagName("a")).forEach((el) => {
		el.addEventListener("click", (e) => { __elements.showPage((e.target as HTMLAnchorElement).name); });
	});

	Array.from(document.getElementsByClassName("user-container")).forEach((el) => {
		el.addEventListener("click", () => { __elements.toggleContainer(); });
		el.querySelectorAll("*").forEach((el) => { el.addEventListener("click", (e) => { e.stopPropagation(); }); });
	});

	__user.userRequest("/user/auth");
});

/// CLASSES
class Elements {
	constructor() { }
	private readonly specialPages: string[] = ["logo", "sign", "logi", "gith", "cont"];

	toggleUserLayout(request: XMLHttpRequest): void {
		if (request.response) {
			const accountData: any = JSON.parse(request.response);
			const accountEl: HTMLDivElement = (document.querySelector("#mainContainer > .page > #accoWrapper") as HTMLDivElement);

			(accountEl.querySelector(".title") as HTMLDivElement).innerText = accountData.username;
		}
	}

	toggleContainer(name?: string): void {
		this.hiddenAllVisibleOne(document.querySelectorAll(".user-container"), name + "Wrapper");
	}

	hiddenAllVisibleOne(els: NodeListOf<HTMLDivElement>, exceptionId: string): void {
		for (let i = 0; i < els.length; i++) {
			if (els[i].id !== exceptionId && els[i].classList.contains("visible")) {
				els[i].classList.replace("visible", "hidden");
			}
			else if (els[i].id === exceptionId && els[i].classList.contains("hidden")) {
				els[i].classList.replace("hidden", "visible");
			}
		}
	}

	showPage(name: string): void {
		if (this.specialPages.includes(name)) {
			switch (name) {
				case "logo":
				case "sign":
				case "logi":
					this.toggleContainer(name);
				case "gith":
				case "cont":
					break;
			}
		}
		else {
			document.querySelectorAll("#mainContainer > .page > div").forEach((el) => {
				if (el.id == name + "Wrapper") { el.classList.remove("removed"); }
				else { el.classList.add("removed"); }
			});
		}
	}
}

class User {
	constructor() {
		document.querySelector("#logoWrapper > .logo-wrapper > .logo > button")?.addEventListener("click", (event) => {
			__user.userRequest("/user/logout", event);
		});

		const signupEl: HTMLFormElement = document.querySelector("#signWrapper > .sign-wrapper > .sign") as HTMLFormElement;
		signupEl.querySelector("button")?.addEventListener("click", (event) => {
			__user.userRequest("/user/signup", event, {
				username: ((signupEl.querySelector("#username") as HTMLInputElement).value as string),
				email: ((signupEl.querySelector("#email") as HTMLInputElement).value as string),
				password: ((signupEl.querySelector("#password") as HTMLInputElement).value as string),
				passwordrepeat: ((signupEl.querySelector("#passwordrepeat") as HTMLInputElement).value as string),
			});
		});

		const loginEl: HTMLFormElement = document.querySelector("#logiWrapper > .logi-wrapper > .logi") as HTMLFormElement;
		loginEl.querySelector("button")?.addEventListener("click", (event) => {
			__user.userRequest("/user/login", event, {
				username: ((loginEl.querySelector("#username") as HTMLInputElement).value as string),
				password: ((loginEl.querySelector("#password") as HTMLInputElement).value as string)
			});
		});
	}

	userRequest(path: string, event?: Event, data?: signupForm | loginForm | langKitData): void {
		if (event) { event.preventDefault(); }

		let request = new XMLHttpRequest();
		request.open("POST", "http://localhost:3000" + path, true); // true = asynchronous
		request.setRequestHeader("Content-Type", "application/json; charset=UTF-8");

		if (data) { request.send(JSON.stringify(data)); }
		else { request.send(); }

		request.onreadystatechange = () => {
			if (request.readyState == XMLHttpRequest.DONE) {
				let a = JSON.parse(request.response);

				if ((a.t === "user-login" || a.t === "user-signup" || a.t === "user-auth") && a.m == "ok") {
					document.querySelectorAll(".loggedin").forEach((el) => { el.classList.remove("removed"); });
					document.querySelectorAll(".loggedout").forEach((el) => { el.classList.add("removed"); });

					__elements.toggleUserLayout(request);
					__elements.hiddenAllVisibleOne(document.querySelectorAll(".user-container"), name + "Wrapper");
				}
				else if (a.t === "user-logout" && a.m == "ok") {
					document.querySelectorAll(".loggedin").forEach((el) => { el.classList.add("removed"); });
					document.querySelectorAll(".loggedout").forEach((el) => { el.classList.remove("removed"); });
				}
				else if (a.t === "lang-save" && a.m == "ok") {

				}
				else {
					this.parseResponse(request);
				}
			}
		};

	}

	parseResponse(request: XMLHttpRequest): void {
		if (request.responseText) {
			let responseJson = JSON.parse(request.responseText);
			if (responseJson.errors) { for (let err in responseJson.errors) { console.log(responseJson.errors[err].msg); } }
			else if (responseJson.error) { console.log(responseJson.error); }
		}
	}
}

/// FUNCTIONS
function randN(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min) + min);
}

function prepArray(arrayString: HTMLInputElement): string[] {
	if (arrayString === null) { return []; }
	else { return arrayString.value.split(" ").join("").split(",") || []; }
}

function prepArrayNum(arrayString: HTMLInputElement): number[] {
	return convertArrayToInt(prepArray(arrayString));
}

function convertArrayToInt(array: string[]): number[] {
	let temp: number[] = [];
	for (let i = 0; i < array.length; i++) { temp.push(parseInt(array[i])); }
	return temp;
}

function randomSelect(dataset: string[], chanceset: number[]): string {
	let chanceset2 = chanceset.map((e, i) => chanceset.slice(0, i + 1).reduce((a, b) => a + b));
	let rand = randN(0, chanceset2[chanceset2.length - 1]);
	for (var i = 0; i < chanceset2.length; i++) { if (chanceset2[i] > rand) { return dataset[i]; } }
	return "";
}

function hasRepeatedLetters(str: string): boolean {
	var patt = /(.)\1/;
	return patt.test(str);
}