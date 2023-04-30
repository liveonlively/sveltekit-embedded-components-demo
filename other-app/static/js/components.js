class SvelteKitComponents {
	constructor(componentSet) {
		this._onLoad = [];
		this.loaded = false;
		this.loading = false;
		this.componentSet = componentSet || "embedded";
		this.renderTarget = document.getElementById(
			"svelte_kit_components_render"
		);
		if (!this.renderTarget) {
			this.renderTarget = document.createElement("div");
			this.renderTarget.id = "svelte_kit_components_render";
			document.body.appendChild(this.renderTarget);
		}
		this.load();
	}

	onLoad(func) {
		if (this.loaded) {
			func();
			return;
		}
		this._onLoad.push(func);
	}

	load() {
		if (this.loading || this.loaded) {
			return Promise.resolve();
		}
		this.iframe = document.getElementById(
			this.componentSet + "_components"
		);
		if (!this.iframe) {
			this.iframe = document.createElement("iframe");

			this.iframe.src = "/components/" + this.componentSet;
			this.iframe.style.display = "none";
			document.body.appendChild(this.iframe);
		}

		var iframe = this.iframe;
		var initializedWindow = false;
		var skippedWindowClickEvent = false;
		var awaitLoad = (resolve) => {
			if (iframe.contentWindow && !initializedWindow) {
				initializedWindow = true;
				(function (w, i) {
					var originalAdd = i.addEventListener;
					i.addEventListener = function () {
						if (
							arguments[0] === "click" &&
							!skippedWindowClickEvent
						) {
							// skipping the first click handler for sveltekit routing
							skippedWindowClickEvent = true;
						} else {
							// add window event listener
							w.addEventListener.apply(w, arguments);
						}
						return originalAdd.apply(this, arguments);
					};

					var originalRemove = i.removeEventListener;
					i.removeEventListener = function () {
						w.removeEventListener.apply(w, arguments);
						return originalRemove.apply(this, arguments);
					};
				})(window, iframe.contentWindow);
			}

			if (!iframe.contentWindow[this.componentSet + "_components"]) {
				setTimeout(function () {
					awaitLoad(resolve);
				}, 250);
				return;
			}
			resolve();
		};

		return new Promise(function (resolve, _) {
			awaitLoad(resolve);
		}).then(() => {
			this.components =
				iframe.contentWindow[this.componentSet + "_components"];
			var ourHead = document.querySelector("head");
			var componentHead =
				iframe.contentWindow.document.querySelector("head");
			var componentBody =
				iframe.contentWindow.document.querySelector("body");
			var currentLinks = iframe.contentWindow.document.querySelectorAll(
				"link[rel=stylesheet]"
			);
			currentLinks.forEach(function (node) {
				ourHead.appendChild(node);
			});
			var currentStyle =
				iframe.contentWindow.document.querySelectorAll("style");
			currentStyle.forEach(function (node) {
				ourHead.appendChild(node);
			});
			const observer = new MutationObserver(function (mutationList) {
				mutationList.forEach(function (mutation) {
					// console.log({ mutation });
					if (mutation.addedNodes && mutation.addedNodes.length > 0) {
						mutation.addedNodes.forEach(function (node) {
							node._clone = node.cloneNode(true);
							ourHead.appendChild(node._clone);
						});
					}
					if (
						mutation.removedNodes &&
						mutation.removedNodes.length > 0
					) {
						mutation.removedNodes.forEach(function (node) {
							if (node._clone) {
								ourHead.removeChild(node._clone);
							} else {
								// not removing node from head, we didn't clone it
							}
						});
					}
				});
			});
			observer.observe(componentHead, {
				childList: true,
			});
			if (iframe.contentWindow[this.componentSet + "_components"].Modal) {
				window["openModal"] = (config) => {
					config = Object.assign(
						{
							html: "",
							onClose: undefined, // function
						},
						config
					);
					var modal = new this.components.Modal({
						target: this.renderTarget,
						intro: true,
						props: {
							customWindow: window,
							target: document.body,
							html: config.html,
						},
					});
					return modal.$on("close", function () {
						if (config.onClose) {
							config.onClose();
						}
						modal.$destroy();
					});
				};
			}
			this._onLoad.forEach(function (func) {
				func();
			});
		});
	}
}

window["SvelteKitComponents"] = SvelteKitComponents;
