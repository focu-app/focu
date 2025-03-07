import { FileChatClient } from "./client";

export default function FileChatPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        File-Based Chat (Experimental)
      </h1>
      <FileChatClient />
    </div>
  );
}
