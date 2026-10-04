import React from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
  aspectRatio?: '16:9' | '9:16';
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title = 'Video Showcase',
  className = '',
  aspectRatio = '16:9',
}) => {
  // Extract ID if full URL passed (supports standard watch, share youtu.be, and shorts)
  let cleanId = videoId;
  if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = videoId.match(regExp);
    if (match && match[2].length === 11) {
      cleanId = match[2];
    }
  }

  const isVertical = aspectRatio === '9:16';

  return (
    <div
      className={`relative mx-auto overflow-hidden rounded-2xl shadow-xl bg-slate-950 ${
        isVertical
          ? 'w-full max-w-[340px] sm:max-w-[380px] aspect-[9/16] border-2 border-slate-800'
          : 'w-full aspect-video border border-slate-200/80'
      } ${className}`}
    >
      <iframe
        className="w-full h-full border-0"
        src={`https://www.youtube-nocookie.com/embed/${cleanId}?rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};
