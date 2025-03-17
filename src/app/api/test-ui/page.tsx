'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function TestReplicatePage() {
  const [prompt, setPrompt] = useState('A photorealistic portrait of a young caucasian female with blue eyes, blonde long hair, athletic body type');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<any>(null);

  async function testApiKey() {
    try {
      setLoading(true);
      const res = await fetch('/api/test-replicate');
      const data = await res.json();
      setApiStatus(data);
    } catch (err: any) {
      setError(err.message || 'Error testing API key');
    } finally {
      setLoading(false);
    }
  }

  async function generateImage() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/generate-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.imageUrl) {
        setImage(data.imageUrl);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Error generating image');
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Replicate API Test</h1>

      <div className="mb-8 p-4 bg-gray-800 rounded-md">
        <h2 className="text-xl font-semibold mb-4">Test API Key</h2>
        <button
          onClick={testApiKey}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Key'}
        </button>

        {apiStatus && (
          <div className="mt-4 p-4 bg-gray-700 rounded-md overflow-auto">
            <pre className="text-sm">{JSON.stringify(apiStatus, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="mb-8 p-4 bg-gray-800 rounded-md">
        <h2 className="text-xl font-semibold mb-4">Generate Simple Image</h2>
        <div className="mb-4">
          <label className="block mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md"
            rows={4}
          />
        </div>

        <button
          onClick={generateImage}
          disabled={loading || !prompt.trim()}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {image && (
          <div className="mt-6">
            <div className="aspect-square relative max-w-md mx-auto border border-gray-700 rounded-md overflow-hidden">
              <Image
                src={image}
                alt="Generated image"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 