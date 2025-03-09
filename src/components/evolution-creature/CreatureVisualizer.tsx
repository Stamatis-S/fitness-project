
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { CreatureData, CreatureLevel, CreatureType, FitnessAspect } from "./types";
import { fetchCreatureData } from "./creatureUtils";
import { Share, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { CreatureTimeline } from "./CreatureTimeline";
import "./FitnessEvolution.css";

interface CreatureVisualizerProps {
  userId: string;
}

export function CreatureVisualizer({ userId }: CreatureVisualizerProps) {
  const [creatureData, setCreatureData] = useState<CreatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [activeTab, setActiveTab] = useState("creature");
  const [particles, setParticles] = useState<{id: number, size: number, x: number, y: number, duration: number}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadCreatureData = async () => {
      setLoading(true);
      try {
        const data = await fetchCreatureData(userId);
        setCreatureData(data);
        
        // Generate particles for higher level creatures
        if (data && data.level >= 4) {
          const particleCount = data.level === 5 ? 15 : 8;
          const newParticles = Array.from({ length: particleCount }, (_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: Math.random() * 5 + 3
          }));
          setParticles(newParticles);
        }
      } catch (error) {
        console.error("Error loading creature data:", error);
        toast.error("Failed to load evolution creature");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadCreatureData();
    }
  }, [userId]);

  const getBodyColor = (aspect: FitnessAspect) => {
    const value = creatureData?.aspects[aspect] || 0;
    
    // Color map based on aspect
    const colors = {
      strength: ["#FFCCCB", "#FF6B6B", "#FF0000"], // Light red to dark red
      endurance: ["#ADD8E6", "#66B2FF", "#0066CC"], // Light blue to dark blue
      flexibility: ["#FFD700", "#FFA500", "#FF8C00"], // Light gold to dark orange
      balance: ["#98FB98", "#50C878", "#006400"]  // Light green to dark green
    };
    
    // Determine color intensity based on value
    let colorIndex = 0;
    if (value > 70) colorIndex = 2;
    else if (value > 40) colorIndex = 1;
    
    return colors[aspect][colorIndex];
  };

  const getCreaturePartOpacity = (aspect: FitnessAspect) => {
    const value = creatureData?.aspects[aspect] || 0;
    return Math.max(0.4, value / 100); // Minimum opacity of 0.4
  };

  const handleShare = () => {
    if (!creatureData) return;
    
    // In a real implementation, this would generate an image of the creature
    // and provide sharing functionality
    toast.success(`Sharing your Level ${creatureData.level} ${creatureData.type}!`);
    // Here you would implement social sharing functionality
  };

  const toggleRotation = () => {
    setRotating(!rotating);
  };

  const handleViewTimeline = () => {
    setActiveTab("timeline");
  };

  const renderCreatureByLevel = (level: CreatureLevel, type: CreatureType) => {
    // The creature's appearance is based on level and type
    const creatureSize = 50 + (level * 20); // Size increases with level
    
    return (
      <motion.div 
        className="relative"
        animate={{ rotate: rotating ? 360 : 0 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ width: creatureSize, height: creatureSize }}
      >
        {/* Base creature shape */}
        <motion.div 
          className="absolute rounded-full"
          style={{
            width: creatureSize,
            height: creatureSize,
            backgroundColor: getBodyColor('balance'),
            opacity: getCreaturePartOpacity('balance'),
          }}
        />

        {/* Creature head - appears at all levels */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: creatureSize * 0.4,
            height: creatureSize * 0.4,
            top: -creatureSize * 0.2,
            left: creatureSize * 0.3,
            backgroundColor: getBodyColor('balance'),
            opacity: getCreaturePartOpacity('balance'),
          }}
        />

        {/* Creature limbs - appear from level 2 */}
        {level >= 2 && (
          <>
            {/* Arm 1 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: creatureSize * 0.15,
                height: creatureSize * 0.4,
                top: creatureSize * 0.2,
                left: -creatureSize * 0.1,
                backgroundColor: getBodyColor('strength'),
                opacity: getCreaturePartOpacity('strength'),
                transformOrigin: "bottom right",
                transform: "rotate(-45deg)",
              }}
            />
            
            {/* Arm 2 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: creatureSize * 0.15,
                height: creatureSize * 0.4,
                top: creatureSize * 0.2,
                right: -creatureSize * 0.1,
                backgroundColor: getBodyColor('strength'),
                opacity: getCreaturePartOpacity('strength'),
                transformOrigin: "bottom left",
                transform: "rotate(45deg)",
              }}
            />
          </>
        )}

        {/* Legs - appear from level 3 */}
        {level >= 3 && (
          <>
            {/* Leg 1 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: creatureSize * 0.15,
                height: creatureSize * 0.45,
                bottom: -creatureSize * 0.3,
                left: creatureSize * 0.25,
                backgroundColor: getBodyColor('endurance'),
                opacity: getCreaturePartOpacity('endurance'),
                transformOrigin: "top center",
              }}
            />
            
            {/* Leg 2 */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: creatureSize * 0.15,
                height: creatureSize * 0.45,
                bottom: -creatureSize * 0.3,
                right: creatureSize * 0.25,
                backgroundColor: getBodyColor('endurance'),
                opacity: getCreaturePartOpacity('endurance'),
                transformOrigin: "top center",
              }}
            />
          </>
        )}

        {/* Special features - appear from level 4 */}
        {level >= 4 && (
          <>
            {/* Wings, tail, or special appendage based on type */}
            {type === "Swift Runner" && (
              // Swift Runner gets speed trails
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: creatureSize * 0.8,
                  height: creatureSize * 0.2,
                  bottom: -creatureSize * 0.1,
                  left: creatureSize * 0.1,
                  backgroundColor: getBodyColor('endurance'),
                  opacity: getCreaturePartOpacity('endurance') * 0.5,
                  filter: "blur(8px)",
                }}
              />
            )}
            
            {type === "Mighty Lifter" && (
              // Mighty Lifter gets muscular upper body
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: creatureSize * 0.9,
                  height: creatureSize * 0.3,
                  top: creatureSize * 0.1,
                  left: creatureSize * 0.05,
                  backgroundColor: getBodyColor('strength'),
                  opacity: getCreaturePartOpacity('strength') * 0.6,
                  borderRadius: "40% 40% 50% 50%",
                }}
              />
            )}
            
            {type === "Grounded Powerhouse" && (
              // Grounded Powerhouse gets stronger lower body
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: creatureSize * 0.9,
                  height: creatureSize * 0.3,
                  bottom: 0,
                  left: creatureSize * 0.05,
                  backgroundColor: getBodyColor('strength'),
                  opacity: getCreaturePartOpacity('strength') * 0.6,
                  borderRadius: "50% 50% 40% 40%",
                }}
              />
            )}
            
            {type === "Flexible Master" && (
              // Flexible Master gets a flowing aura
              <motion.div
                className="absolute rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  width: creatureSize * 1.2,
                  height: creatureSize * 1.2,
                  top: -creatureSize * 0.1,
                  left: -creatureSize * 0.1,
                  backgroundColor: getBodyColor('flexibility'),
                  opacity: getCreaturePartOpacity('flexibility') * 0.3,
                  filter: "blur(10px)",
                  zIndex: -1,
                }}
              />
            )}
            
            {type === "Balanced Athlete" && (
              // Balanced Athlete gets a harmonious glow
              <motion.div
                className="absolute rounded-full"
                animate={{ opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: creatureSize * 1.1,
                  height: creatureSize * 1.1,
                  top: -creatureSize * 0.05,
                  left: -creatureSize * 0.05,
                  background: `radial-gradient(circle, 
                    rgba(255,255,255,0.5) 0%, 
                    ${getBodyColor('balance')} 70%, 
                    transparent 100%)`,
                  opacity: 0.3,
                  zIndex: -1,
                }}
              />
            )}
          </>
        )}

        {/* Level 5 special effects */}
        {level >= 5 && (
          <motion.div 
            className="absolute"
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: rotating ? 720 : 360,
            }}
            transition={{ 
              scale: { duration: 2, repeat: Infinity },
              rotate: { duration: 15, repeat: Infinity, ease: "linear" }
            }}
            style={{
              width: creatureSize * 1.4,
              height: creatureSize * 1.4,
              top: -creatureSize * 0.2,
              left: -creatureSize * 0.2,
              background: `radial-gradient(circle, 
                rgba(255,255,255,0.8) 0%, 
                rgba(255,255,255,0) 70%)`,
              borderRadius: "50%",
              zIndex: -1,
            }}
          />
        )}

        {/* Eyes */}
        <motion.div
          className="absolute rounded-full bg-black"
          style={{
            width: creatureSize * 0.08,
            height: creatureSize * 0.08,
            top: -creatureSize * 0.1,
            left: creatureSize * 0.35,
          }}
        />
        <motion.div
          className="absolute rounded-full bg-black"
          style={{
            width: creatureSize * 0.08,
            height: creatureSize * 0.08,
            top: -creatureSize * 0.1,
            right: creatureSize * 0.35,
          }}
        />
      </motion.div>
    );
  };

  return (
    <div className="fitness-evolution-container">
      <h2>Fitness Evolution</h2>
      
      <Tabs 
        defaultValue="creature" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-[#333333]">
          <TabsTrigger value="creature" className="text-sm">Creature</TabsTrigger>
          <TabsTrigger value="timeline" className="text-sm">
            <Clock className="h-3 w-3 mr-1" />
            Timeline
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="creature" className="mt-4">
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          ) : !creatureData ? (
            <div className="text-center text-gray-400 h-[200px] flex items-center justify-center">
              <p>No creature data available. Start working out to evolve your creature!</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6">
              <div className="evolution-stats">
                <div className="evolution-stage">
                  <div className="stage-label">Level</div>
                  <div className="stage-value">{creatureData.level}</div>
                </div>
                <div className="creature-type">
                  <div className="type-label">Type</div>
                  <div className="type-value">{creatureData.type}</div>
                </div>
              </div>
              
              <div 
                ref={containerRef} 
                className="evolution-visualization"
              >
                {renderCreatureByLevel(creatureData.level, creatureData.type)}
                
                {/* Particles for higher level creatures */}
                {particles.map(particle => (
                  <motion.div
                    key={particle.id}
                    className="particle"
                    style={{
                      width: particle.size,
                      height: particle.size,
                      left: `${particle.x}%`,
                      top: `${particle.y}%`,
                    }}
                    animate={{
                      y: [0, -30, 0],
                      x: [0, Math.random() * 20 - 10, 0],
                      opacity: [0.4, 0.8, 0.4]
                    }}
                    transition={{
                      duration: particle.duration,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              
              <div className="evolution-legend">
                <div className="legend-item">
                  <span className="color-box" style={{ backgroundColor: '#FF6B6B' }}></span>
                  <span>Strength</span>
                </div>
                <div className="legend-item">
                  <span className="color-box" style={{ backgroundColor: '#66B2FF' }}></span>
                  <span>Endurance</span>
                </div>
                <div className="legend-item">
                  <span className="color-box" style={{ backgroundColor: '#FFA500' }}></span>
                  <span>Flexibility</span>
                </div>
                <div className="legend-item">
                  <span className="color-box" style={{ backgroundColor: '#50C878' }}></span>
                  <span>Balance</span>
                </div>
              </div>
              
              <div className="w-full space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-red-400">Strength</span>
                      <span className="text-white">{Math.round(creatureData.aspects.strength)}%</span>
                    </div>
                    <Progress value={creatureData.aspects.strength} className="h-1 bg-[#333333]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-400">Endurance</span>
                      <span className="text-white">{Math.round(creatureData.aspects.endurance)}%</span>
                    </div>
                    <Progress value={creatureData.aspects.endurance} className="h-1 bg-[#333333]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-orange-400">Flexibility</span>
                      <span className="text-white">{Math.round(creatureData.aspects.flexibility)}%</span>
                    </div>
                    <Progress value={creatureData.aspects.flexibility} className="h-1 bg-[#333333]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-green-400">Balance</span>
                      <span className="text-white">{Math.round(creatureData.aspects.balance)}%</span>
                    </div>
                    <Progress value={creatureData.aspects.balance} className="h-1 bg-[#333333]" />
                  </div>
                </div>
              </div>
              
              <div className="evolution-actions">
                <button className="view-timeline-btn" onClick={handleViewTimeline}>
                  View Timeline
                </button>
                <button className="share-btn" onClick={handleShare}>
                  <Share className="h-3 w-3 inline-block mr-1" />
                  Share
                </button>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-4">
          <CreatureTimeline userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
