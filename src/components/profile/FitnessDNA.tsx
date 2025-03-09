
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import * as d3 from "d3";
import { DNASegment, FitnessDNAData, transformWorkoutDataToDNA } from "./utils/dnaDataTransformer";
import { Loader2, Share, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { WorkoutLog } from "@/components/saved-exercises/types";

// DNA Color palette
const DNA_COLORS = [
  "#9b87f5",  // Chest - Primary Purple
  "#7E69AB",  // Back - Secondary Purple
  "#6E59A5",  // Biceps - Tertiary Purple
  "#D6BCFA",  // Triceps - Light Purple
  "#E5DEFF",  // Shoulders - Soft Purple
  "#FEC6A1",  // Legs - Soft Orange
  "#F2FCE2",  // Core - Soft Green
  "#D3E4FD",  // Cardio - Soft Blue
];

interface FitnessDNAProps {
  workoutLogs: WorkoutLog[];
  isLoading?: boolean;
}

export function FitnessDNA({ workoutLogs, isLoading = false }: FitnessDNAProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dnaData, setDnaData] = useState<FitnessDNAData | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<DNASegment | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Process workout data
  useEffect(() => {
    if (workoutLogs && workoutLogs.length > 0) {
      const processedData = transformWorkoutDataToDNA(workoutLogs);
      setDnaData(processedData);
    }
  }, [workoutLogs]);

  // Render DNA visualization
  useEffect(() => {
    if (!svgRef.current || !dnaData || dnaData.segments.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Create a container for the DNA that can be rotated
    const dnaContainer = svg.append("g")
      .attr("transform", `translate(${centerX}, ${centerY}) scale(${zoom}) rotate(${rotation})`);

    // Helix parameters
    const helixRadius = 40;
    const helixHeight = Math.min(height * 0.8, 400);
    const segmentCount = dnaData.segments.length || 8;
    const segmentHeight = helixHeight / Math.max(8, segmentCount);
    const helixTurns = 3;
    const pointsPerTurn = 20;
    const totalPoints = helixTurns * pointsPerTurn;
    
    // Generate helix points for both strands
    const strand1Points = [];
    const strand2Points = [];
    
    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints;
      const y = -helixHeight/2 + t * helixHeight;
      const angle = t * helixTurns * 2 * Math.PI;
      const x1 = helixRadius * Math.cos(angle);
      const x2 = helixRadius * Math.cos(angle + Math.PI);
      
      strand1Points.push({ x: x1, y });
      strand2Points.push({ x: x2, y });
    }
    
    // Draw the backbone strands
    const lineGenerator = d3.line<{x: number, y: number}>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveBasis);
      
    dnaContainer.append("path")
      .attr("d", lineGenerator(strand1Points))
      .attr("stroke", "#D6BCFA")
      .attr("stroke-width", 3)
      .attr("fill", "none");
      
    dnaContainer.append("path")
      .attr("d", lineGenerator(strand2Points))
      .attr("stroke", "#D6BCFA")
      .attr("stroke-width", 3)
      .attr("fill", "none");
    
    // Draw the segments (base pairs)
    const segments = dnaData.segments;
    const totalSegmentWeight = segments.reduce((sum, seg) => sum + seg.volume, 0);
    
    for (let i = 0; i < totalPoints; i++) {
      const t = i / totalPoints;
      const y = -helixHeight/2 + t * helixHeight;
      const angle = t * helixTurns * 2 * Math.PI;
      
      // Map the current position to a segment based on volume distribution
      let currentSegment: DNASegment | undefined;
      let accumulatedWeight = 0;
      for (const segment of segments) {
        accumulatedWeight += segment.volume / totalSegmentWeight;
        if (t <= accumulatedWeight) {
          currentSegment = segment;
          break;
        }
      }
      
      if (!currentSegment) {
        currentSegment = segments[segments.length - 1];
      }
      
      const x1 = helixRadius * Math.cos(angle);
      const x2 = helixRadius * Math.cos(angle + Math.PI);
      
      // Calculate segment thickness based on strength
      const segmentStrength = (currentSegment.strength / 100) * 5 + 1;
      
      // Draw base pair connecting the strands
      dnaContainer.append("line")
        .attr("x1", x1)
        .attr("y1", y)
        .attr("x2", x2)
        .attr("y2", y)
        .attr("stroke", DNA_COLORS[currentSegment.colorIndex])
        .attr("stroke-width", segmentStrength)
        .attr("stroke-opacity", 0.9)
        .attr("data-segment", currentSegment.id)
        .attr("cursor", "pointer")
        .on("mouseenter", function() {
          d3.select(this)
            .attr("stroke-width", segmentStrength + 2)
            .attr("stroke-opacity", 1);
          setSelectedSegment(currentSegment!);
        })
        .on("mouseleave", function() {
          d3.select(this)
            .attr("stroke-width", segmentStrength)
            .attr("stroke-opacity", 0.9);
          setSelectedSegment(null);
        });
    }
    
  }, [dnaData, zoom, rotation]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (dnaData && svgRef.current) {
        // Re-render on resize
        const event = new Event('resize');
        window.dispatchEvent(event);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dnaData]);

  const handleShare = () => {
    // In a real implementation, this would generate and share an image
    toast.success("Fitness DNA visualization shared!");
  };

  // Simple legend rendering
  const renderLegend = () => {
    const categoryMap: Record<string, string> = {
      "ΣΤΗΘΟΣ": "Chest",
      "ΠΛΑΤΗ": "Back",
      "ΔΙΚΕΦΑΛΑ": "Biceps",
      "ΤΡΙΚΕΦΑΛΑ": "Triceps",
      "ΩΜΟΙ": "Shoulders",
      "ΠΟΔΙΑ": "Legs",
      "ΚΟΡΜΟΣ": "Core",
      "CARDIO": "Cardio"
    };
    
    return (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {dnaData && dnaData.segments.map((segment, i) => (
          <div key={segment.id} className="flex items-center gap-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: DNA_COLORS[segment.colorIndex] }}
            />
            <span className="text-xs text-gray-200">
              {categoryMap[segment.category] || segment.category}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-0 bg-[#222222] rounded-lg overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Fitness DNA</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share your Fitness DNA</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : workoutLogs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>Start logging workouts to generate your Fitness DNA</p>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="flex justify-between mb-2">
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 bg-[#333333] border-gray-700"
                  onClick={() => setZoom(Math.min(zoom + 0.2, 2))}
                >
                  <ZoomIn className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Zoom</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 bg-[#333333] border-gray-700"
                  onClick={() => setZoom(Math.max(zoom - 0.2, 0.6))}
                >
                  <ZoomOut className="h-3.5 w-3.5 mr-1" />
                  <span className="text-xs">Out</span>
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                className="h-7 bg-[#333333] border-gray-700"
                onClick={() => setRotation((rotation + 45) % 360)}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">Rotate</span>
              </Button>
            </div>
            
            {/* Info Box */}
            {selectedSegment && (
              <div className="bg-[#1A1F2C] p-2 rounded mb-2 text-xs">
                <div className="flex justify-between items-center">
                  <div className="font-medium">
                    {selectedSegment.category}
                  </div>
                  <Badge 
                    variant={selectedSegment.progress > 0 ? "default" : "outline"}
                    className="text-[9px] h-4"
                  >
                    {selectedSegment.progress > 0 ? `+${selectedSegment.progress.toFixed(1)}%` : "No Progress"}
                  </Badge>
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-muted-foreground">Strength:</span>
                  <span>{Math.round(selectedSegment.strength)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Volume:</span>
                  <span>{Math.round(selectedSegment.volume)}%</span>
                </div>
              </div>
            )}
            
            {/* DNA Visualization */}
            <div 
              ref={containerRef} 
              className="relative w-full h-[300px] overflow-hidden"
            >
              <svg 
                ref={svgRef} 
                width="100%" 
                height="100%" 
                className="transition-transform duration-500"
              />
            </div>
            
            {/* DNA Stats */}
            {dnaData && (
              <div className="flex justify-between items-center mt-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Dominant muscle group: </span>
                  <span className="font-medium">{dnaData.dominantCategory}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Overall strength: </span>
                  <span className="font-medium">{Math.round(dnaData.overallStrength)}%</span>
                </div>
              </div>
            )}
            
            {/* Legend */}
            {dnaData && renderLegend()}
          </>
        )}
      </CardContent>
    </Card>
  );
}
