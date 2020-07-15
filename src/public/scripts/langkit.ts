interface langKitData {
	langname: string;
	constants: string[];
	constantfrequency: number[];
	vowels: string[];
	vowelfrequency: number[];
	diphtongs: string[];
	diphtongfrequency: number[];
	digraphs: string[];
	digraphfrequency: number[];
	syllables: string[];
	syllablefrequency: number[];
	prefixes: string[];
	wordlength: number[];
	repeatedletters: boolean;
	spaceafterprefix: boolean;
	autocapitalization: boolean;
	[key: string]: string | string[] | number[] | boolean;
}

interface langKitElements {
	langname: HTMLInputElement;
	constants: HTMLInputElement;
	constantfrequency: HTMLInputElement;
	vowels: HTMLInputElement;
	vowelfrequency: HTMLInputElement;
	diphtongs: HTMLInputElement;
	diphtongfrequency: HTMLInputElement;
	digraphs: HTMLInputElement;
	digraphfrequency: HTMLInputElement;
	syllables: HTMLInputElement;
	syllablefrequency: HTMLInputElement;
	prefixes: HTMLInputElement;
	wordlength: HTMLInputElement;
	repeatedletters: HTMLInputElement;
	spaceafterprefix: HTMLInputElement;
	autocapitalization: HTMLInputElement;
	[key: string]: HTMLInputElement;
}

class LanguageKit {
	private generatorElements: langKitElements = <langKitElements>{};
	private generatorInput: langKitData = <langKitData>{};

	private readonly langkitEl: HTMLDivElement = document.querySelector("#mainContainer > .page > #langWrapper > .content") as HTMLDivElement;
	private readonly langkitEls: string[] = ["langname", "constants", "constantfrequency", "vowels", "vowelfrequency", "diphtongs", "diphtongfrequency", "digraphs", "digraphfrequency", "syllables", "syllablefrequency", "prefixes", "wordlength", "repeatedletters", "spaceafterprefix", "autocapitalization"];

	constructor() {
		for (let n in this.langkitEls) {
			this.generatorElements[this.langkitEls[n]] = this.langkitEl.querySelector("#" + this.langkitEls[n]) as HTMLInputElement;

			if (this.generatorElements[this.langkitEls[n]].getAttribute("type") === "text") {
				this.generatorElements[this.langkitEls[n]].value = "";
			}
			else if (this.generatorElements[this.langkitEls[n]].getAttribute("type") === "checkbox") {
				this.generatorElements[this.langkitEls[n]].checked = false;
			}

			this.generatorElements[this.langkitEls[n]].addEventListener("change", () => {
				this.changeLanguage();
				this.generateWords();
			});
		}

		this.generatorElements["amount"] = this.langkitEl.querySelector("#amount") as HTMLInputElement;
		this.generatorElements["amount"].value = "100";

		this.generatorElements["output"] = this.langkitEl.querySelector("#output") as HTMLInputElement;
		this.generatorElements["output"].innerHTML = "";

		(this.langkitEl.querySelector("#generate") as HTMLButtonElement).addEventListener("click", () => { this.generateWords(); });
		(this.langkitEl.querySelector("#download") as HTMLButtonElement).addEventListener("click", () => { this.downloadLanguage(); });
		(this.langkitEl.querySelector("#upload") as HTMLButtonElement).addEventListener("click", () => { this.uploadLanguage(); });
		(this.langkitEl.querySelector("#save") as HTMLButtonElement).addEventListener("click", () => { this.saveLanguage(); });
		(this.langkitEl.querySelector("#json") as HTMLInputElement).addEventListener("change", (e) => { this.getLanguage(e); });
	}

	generateWords(): void {
		if (this.generatorInput.langname.length > 0) {
			let wordAmount: number = parseInt(this.generatorElements.amount.value);

			this.generatorElements.output.innerHTML = "";

			for (let i = 0; i < wordAmount; i++) {
				let wordLength: number = randN(this.generatorInput.wordlength[0], this.generatorInput.wordlength[1]);
				let word: string = "";

				for (let syllable = 0; syllable < wordLength; syllable++) { word += this.generateSyllable(); }

				if (!this.generatorInput.repeatedletters && hasRepeatedLetters(word)) { wordAmount++; }
				else {
					if (this.generatorInput.autocapitalization) { word = word[0].toUpperCase() + word.slice(1); }
					if (this.generatorInput.prefixes.length > -1) {
						if (this.generatorInput.spaceafterprefix) { word = " " + word; }
						word = this.generatorInput.prefixes[randN(0, this.generatorInput.prefixes.length)] + word;
					}
					this.generatorElements.output.innerHTML += "<span class='word'>" + word + "</span>";
				}
			}
		}
	}

	generateSyllable(): string {
		let str: string = randomSelect(this.generatorInput.syllables, this.generatorInput.syllablefrequency);

		let letters: string[] = [];
		for (let i = 0; i < str.length; i++) {
			switch (str[i]) {
				case "V":
					letters.push(randomSelect(this.generatorInput.diphtongs, this.generatorInput.diphtongfrequency));
					break;
				case "v":
					letters.push(randomSelect(this.generatorInput.vowels, this.generatorInput.vowelfrequency));
					break;
				case "C":
					letters.push(randomSelect(this.generatorInput.digraphs, this.generatorInput.digraphfrequency));
					break;
				case "c":
					letters.push(randomSelect(this.generatorInput.constants, this.generatorInput.constantfrequency));
					break;
			}
		}

		return letters.join("");
	}

	downloadLanguage(): void {
		if (this.generatorInput.langname.length > 0) {
			let file: string = JSON.stringify(this.generatorInput);

			let element: HTMLAnchorElement = document.createElement("a");
			element.setAttribute("href", "data:text/json;charset=utf-8," + encodeURIComponent(file));
			element.setAttribute("download", this.generatorInput.langname + ".json");
			element.style.display = "none";
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
		}
	}

	saveLanguage(): void {
		__user.userRequest("/langkit/save", undefined, this.generatorInput);
	}

	uploadLanguage(): void {
		(this.langkitEl.querySelector("#json") as HTMLInputElement).click();
	}

	getLanguage(event: Event): void {
		let file = new FileReader();
		file.readAsText(((event?.target as HTMLInputElement).files as FileList)[0], "UTF-8");

		file.addEventListener("load", (e) => {
			this.generatorInput = JSON.parse(<string>e.target?.result);
			this.setLanguage();
		});
	}

	setLanguage(): void {
		for (let n in this.langkitEls) {
			if (this.langkitEls[n] === "langname") {
				this.generatorElements[this.langkitEls[n]].value = this.generatorInput[this.langkitEls[n]].toString();
			}
			else if (this.generatorElements[this.langkitEls[n]].getAttribute("type") === "checkbox") {
				if (<boolean>this.generatorInput[this.langkitEls[n]]) { this.generatorElements[this.langkitEls[n]].checked = true; }
				else { this.generatorElements[this.langkitEls[n]].checked = false; }
			}
			else {
				this.generatorElements[this.langkitEls[n]].value = this.generatorInput[this.langkitEls[n]].toString().split(",").join(", ");
			}
		}
		this.generatorElements.amount.value = "100";
	}

	changeLanguage(): void {
		this.generatorInput = {
			langname: this.generatorElements.langname.value,

			constants: prepArray(this.generatorElements.constants),
			constantfrequency: prepArrayNum(this.generatorElements.constantfrequency),

			vowels: prepArray(this.generatorElements.vowels),
			vowelfrequency: prepArrayNum(this.generatorElements.vowelfrequency),

			diphtongs: prepArray(this.generatorElements.diphtongs),
			diphtongfrequency: prepArrayNum(this.generatorElements.diphtongfrequency),

			digraphs: prepArray(this.generatorElements.digraphs),
			digraphfrequency: prepArrayNum(this.generatorElements.digraphfrequency),

			syllables: prepArray(this.generatorElements.syllables),
			syllablefrequency: prepArrayNum(this.generatorElements.syllablefrequency),

			prefixes: prepArray(this.generatorElements.prefixes),
			wordlength: prepArrayNum(this.generatorElements.wordlength),

			repeatedletters: (this.generatorElements.repeatedletters).checked,
			spaceafterprefix: (this.generatorElements.spaceafterprefix).checked,
			autocapitalization: (this.generatorElements.autocapitalization).checked
		};
	};
}