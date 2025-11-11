import { collection, CollectionReference } from "firebase/firestore";
import { db } from "./firebase";
import { Film } from "@/type/film-type";

export const filmsRef: CollectionReference<Film> = collection(
  db,
  "films"
) as CollectionReference<Film>;
