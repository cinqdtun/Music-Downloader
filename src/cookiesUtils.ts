import { session } from "electron"
import { 
	CONSENT_COOKIE_DOMAIN, 
	CONSENT_COOKIE_NAME, 
	CONSENT_COOKIE_URL, 
	CONSENT_COOKIE_VALUE } from "@/constants/main"

export async function injectCookies() {
	// Inject consent for Youtube Music
	const date = new Date();
	date.setUTCHours(0, 0, 0, 0);

	const midnightUtc = Math.floor(date.getTime() / 1000);
	const cookieExp = midnightUtc + 365 * 24 * 60 * 60;

	await session.defaultSession.cookies.set({
		url: CONSENT_COOKIE_URL,
		domain: CONSENT_COOKIE_DOMAIN,
		path: '/',
		name: CONSENT_COOKIE_NAME,
		value: CONSENT_COOKIE_VALUE,
		secure: true,
		httpOnly: false,
		sameSite: 'lax',
		expirationDate: cookieExp
	});
}