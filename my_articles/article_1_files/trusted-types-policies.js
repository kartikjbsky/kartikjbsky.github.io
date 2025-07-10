const trustedTypesLibrary =
	typeof window.trustedTypes !== 'undefined' &&
	typeof window.trustedTypes.createPolicy !== 'undefined'
	? window.trustedTypes
	: { createPolicy: (_name, rules) => rules }; // Tinyfill for unsupported browsers

class TrustedTypeValidationError extends Error
{
	constructor(message)
	{
		super(message);
		this.name = "TrustedTypeValidationError";
	}
}

function logIfDomPurifyCleans(input) {
	if (CommonSettings['LogDompurifyCleanedHtml']) {
		var cleanedHtml = DOMPurify.sanitize(input);
		if (cleanedHtml !== input) {
			console.log("Cleaned HTML: " + cleanedHtml);
			console.log("Original HTML: " + input);
		}
	}
}

function DomPurifyEnable(input, options = {}) {
	if (CommonSettings['DompurifyEnabled']) {
		return DOMPurify.sanitize(input, options);
	}
	else
	{
		return input;
	}
}

// To allow certain attributes to be kept by DOMPurify, add the attribute name and value to the brs 'DompurifyAllowedAttributes'
DOMPurify.addHook('uponSanitizeAttribute', function (node, data) {
	for (var [name, val] of Object.entries(JSON.parse(CommonSettings['DompurifyAllowedAttributes'])))
	{
		if (data.attrName && data.attrName.toLowerCase() === name.toLowerCase())
		{
			if (val === "" || (data.attrValue && data.attrValue.toLowerCase() === val.toLowerCase()))
			{
				data.forceKeepAttr = true;
			}
		}
	}
});

if (CommonSettings && !CommonSettings['DisableCSPDefaultTrustedType'])
{
	trustedTypesLibrary.createPolicy("default", {
		createHTML: (input) =>
		{
			logIfDomPurifyCleans(input);
			return DomPurifyEnable(input, { RETURN_TRUSTED_TYPE:
				typeof window.trustedTypes !== 'undefined' &&
				typeof window.trustedTypes.createPolicy !== 'undefined'});
		},
		createScriptURL: (url) =>
			{
				const parsedUrl = new URL(url);
				const baseUrls = CommonSettings.DefaultTrustedScriptUrlsList;
				if (baseUrls.some(baseUrl => parsedUrl.origin === new URL(baseUrl).origin)) {
					return url;
				}
				throw new TrustedTypeValidationError("Untrusted Script URL");
			}
	});
}

const dynamicStylePolicy = trustedTypesLibrary.createPolicy("dynamic-style", {
	createHTML: (input) =>
	{
		logIfDomPurifyCleans(input);
		let cleanHtml = DomPurifyEnable(input);
		let regex = /([^{]+)\s*{\s*([^}]+)\s*}/g;	// this regex is used to validate generic CSS style
		if (regex.test(cleanHtml))
		{
			return cleanHtml;
		}
		throw new TrustedTypeValidationError("Untrusted CSS Style");
	}
});

const copyHtmlPolicy = trustedTypesLibrary.createPolicy("copy-html", {
		createHTML: (input) => {
			logIfDomPurifyCleans(input);
			return DomPurifyEnable(input, { RETURN_TRUSTED_TYPE:
				typeof window.trustedTypes !== 'undefined' &&
				typeof window.trustedTypes.createPolicy !== 'undefined' })
		}
});

const twitterParserPolicy = trustedTypesLibrary.createPolicy("twitter-parser", {
	createHTML: (input) =>
	{
		let pattern = StoryPageEditSettings && StoryPageEditSettings['ValidEmbedSrcToConvert'] ? StoryPageEditSettings['ValidEmbedSrcToConvert']['TWITTER'] : null;
		let group1Pattern = pattern.match(/\(<p.+?<\\\/p>\)/)[0];  // this is dependent on the ValidEmbedSrcToConvert['TWITTER'] pattern which is pulled from brs. Need to put this in a different brs.
		if (group1Pattern && new RegExp(group1Pattern).test(input))
		{
			return input;
		}
		throw new TrustedTypeValidationError("Untrusted Embed Source for Twitter");
	}
});

const embedCodePolicy = trustedTypesLibrary.createPolicy("embed-code", {
	createHTML: (input) =>
	{
		let pattern = new RegExp(/(Embed:\/\/|<iframe[^>]*\s+src=([^>]+)*>.*?<\/iframe>)/gi);
		if (pattern.test(input))
		{
			return input;
		}
		throw new TrustedTypeValidationError("Untrusted Embed Code");
	}
});

const scriptUrlPolicy = trustedTypesLibrary.createPolicy("script-url", {
	createScriptURL: (url) =>
	{
		try {
			if(url === "")
			{
				return url; // Allow empty string for script URLs
			}
			const parsedUrl = new URL(url);
			const baseUrls = [CommonSettings.ContentBaseUrl, CommonSettings.NoCdnContentBaseUrl, "https:" + CommonSettings.AMSVideoPlayerCSSlink, "https:" + CommonSettings.AMSVideoPlayerJSlink, CommonSettings.UnversionedContentBaseUrl, CommonSettings.ExtensionsBaseUrl, ...(CommonSettings.TrustedScriptUrlsList || [])];
			if (baseUrls.some(baseUrl => parsedUrl.origin === new URL(baseUrl).origin)) {
				return url;
			}
		} catch (e) {
			console.error(e);
		}
		throw new TrustedTypeValidationError("Untrusted Preload Script Url");
	}
});

const trustedScriptPolicy = trustedTypesLibrary.createPolicy("trusted-script", {
	createScript: (input) =>
	{
		return input; // No validation required as the script is generated entirely by the system without user input or user interaction
	}
});

window.trustedScriptPolicy = trustedScriptPolicy;
window.embedCodePolicy = embedCodePolicy;
window.dynamicStylePolicy = dynamicStylePolicy;
window.twitterParserPolicy = twitterParserPolicy;
window.scriptUrlPolicy = scriptUrlPolicy;
window.copyHtmlPolicy = copyHtmlPolicy;
