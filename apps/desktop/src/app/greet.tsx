'use client'

import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/tauri'

export default function Greet() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    invoke<string>('greet', { name: 'ClearFocus' })
      .then(result => setGreeting(result))
      .catch(console.error)
  }, [])

  
  return <div>{greeting}</div>;
}