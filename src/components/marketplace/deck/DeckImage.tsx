import { useState } from "react";
import { cn } from "@/lib/utils";

interface DeckImageProps {
  src: string;
  alt: string;
  className?: string;
}

const DeckImage = ({ src, alt, className }: DeckImageProps) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn(
        "relative w-full h-full bg-gray-200 dark:bg-gray-800",
        className,
      )}
    >
      {/* Skeleton loader */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gray-300 dark:bg-gray-700" />
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-500",
          loaded ? "opacity-100" : "opacity-0",
        )}
        srcSet={`${src}?w=300 300w, ${src}?w=600 600w`}
        sizes="(max-width: 640px) 300px, 600px"
      />
    </div>
  );
};

export default DeckImage;
