// Spotify Embed Component — responsive iframe player
interface SpotifyEmbedProps {
  type: 'artist' | 'album' | 'track' | 'playlist';
  id: string;
  width?: string;
  height?: string;
}

export default function SpotifyEmbed({ type, id, width = '100%', height = '352' }: SpotifyEmbedProps) {
  const url = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
  return (
    <iframe
      src={url}
      width={width}
      height={height}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="border-0 rounded-none"
      title={`Spotify ${type}`}
    />
  );
}
