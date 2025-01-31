import { type Reflection, db } from "./db";

export async function addReflection(reflection: Reflection): Promise<number> {
  return db.reflections.add(reflection);
}

export async function getReflectionForYear(
  year: number,
): Promise<Reflection | undefined> {
  console.log("getting reflection for year", year);
  return db.reflections
    .where("year")
    .equals(year)
    .and((r) => r.type === "yearly")
    .first();
}

export async function updateReflection(
  id: number,
  reflection: Partial<Reflection>,
): Promise<number> {
  return db.reflections.update(id, reflection);
}

export async function deleteReflection(id: number): Promise<void> {
  await db.reflections.delete(id);
}
