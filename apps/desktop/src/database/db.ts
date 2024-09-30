import Dexie, { type EntityTable } from 'dexie';

interface Task {
  id: number;
  title: string;
  completed: boolean;
}


export const db = new Dexie('focu-db') as Dexie & {
  tasks: EntityTable<
    Task,
    'id'
  >;
};;

db.version(1).stores({
  tasks: '++id, title, completed',
});

