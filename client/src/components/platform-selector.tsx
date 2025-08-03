import { Button } from "@/components/ui/button";

interface Platform {
  id: string;
  name: string;
  icon: string;
  className: string;
}

const platforms: Platform[] = [
  { id: "facebook", name: "Facebook", icon: "📘", className: "platform-facebook" },
  { id: "instagram", name: "Instagram", icon: "📷", className: "platform-instagram" },
  { id: "x", name: "X/Twitter", icon: "🐦", className: "platform-x" },
  { id: "linkedin", name: "LinkedIn", icon: "💼", className: "platform-linkedin" },
  { id: "tiktok", name: "TikTok", icon: "🎵", className: "platform-tiktok" },
  { id: "youtube", name: "YouTube", icon: "📺", className: "platform-youtube" },
  { id: "pinterest", name: "Pinterest", icon: "📌", className: "platform-pinterest" },
  { id: "reddit", name: "Reddit", icon: "🔴", className: "platform-reddit" },
  { id: "snapchat", name: "Snapchat", icon: "👻", className: "platform-snapchat" },
  { id: "telegram", name: "Telegram", icon: "✈️", className: "platform-telegram" },
  { id: "threads", name: "Threads", icon: "🧵", className: "platform-threads" },
  { id: "bluesky", name: "Bluesky", icon: "🦋", className: "platform-bluesky" },
  { id: "google_business", name: "Google", icon: "🏢", className: "platform-google_business" },
];

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformToggle: (platformId: string) => void;
  maxColumns?: number;
}

export default function PlatformSelector({ 
  selectedPlatforms, 
  onPlatformToggle,
  maxColumns = 6 
}: PlatformSelectorProps) {
  return (
    <div className={`grid grid-cols-3 md:grid-cols-${maxColumns} gap-3`}>
      {platforms.map((platform) => {
        const isSelected = selectedPlatforms.includes(platform.id);
        return (
          <Button
            key={platform.id}
            type="button"
            variant="outline"
            onClick={() => onPlatformToggle(platform.id)}
            className={`flex flex-col items-center p-3 h-auto transition-all ${
              isSelected
                ? platform.className
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg mb-1">{platform.icon}</span>
            <span className="text-xs">{platform.name}</span>
          </Button>
        );
      })}
    </div>
  );
}
