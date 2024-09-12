'use client'

import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri'

export default function Greet() {
  const [greeting, setGreeting] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState('');

  useEffect(() => {
    invoke<string>('greet', { name: 'ClearFocus' })
      .then(result => setGreeting(result))
      .catch(console.error)
  }, [])

  async function preloadOllama() {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: "llama3.1", keep_alive: -1 }),
      });
      const data = await response.json();
      setOllamaStatus('Ollama model preloaded');
      console.log("Ollama preload response:", data);
    } catch (error) {
      console.error("Error preloading Ollama:", error);
      setOllamaStatus('Error preloading Ollama');
    }
  }

  async function unloadOllama() {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: "llama3.1", keep_alive: 0 }),
      });
      const data = await response.json();
      setOllamaStatus('Ollama model unloaded');
      console.log("Ollama unload response:", data);
    } catch (error) {
      console.error("Error unloading Ollama:", error);
      setOllamaStatus('Error unloading Ollama');
    }
  }

  return (
    <div>
      <div>{greeting}</div>
      <button onClick={preloadOllama}>Preload Ollama</button>
      <button onClick={unloadOllama}>Unload Ollama</button>
      <div>{ollamaStatus}</div>
    </div>
  );
}