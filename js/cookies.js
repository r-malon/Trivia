function setCookie(cname, cvalue, days) {
	let expires = "";
	if (days) {
		let d = new Date();
		d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "expires=" + d.toUTCString();
	}
	document.cookie = cname + "=" + cvalue + ";" + expires;
}

function getCookie(cname) {
	let name = cname + "=";
	let ca = document.cookie.split(';');
	for (let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1, c.length);
		if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
	}
	return "";
}
