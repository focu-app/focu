import { useState } from "react";
import { useTodoStore } from "../store/todoStore";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Trash2 } from "lucide-react";

export function TodoList() {
  const { todos, addTodo, toggleTodo, removeTodo } = useTodoStore();
  const [newTodo, setNewTodo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    addTodo(newTodo);
    setNewTodo("");
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="flex-1 mr-2"
            placeholder="Add a new todo..."
          />
          <Button type="submit">Add</Button>
        </div>
      </form>
      <ul className="space-y-2">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id)}
                className="mr-2"
              />
              <span className={todo.completed ? "line-through" : ""}>
                {todo.text}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTodo(todo.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
