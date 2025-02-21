
export function LevelRequirements() {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Level Requirements</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="space-y-1">
          <p className="font-medium text-[#EAB308]">Beginner</p>
          <p className="text-sm text-muted-foreground">0 - 1,499</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-[#22C55E]">Intermediate</p>
          <p className="text-sm text-muted-foreground">1,500 - 2,999</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-[#4488EF]">Advanced</p>
          <p className="text-sm text-muted-foreground">3,000 - 4,499</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-[#A855F7]">Elite</p>
          <p className="text-sm text-muted-foreground">4,500 - 5,999</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-[#FF0000] dark:text-[#FF4444]">Monster</p>
          <p className="text-sm text-muted-foreground">6,000+</p>
        </div>
      </div>
    </div>
  );
}
