import { Music } from "@/types";

export function removeMusic(musics: Music[], music: Music) : Music[] {
	const musi = musics.filter((_music: Music) => !areMusicsEqual(music, _music));

	return musi;
}

export function addMusic(musics: Music[], music: Music) : Music[] | null {
	if (isMusicPresent(musics, music)) {
		return null;
	}

	return [music, ...musics];
}

export function isMusicPresent(musics: Music[], music: Music) : Boolean {
	return musics.some((_music: Music) => {
		return areMusicsEqual(music, _music);
	});
}

function areMusicsEqual(a: Music, b: Music) : Boolean {
	if (a.platform === 'youtube' && a.platform === b.platform && a.id === b.id) {
		return true;
	}

	if (a.title === b.title && a.artist === b.artist) {
		return true;
	}

	return false;
}