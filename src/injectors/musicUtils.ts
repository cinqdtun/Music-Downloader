import { 
	PLAYER_DURATION_PLACEHOLDER, 
	PLAYER_DURATION_SELECTOR, 
	PLAYER_THUMBNAIL_SELECTOR } from "@/constants/shared"
import { Music } from "@/types"
import { webFrame } from "electron"

async function getMusicData(): Promise<any> {
	const data = await webFrame.executeJavaScript(
		`(function() {
			const player = document.querySelector('#movie_player');
			return player?.getVideoData();
		})()`,
		true
	);

	return data;
}

export async function getMusic() : Promise<Music | undefined> {
	const videoData = await getMusicData();

	if (!videoData) { return; }

	const playerDuration = document.querySelector(PLAYER_DURATION_SELECTOR);
	const playerCover = document.querySelector(PLAYER_THUMBNAIL_SELECTOR);

	if (!playerDuration || !playerCover) { return; }

	// Get duration
	const durationSplit = playerDuration.textContent.split("/");
	const duration = durationSplit.length < 2 ? 
		durationSplit[0].trim() : 
		durationSplit.at(-1)?.trim();

	if (duration === PLAYER_DURATION_PLACEHOLDER) { return; }

	// Get title
	const title = videoData.title?.trim();

	// Get artist
	const artist = videoData.author?.trim();

	// Get music id
	const musicId = videoData.video_id?.trim();

	// Get cover link
	const coverLink = playerCover.getAttribute("src")?.trim();

	if (!coverLink || 
		!title || 
		!artist || 
		!musicId || 
		!duration || 
		coverLink.length < 1 || 
		title.length < 1 || 
		artist.length < 1 || 
		musicId.length < 1 || 
		duration.length < 1) { return; }

	return {
		cover: coverLink,
		title: title,
		artist: artist,
		duration: duration,
		id: musicId,
		platform: "youtube"
	};
}