import { collection, CollectionReference } from "firebase/firestore";
import { db } from "./firebase";
import { Announcement, Film } from "@/type/film-type";

export const filmsRef: CollectionReference<Film> = collection(
  db,
  "films"
) as CollectionReference<Film>;

export const announcementsRef: CollectionReference<Announcement> = collection(
  db,
  "announcements"
) as CollectionReference<Announcement>;
