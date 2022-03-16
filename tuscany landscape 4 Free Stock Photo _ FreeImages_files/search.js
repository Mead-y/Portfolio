document.addEventListener("DOMContentLoaded", function () {
	var searchSuggestionsActive = false;
	var currentFocus;

	function autocomplete(inp) {
		let keywords = [];
		var maxSearchSuggestions = 10;
		currentFocus = -1;

		// Listen for search input text changes and show suggestions
		inp.addEventListener("input", async function () {
			clearSuggestions();
			var value = this.value;
			if (value.length < 3) {
				currentFocus = -1;
				hideSearchSuggestions();
			} else {
				try {
					keywords = await getSuggestions(value);
					showSearchSuggestions();
					clearSuggestions();
					createSuggestions(value, keywords);
					removeFirstElementTopBorder()
				} catch (error) {
					console.error(error);
				}
			}
		});

		// Listen for keys pressed
		inp.addEventListener("keydown", function (event) {
			const suggestionItems = document.querySelector(
				"#search-suggestions > div > ul"
			);
			if (suggestionItems.children.length > 0) {
				// Arrow down key pressed
				if (event.keyCode == 40) {
					currentFocus++;
					setActiveItem(suggestionItems);
					setInuptValue(suggestionItems);
					// Arrow up key pressed
				} else if (event.keyCode == 38) {
					currentFocus--;
					setActiveItem(suggestionItems);
					setInuptValue(suggestionItems);
					// Enter key pressed
				} else if (event.keyCode == 13) {
					event.preventDefault();
					if (currentFocus > -1) {
						suggestionItems.children[currentFocus].click();
					} else {
						document.getElementById("search-submit-button").click();
					}
				}
			}
		});

		function createSuggestionItem(value, keyword) {
			// Search input value is substring of any keyword
			if (value == keyword["name"].substr(0, value.length)) {
				var item = document.querySelector("#search-suggestion-item").cloneNode(true);

				const match = keyword["name"].substr(0, value.length);
				const rest = keyword["name"].substr(value.length);
				item.setAttribute("data-value", keyword["name"]);
				item.innerHTML = `
					<a href=${keyword["link"]}>
						${match}
						<span class="text-gray-font">
							${rest}
						</span>
					</a>
				`;
				item.classList.remove("hidden");

				// Submit search on click
				item.addEventListener("click", function () {
					inp.value = this.getAttribute("data-value");
					searchSubmit(null)
					hideSearchSuggestions();
					clearSuggestions();
				});

				// Set active on hover
				item.addEventListener("mouseover", function () {
					currentFocus = Array.from(this.parentElement.children).indexOf(this);
					setActiveItem(
						document.querySelector("#search-suggestions > div > ul")
					);
				});

				return item;
			}
		}

		function createSuggestions(value, keywords) {
			for (i = 0; i < keywords.length; i++) {
				var item = createSuggestionItem(value, keywords[i]);
				if (item && i < maxSearchSuggestions) {
					document.querySelector("#search-suggestions > div > ul")
						.appendChild(item);
					const itemList = Array.from(item.parentElement.children)
					const itemIndex = itemList.indexOf(item);
					item.setAttribute(
						"id",
						`${item.getAttribute("id")}-${itemIndex}`
					);
					item.setAttribute("data-index", itemIndex);
				}
			}
		}

		function clearSuggestions() {
			document.querySelector("#search-suggestions > div > ul").innerHTML = "";
		}

		function setActiveItem(suggestionItems) {
			if (!suggestionItems) {
				return false;
			}
			removeActiveItem(suggestionItems);
			if (currentFocus >= suggestionItems.children.length) {
				currentFocus = 0;
			}
			if (currentFocus < 0) {
				currentFocus = suggestionItems.children.length - 1;
			}
			suggestionItems.children[currentFocus].classList.add(
				"bg-search-bar-border"
			);
		}

		function setInuptValue(suggestionItems) {
			inp.value = suggestionItems.children[currentFocus].getAttribute("data-value");
		}

		function removeActiveItem(suggestionItems) {
			for (var i = 0; i < suggestionItems.children.length; i++) {
				suggestionItems.children[i].classList.remove("bg-search-bar-border");
			}
		}

		function removeFirstElementTopBorder() {
			if (
				document.querySelector("#search-suggestions > div > ul")
					.children.length > 0
			) {
				const el = document.querySelector(
					"#search-suggestions > div > ul > *:first-child"
				);
				el.classList.remove("border-t");
				el.classList.remove("border-search-bar-border");
			}
		}
	}

	// Show seach menu options on hover
	document.querySelector("#search-menu-button").addEventListener(
		"mouseover",
		// Handle mouse in
		function () {
			if (searchSuggestionsActive) {
				hideSearchSuggestions();
				showSearchMenuOptions();
			} else {
				showSearchMenuOptions();
			}
		}
	);

	document.querySelector("#search-menu-button")
		.addEventListener("mouseout", function () {
			hideSearchMenuOptions();
		}
	);

	// Set selected search option
	document.querySelector("#search-menu-options > div ")
		.addEventListener("click", function (event) {
			if (event.target.tagName === "SPAN") {
				document.querySelector("#selected-option")
					.setAttribute("data-value", event.target.getAttribute("data-value"));
				document.querySelector("#selected-option").textContent =
					event.target.textContent;
			}
		}
	);

	// Show search suggestions when clicked
	document.querySelector("#search-input")
		.addEventListener("click", function () {
			if (this.value !== "" && search_suggestions_enabled) {
				showSearchSuggestions();
			}
		}
	);

	// Hide search suggestions when clicked outside of it
	document.addEventListener("click", function (event) {
		var element = document.querySelector("#search-input");
		if (!element.contains(event.target)) {
			if (searchSuggestionsActive) {
				hideSearchSuggestions();
			}
		}
	});

	function showSearchSuggestions() {
		document.querySelector("#search-suggestions").classList.remove("hidden");
		document.querySelector("#search-suggestions").classList.add("flex");
		document.querySelector("#search-bar").classList.remove("rounded-bl-3xl");
		document.querySelector("#search-bar").classList.remove("rounded-br-3xl");
		searchSuggestionsActive = true;
	}

	function hideSearchSuggestions() {
		document.querySelector("#search-suggestions").classList.remove("flex");
		document.querySelector("#search-suggestions").classList.add("hidden");
		document.querySelector("#search-bar").classList.add("rounded-bl-3xl");
		document.querySelector("#search-bar").classList.add("rounded-br-3xl");
		searchSuggestionsActive = false;
	}

	function showSearchMenuOptions() {
		document.querySelector("#search-menu-options").classList.remove("hidden");
		document.querySelector("#search-menu-options").classList.add("block");
		document.querySelector("#search-bar").classList.remove("rounded-bl-3xl");
	}

	function hideSearchMenuOptions() {
		document.querySelector("#search-menu-options").classList.remove("block");
		document.querySelector("#search-menu-options").classList.add("hidden");
		document.querySelector("#search-bar").classList.add("rounded-bl-3xl");
	}

	function getSuggestions(keyword) {
		return new Promise(function (resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open("POST", "/ajax/suggested-keywords", true);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.onload = function () {
				if (xhr.status === 200) {
					var response = JSON.parse(xhr.responseText);
					if (!response.error) {
						resolve(response.data.keywords);
					}
				} else {
					reject([]);
				}
			};

			xhr.send(
				JSON.stringify({
					keyword: keyword,
					lang: document.documentElement.lang,
				})
			);
		});
	}

	if (search_suggestions_enabled) {
		autocomplete(document.querySelector("#search-input"));
	}

	if (isSearchView() && IS_SEARCH_PIG_ENABLED && !hasPigCookie()) {
		const links = document.querySelectorAll(".pagination a.link");
		links.forEach((link) => {
			link.addEventListener("click", function (event) {
				const keyword = document.querySelector("#search-input").value;
				searchIstock(keyword);
				setPigCookie();
			});
		});
	}
});

// Search contents
function searchSubmit(e) {
	e !== null && e.preventDefault();
	const keyword = document.querySelector("#search-input").value;
	const type = document.querySelector("#selected-option")
					.getAttribute("data-value");
	if (type === "istock") {
		searchIstock(keyword);
	} else {
		if (IS_SEARCH_PIG_ENABLED && !hasPigCookie()){
			searchIstock(keyword);
			setPigCookie();
		}
		searchAll(keyword);
	}
}

function searchAll(keyword){
	const actualUrl = window.location.href;
	const firstFolder = actualUrl.split('/')[3];
	var language = "";
	if(firstFolder && AVAILABLE_LANGUAGES_FOLDERS.includes(firstFolder)){
			language = firstFolder + "/";
	} else {
			language = "";
	}
	keyword = keyword.toLowerCase();
	keyword = keyword.replace(' ', '-');
	const url = "/" + language + "search/" + keyword;
	window.location.href = url;
}

function searchIstock(keyword) {
	const urlIstock = `https://www.istockphoto.com/es/search/2/image?phrase=${keyword}`;
	const url = `https://istockphoto.6q33.net/c/${IMPACT_RADIUS_ID}/270498/4205?u=${urlIstock}&sharedid=site_search_bar`;
	window.open(url, "_blank").focus();
}

function hasPigCookie() {
	return document.cookie.includes("pig=true");
}

function setPigCookie() {
	const date = new Date();
	date.setMonth(date.getMonth() + 1);
	document.cookie = `pig=true; path=/; expires=${date.toUTCString()}`;
}

function isSearchView() {
	return window.location.pathname.includes('/search/')
}