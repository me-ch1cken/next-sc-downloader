'use client';

import Playlist from "@/components/playlist";
import { useState } from "react";

import Loader from 'rsuite/Loader';
// (Optional) Import component styles. If you are using Less, import the `index.less` file. 
import 'rsuite/Loader/styles/index.css';
import { toast } from "sonner";

interface PlaylistProps {
  title: string;
  tracks: Array<{
      artwork_url: string;
      author: string;
      duration: number;
      title: string;
  }>;
}

// Regex pattern to validate SoundCloud set URL
const validSoundCloudUrlPattern = /^https:\/\/soundcloud\.com\/[\w-]+\/sets\/[\w-]+$/;

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [playlist, setPlaylist] = useState({} as PlaylistProps);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [playlistDownloading, setPlaylistDownloading] = useState(false);

  const handleDownload = async (url: string) => {
    setPlaylistDownloading(true);
    toast("Preparing your download...", {
      duration: 5000,
      description: "Zipping tracks, please wait...",
    });
  
    try {
      // Step 1: Request backend to start preparing the download
      const prepareRes = await fetch(`http://localhost:8000/prepare-download?url=${url}`, {
        method: 'POST',
      });
      const { downloadId } = await prepareRes.json();
  
      if (!downloadId) {
        throw new Error("Invalid download ID returned.");
      }
  
      // Step 2: Poll for readiness
      let status = "preparing";
      let attempts = 0;
      const maxAttempts = 200; // 20 x 1.5s = 30 seconds max
  
      while (status === "preparing" && attempts < maxAttempts) {
        await new Promise((res) => setTimeout(res, 1500)); // wait 1.5 seconds
        const statusRes = await fetch(`http://localhost:8000/download-status/${downloadId}`);
        const statusData = await statusRes.json();
        status = statusData.status;
        attempts++;
      }
  
      if (status === "ready") {
        // Step 3: Trigger download
        const downloadUrl = `http://localhost:8000/download/${downloadId}`;
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'playlist.zip';
        a.click();
  
        toast.success("Your download is ready!");
      } else {
        throw new Error("Download preparation failed or timed out.");
      }
  
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to prepare download.");
    } finally {
      setPlaylistDownloading(false);
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
                
                // Validate if the URL is a valid SoundCloud playlist/set URL
                if (validSoundCloudUrlPattern.test(e.target.value)) {

                  setPlaylistLoading(true);
                  toast("Fetching playlist metadata...", {
                    duration: 2000
                  });

                  try {
                    const res = await fetch(`http://localhost:8000/content?url=${e.target.value}`);
                    const data = await res.json();
                    setPlaylist(data); // Assuming 'data' contains the playlist metadata
                    console.log(playlistLoading)
                    setPlaylistLoading(false);
                  } catch (err) {
                    console.error("Error fetching playlist:", err);
                    setPlaylistLoading(false);
                  }
                } else {
                  setPlaylist({} as PlaylistProps); // Clear playlist if the URL is invalid
                  console.log("Invalid SoundCloud playlist URL.");
                }
              }}
            />
            <button
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 cursor-pointer"
              onClick={() => handleDownload(url)}
              disabled={playlistDownloading}
            >
              Download
            </button>
          </div>
        </div>

        {
          playlistLoading && (
            <div className="mt-4">
              <Loader size="md" content="Loading content..." vertical />
            </div>
          )
        }

        {
          !playlistLoading && (
              <Playlist title={playlist?.title} tracks={playlist.tracks} />
          )
        }
      </main>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-6">
        &copy; {new Date().getFullYear()} SoundLoad. All rights reserved.
      </footer>
    </div>
  );
}
