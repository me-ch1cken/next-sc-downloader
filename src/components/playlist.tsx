interface PlaylistProps {
    title: string;
    tracks: Array<{
        artwork_url: string;
        author: string;
        duration: number;
        title: string;
    }>;
}

export default function Playlist({title, tracks} : PlaylistProps) {

    if (!tracks || tracks.length === 0) return null;

    return (
        <div className="flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <ul className="list-disc list-inside">
            {tracks.map((track: any, index: number) => (
            <li key={index} className="mb-2">
                {track.title} - {track.author}
            </li>
            ))}
        </ul>
        </div>
    );

}