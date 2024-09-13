'use client'

import { useState, useEffect, useRef } from 'react';
import ollama from 'ollama/browser';
import Chat from './chat';
import { Button } from "@repo/ui/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/components/ui/table";
import { Progress } from "@repo/ui/components/ui/progress";

export default function Ollama() {
  const [ollamaStatus, setOllamaStatus] = useState('');
  const [ollamaRunning, setOllamaRunning] = useState(true);
  const [installedModels, setInstalledModels] = useState<string[]>([]);
  const [runningModels, setRunningModels] = useState<any[]>([]);
  const [pullProgress, setPullProgress] = useState<{ [key: string]: number }>({});
  const [isPulling, setIsPulling] = useState<{ [key: string]: boolean }>({});
  const streamRef = useRef<{ [key: string]: any }>({});
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const availableModels = [
    'llama3.1:latest',
    'ajindal/llama3.1-storm:8b'
  ];

  useEffect(() => {
    fetchInstalledModels();
    fetchRunningModels();
  }, []);

  async function fetchInstalledModels() {
    try {
      const models = await ollama.list();
      setInstalledModels(models.models.map(model => model.name));
      setOllamaRunning(true);
    } catch (error) {
      console.error("Error fetching installed models:", error);
      setOllamaRunning(false);
      setInstalledModels([]);
      setOllamaStatus('Ollama is not running. Please start Ollama and refresh.');
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

  async function preloadModel(model: string) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, keep_alive: "5m", options: { num_ctx: 4096 } }),
      });
      const data = await response.json();
      await fetchRunningModels();
      console.log(`${model} preload response:`, data);
    } catch (error) {
      console.error(`Error preloading ${model}:`, error);
      setOllamaStatus(`Error preloading ${model}`);
    }
  }

  async function unloadModel(model: string) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model, keep_alive: 0 }),
      });
      const data = await response.json();
      setTimeout(() => {
        fetchRunningModels();
      }, 1000);
      console.log(`${model} unload response:`, data);
    } catch (error) {
      console.error(`Error unloading ${model}:`, error);
      setOllamaStatus(`Error unloading ${model}`);
    }
  }

  async function reloadData() {
    await Promise.all([fetchInstalledModels(), fetchRunningModels()]);
  }

  async function pullModel(model: string) {
    setIsPulling(prev => ({ ...prev, [model]: true }));
    setPullProgress(prev => ({ ...prev, [model]: 0 }));

    try {
      streamRef.current[model] = await ollama.pull({ model, stream: true });

      for await (const chunk of streamRef.current[model]) {
        if ('total' in chunk && 'completed' in chunk) {
          const percentage = Math.round((chunk.completed / chunk.total) * 100);
          setPullProgress(prev => ({ ...prev, [model]: percentage }));
        }
      }

      await fetchInstalledModels();
    } catch (error) {
      console.error(`Error pulling model ${model}:`, error);
      setOllamaStatus(`Error pulling model ${model}`);
    } finally {
      setIsPulling(prev => ({ ...prev, [model]: false }));
    }
  }

  function stopPull(model: string) {
    if (streamRef.current[model]) {
      streamRef.current[model].abort();
    }
    setIsPulling(prev => ({ ...prev, [model]: false }));
    setPullProgress(prev => ({ ...prev, [model]: 0 }));
    setOllamaStatus(`Model ${model} pull stopped`);
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b">
        <h1 className="text-2xl font-bold mb-2">Ollama Model Management</h1>
        <div className={`text-sm font-medium ${ollamaRunning ? 'text-gray-600' : 'text-red-600'}`}>
          {ollamaRunning ? ollamaStatus : 'Ollama is not running. Please start Ollama and refresh.'}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 overflow-auto border-r">
          {ollamaRunning ? (
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableModels.map((model) => {
                    const isInstalled = installedModels.includes(model);
                    const isRunning = runningModels.some(m => m.model === model);

                    return (
                      <TableRow key={model}>
                        <TableCell>{model}</TableCell>
                        <TableCell>
                          {isInstalled ? 'Installed' : 'Not Installed'}
                          {isRunning && ' (Running)'}
                        </TableCell>
                        <TableCell>
                          {!isInstalled ? (
                            <>
                              <Button
                                onClick={() => isPulling[model] ? stopPull(model) : pullModel(model)}
                                variant={isPulling[model] ? "destructive" : "default"}
                                size="sm"
                                className="mr-2"
                              >
                                {isPulling[model] ? 'Stop Installation' : 'Install'}
                              </Button>
                              {isPulling[model] && (
                                <Progress value={pullProgress[model]} className="w-[100px]" />
                              )}
                            </>
                          ) : (
                            <>
                              <Button
                                onClick={() => isRunning ? unloadModel(model) : preloadModel(model)}
                                variant={isRunning ? "destructive" : "default"}
                                size="sm"
                                className="mr-2"
                              >
                                {isRunning ? 'Stop' : 'Start'}
                              </Button>
                              {isRunning && (
                                <Button
                                  onClick={() => setSelectedModel(model)}
                                  variant="secondary"
                                  size="sm"
                                >
                                  Chat
                                </Button>
                              )}
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-4">
                <p className="text-lg font-semibold text-gray-700">Ollama is not running</p>
                <p className="text-sm text-gray-500 mt-2">Please start Ollama and click the refresh button below.</p>
              </div>
            </div>
          )}
          <div className="p-4">
            <Button
              onClick={reloadData}
              className="w-full"
              variant="outline"
            >
              Refresh Data
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {selectedModel ? (
            <Chat model={selectedModel} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg text-gray-500">Select a model to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}