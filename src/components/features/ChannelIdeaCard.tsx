import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChannelIdea } from "@/lib/data";
import { cn } from "@/lib/utils";

interface ChannelIdeaCardProps {
    idea: ChannelIdea;
    onLaunch: (idea: ChannelIdea) => void;
}

export function ChannelIdeaCard({ idea, onLaunch }: ChannelIdeaCardProps) {
    return (
        <Card className="flex flex-col p-6 hover:shadow-md transition-shadow h-full border-t-4 border-t-primary">
            <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded">
                    {idea.contentType}
                </span>
                {idea.growthPattern && (
                    <span className={cn("text-xs font-semibold px-2 py-1 rounded",
                        idea.growthPattern === "Fast" ? "bg-green-100 text-green-700" :
                            idea.growthPattern === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"
                    )}>
                        Growth: {idea.growthPattern}
                    </span>
                )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{idea.name}</h3>
            <p className="text-text-secondary text-sm mb-6 flex-1 line-clamp-3">
                {idea.description}
            </p>

            <div className="space-y-4 pt-4 mt-auto">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">Skill Level:</span> {idea.skillLevel}
                </div>

                <Button
                    className="w-full"
                    onClick={() => onLaunch(idea)}
                >
                    Launch This Channel
                </Button>
            </div>
        </Card>
    );
}
