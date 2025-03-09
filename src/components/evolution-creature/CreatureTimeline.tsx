
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CreatureTimelinePoint } from "./types";
import { fetchCreatureTimeline } from "./creatureUtils";
import { format } from "date-fns";

interface CreatureTimelineProps {
  userId: string;
}

export function CreatureTimeline({ userId }: CreatureTimelineProps) {
  const [timelineData, setTimelineData] = useState<CreatureTimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<CreatureTimelinePoint | null>(null);

  useEffect(() => {
    const loadTimelineData = async () => {
      setLoading(true);
      try {
        const data = await fetchCreatureTimeline(userId);
        setTimelineData(data);
        if (data.length > 0) {
          setSelectedPoint(data[data.length - 1]); // Select the most recent by default
        }
      } catch (error) {
        console.error("Error loading timeline data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadTimelineData();
    }
  }, [userId]);

  const handleSelectPoint = (point: CreatureTimelinePoint) => {
    setSelectedPoint(point);
  };

  // Helper function to get aspect color
  const getAspectColor = (aspect: string, value: number) => {
    const colorMap: Record<string, string> = {
      strength: "#FF6B6B",
      endurance: "#66B2FF",
      flexibility: "#FFA500",
      balance: "#50C878"
    };
    
    return colorMap[aspect] || "#CCCCCC";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (timelineData.length === 0) {
    return (
      <div className="text-center text-gray-400 h-[200px] flex items-center justify-center">
        <p>No evolution history available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative h-12 overflow-x-auto">
        <div className="absolute h-1 bg-[#333333] top-6 left-0 right-0 z-0"></div>
        <div className="absolute flex items-center space-x-10 h-full">
          {timelineData.map((point, index) => (
            <motion.button
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col items-center cursor-pointer group`}
              onClick={() => handleSelectPoint(point)}
            >
              <span className="text-xs text-gray-400 mb-1 group-hover:text-white transition-colors">
                {format(new Date(point.date), "MMM yyyy")}
              </span>
              <div 
                className={`w-4 h-4 rounded-full z-10 transition-all ${
                  selectedPoint === point 
                    ? "bg-purple-500 scale-125" 
                    : "bg-[#444444] group-hover:bg-[#666666]"
                }`}
              ></div>
              <div 
                className={`absolute -top-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs ${
                  selectedPoint === point ? "text-purple-300" : "text-gray-500 group-hover:text-gray-300"
                }`}
              >
                Level {point.level}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {selectedPoint && (
        <motion.div 
          key={selectedPoint.date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-[#333333] rounded-lg p-3 space-y-3"
        >
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-white">
              {format(new Date(selectedPoint.date), "MMMM d, yyyy")}
            </span>
            <span className="text-purple-300">
              Level {selectedPoint.level} {selectedPoint.type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(selectedPoint.aspects).map(([aspect, value]) => (
              <div key={aspect} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getAspectColor(aspect, value) }}
                ></div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs">
                    <span className="capitalize text-gray-300">{aspect}</span>
                    <span className="text-white">{Math.round(value)}%</span>
                  </div>
                  <div className="h-1 bg-[#444444] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${value}%`,
                        backgroundColor: getAspectColor(aspect, value)
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
