'use client'

import { useState, useEffect } from 'react';
import ollama from 'ollama/browser'

export default function Ollama() {
  const [ollamaStatus, setOllamaStatus] = useState('');
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [runningModels, setRunningModels] = useState<any[]>([]);

  useEffect(() => {
    fetchInstalledModels();
    fetchRunningModels();
  }, []);

  async function fetchInstalledModels() {
    try {
      const models = await ollama.list();
      setInstalledModels(models.models.map(model => model.name));
    } catch (error) {
      console.error("Error fetching installed models:", error);
    }
  }

  async function fetchRunningModels() {
    try {
      const models = await ollama.ps();
      setRunningModels(models.models);
    } catch (error) {
      console.error("Error fetching running models:", error);
    }
  }

  async function preloadModel() {
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
      await fetchRunningModels();
      console.log("Ollama preload response:", data);
    } catch (error) {
      console.error("Error preloading Ollama:", error);
      setOllamaStatus('Error preloading Ollama');
    }
  }

  async function unloadModel() {
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
      await fetchRunningModels();
      console.log("Ollama unload response:", data);
    } catch (error) {
      console.error("Error unloading Ollama:", error);
      setOllamaStatus('Error unloading Ollama');
    }
  }

  async function reloadData() {
    setOllamaStatus('Reloading...');
    await Promise.all([fetchInstalledModels(), fetchRunningModels()]);
    setOllamaStatus('Data reloaded');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow-md rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Ollama Model Management</h1>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={preloadModel}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
        >
          Preload Model
        </button>
        <button
          onClick={unloadModel}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
        >
          Unload Model
        </button>
        <button
          onClick={reloadData}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
        >
          Reload Data
        </button>
      </div>
      <div className="mb-4 text-sm font-medium text-gray-600">{ollamaStatus}</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Installed Models</h2>
          <ul className="bg-gray-100 rounded-md p-3">
            {installedModels.map((model, index) => (
              <li key={index} className="mb-1 last:mb-0">{model}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Running Models</h2>
          <ul className="bg-gray-100 rounded-md p-3">
            {runningModels.map((model, index) => (
              <li key={index} className="mb-1 last:mb-0">
                <span className="font-medium">{model.model}</span> - PID: {model.pid}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}