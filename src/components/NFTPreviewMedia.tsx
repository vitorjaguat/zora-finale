import type { AlchemyNFTResponse } from "../hooks/useNFTMetadata";
import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { PiPlayCircleBold, PiPauseCircleBold } from "react-icons/pi";

interface NFTPreviewMediaProps {
  nftData: AlchemyNFTResponse | null;
  id: string;
  loading?: boolean;
  className?: string;
}

export default function NFTPreviewMedia({
  nftData,
  id,
  loading = false,
  className = "",
}: NFTPreviewMediaProps) {
  const [mediaType, setMediaType] = useState<
    "image" | "audio" | "video" | "unknown"
  >("unknown");
  const [imageError, setImageError] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const resolveIPFSUrl = useCallback((url: string): string => {
    if (!url) return "";

    if (url.startsWith("ipfs://")) {
      return `https://ipfs.io/ipfs/${url.slice(7)}`;
    }
    if (url.startsWith("ipfs/")) {
      return `https://ipfs.io/ipfs/${url.slice(5)}`;
    }
    return url;
  }, []);

  const getMediaUrl = useCallback((): string => {
    if (!nftData) return "";

    const mediaUrl =
      nftData.image?.cachedUrl ??
      nftData.image?.thumbnailUrl ??
      nftData.image?.pngUrl ??
      nftData.image?.originalUrl ??
      nftData.media?.[0]?.gateway ??
      nftData.media?.[0]?.thumbnail ??
      nftData.raw?.metadata?.image ??
      nftData.raw?.metadata?.animation_url ??
      nftData.tokenUri?.gateway ??
      "";

    return resolveIPFSUrl(mediaUrl);
  }, [nftData, resolveIPFSUrl]);

  const detectMediaType = useCallback(
    async (url: string): Promise<"image" | "audio" | "video" | "unknown"> => {
      if (!url) return "unknown";

      try {
        const apiContentType =
          nftData?.image?.contentType ?? nftData?.media?.[0]?.format ?? "";
        if (apiContentType) {
          if (apiContentType.startsWith("audio/")) return "audio";
          if (apiContentType.startsWith("video/")) return "video";
          if (apiContentType.startsWith("image/")) return "image";
        }

        const response = await fetch(url, {
          method: "HEAD",
          mode: "cors",
        });

        if (response.ok) {
          const contentType = response.headers.get("content-type") ?? "";
          if (contentType.startsWith("audio/")) return "audio";
          if (contentType.startsWith("video/")) return "video";
          if (contentType.startsWith("image/")) return "image";
        }
      } catch (_error) {
        console.log("Could not fetch headers, will try browser detection");
      }

      const cleanUrl = url.split("?")[0];
      const extension = cleanUrl?.split(".").pop()?.toLowerCase();

      if (
        extension &&
        ["mp3", "wav", "ogg", "flac", "m4a", "aac", "wma", "opus"].includes(
          extension,
        )
      ) {
        return "audio";
      }
      if (
        extension &&
        [
          "mp4",
          "webm",
          "mov",
          "avi",
          "mkv",
          "flv",
          "wmv",
          "m4v",
          "ogv",
        ].includes(extension)
      ) {
        return "video";
      }
      if (
        extension &&
        [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "svg",
          "webp",
          "bmp",
          "tiff",
          "ico",
          "avif",
        ].includes(extension)
      ) {
        return "image";
      }

      return "image";
    },
    [nftData],
  );

  useEffect(() => {
    if (nftData) {
      const mediaUrl = getMediaUrl();
      if (mediaUrl) {
        void detectMediaType(mediaUrl).then(setMediaType);
      }
    }
  }, [nftData, getMediaUrl, detectMediaType]);

  const mediaUrl = getMediaUrl();
  const nftName = nftData?.name ?? `NFT #${id}`;

  const handleAudioToggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error("Audio play failed:", error);
          setAudioError(true);
          setMediaType("image");
        });
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const duration = audio.duration;
      const currentTime = audio.currentTime;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    const handleLoadedData = () => {
      // Audio loaded successfully
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadeddata", handleLoadedData);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [mediaType]);

  if (loading) {
    return (
      <div
        className={`h-20 w-full flex-shrink-0 overflow-hidden rounded border border-neutral-600 bg-neutral-800 ${className}`}
      >
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  const renderMediaContent = () => {
    if (!mediaUrl) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800">
          <div className="text-center text-xs text-neutral-400">
            <div className="mb-1 text-lg">🖼️</div>
            <div>NFT</div>
            <div>#{id}</div>
          </div>
        </div>
      );
    }

    if (mediaType === "unknown") {
      return (
        <Image
          src={mediaUrl}
          alt={nftName}
          width={80}
          height={80}
          className="h-full w-full object-contain"
          onError={() => setImageError(true)}
          unoptimized
        />
      );
    }

    switch (mediaType) {
      case "audio":
        return (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-500 p-1">
            {!audioError ? (
              <>
                <div className="relative flex flex-1 items-center justify-center">
                  <audio
                    ref={audioRef}
                    className="absolute inset-0 opacity-0"
                    onError={() => {
                      setAudioError(true);
                      setMediaType("image");
                    }}
                    preload="none"
                  >
                    <source src={mediaUrl} />
                  </audio>
                  <button
                    onClick={handleAudioToggle}
                    className="bg-opacity-30 hover:bg-opacity-50 absolute inset-0 flex items-center justify-center rounded transition-all duration-200"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    <div className="text-lg text-neutral-200">
                      {isPlaying ? (
                        <PiPauseCircleBold size={30} />
                      ) : (
                        <PiPlayCircleBold size={30} />
                      )}
                    </div>
                  </button>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-purple-700">
                  <div
                    className="h-full bg-purple-300 transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-neutral-300">
                <div>Audio</div>
                <div>#{id}</div>
              </div>
            )}
          </div>
        );

      case "video":
        return (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-600 to-neutral-900">
            {!videoError ? (
              <video
                width={80}
                height={80}
                className="h-full w-full object-contain"
                controls
                muted
                preload="none"
                onError={() => {
                  setVideoError(true);
                  setMediaType("image");
                }}
              >
                <source src={mediaUrl} />
                Your browser does not support video.
              </video>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center text-xs text-neutral-300">
                  <div className="mb-1 text-lg">🎬</div>
                  <div>Video</div>
                  <div>#{id}</div>
                </div>
              </div>
            )}
          </div>
        );

      case "image":
      default:
        return !imageError ? (
          <Image
            src={mediaUrl}
            alt={nftName}
            width={80}
            height={80}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800">
            <div className="text-center text-xs text-neutral-400">
              <div className="mb-1 text-lg">🖼️</div>
              <div>NFT</div>
              <div>#{id}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`h-60 w-60 flex-shrink-0 overflow-hidden rounded border border-neutral-600 bg-neutral-800 ${className}`}
    >
      {renderMediaContent()}
    </div>
  );
}
