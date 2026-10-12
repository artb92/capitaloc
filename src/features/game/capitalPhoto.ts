import { useEffect, useState } from "react";

export type Photo = { src: string; page: string };

const cache = new Map<string, Promise<Photo | null>>();

/** Main image (Wikidata P18) of a Wikidata item, as a Commons thumbnail. */
export function fetchPhoto(qid: string): Promise<Photo | null> {
  let photo = cache.get(qid);
  if (!photo) {
    photo = fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P18&format=json&origin=*`,
    )
      .then((r) => r.json())
      .then((json) => {
        const file: unknown = json?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
        if (typeof file !== "string") return null;
        const name = encodeURIComponent(file.replaceAll(" ", "_"));
        const result = {
          src: `https://commons.wikimedia.org/wiki/Special:FilePath/${name}?width=800`,
          page: `https://commons.wikimedia.org/wiki/File:${name}`,
        };
        new Image().src = result.src; // warm the browser cache before the round shows it
        return result;
      })
      // A missing photo never blocks the game: the round just shows no picture.
      .catch(() => null);
    cache.set(qid, photo);
  }
  return photo;
}

export function useCapitalPhoto(qid: string | null): Photo | null {
  const [photo, setPhoto] = useState<{ qid: string; photo: Photo | null } | null>(null);
  useEffect(() => {
    if (!qid) return;
    let live = true;
    fetchPhoto(qid).then((p) => live && setPhoto({ qid, photo: p }));
    return () => {
      live = false;
    };
  }, [qid]);
  return photo?.qid === qid ? photo.photo : null;
}
