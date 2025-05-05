'use client';

import Playlist from "@/components/playlist";
import { useState } from "react";

interface PlaylistProps {
  title: string;
  tracks: Array<{
      artwork_url: string;
      author: string;
      duration: number;
      title: string;
  }>;
}

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [playlist, setPlaylist] = useState({} as PlaylistProps);

  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = `http://localhost:8000/download?url=${encodeURIComponent(url)}`;
    a.download = ''; // triggers download UI
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-4 shadow-md bg-white">
        <h1 className="text-2xl font-bold">SoundLoad</h1>
        <button className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-100 flex items-center gap-2">
          <span>🔑</span> Log In
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-2xl w-full">
          <h2 className="text-4xl font-bold mb-4">Download SoundCloud Tracks Instantly</h2>
          <p className="text-lg text-gray-600 mb-6">
            Paste your SoundCloud track URL below to start downloading.
          </p>
          <div className="p-4 border rounded-lg shadow-sm bg-white flex flex-col md:flex-row gap-4">
            <input
              type="url"
              placeholder="Enter SoundCloud track URL..."
              className="flex-1 border px-3 py-2 rounded"
              value={url}
              onChange={async (e) => {
                setUrl(e.target.value);
                if (e.target.value.length > 0) {
                 const res = await fetch(`http://localhost:8000/content?url=${e.target.value}`);
                 const data = await res.json();
                 setPlaylist(data);
                 console.log(data);
                }
              }}
            />
            <button
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
              onClick={() => handleDownload(url)}
            >
              Download
            </button>
          </div>
        </div>

        <Playlist title={playlist?.title} tracks={playlist.tracks} />
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6">
        &copy; {new Date().getFullYear()} SoundLoad. All rights reserved.
      </footer>
    </div>
  );
}
