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

  const handleDownload = async () => {
    if (!url) return;

    try {
      const response = await fetch(`http://localhost:8000/download?url=${url}`);
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition?.split("filename=")[1]?.replace(/"/g, "") || "tracks.zip";

      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Download failed.");
    }
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
              onClick={handleDownload}
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
