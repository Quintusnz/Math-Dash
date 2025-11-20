import { ReactNode } from "react";

interface DuelLayoutProps {
  player1: ReactNode;
  player2: ReactNode;
  timer: ReactNode;
}

export function DuelLayout({ player1, player2, timer }: DuelLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      {/* Top Bar with Timer */}
      <div className="h-16 flex items-center justify-center border-b border-border bg-card z-10 shadow-sm">
        {timer}
      </div>

      {/* Split Screen Area */}
      <div className="flex-1 flex flex-row relative">
        {/* Player 1 (Left) */}
        <div className="w-1/2 h-full border-r border-border">
          {player1}
        </div>

        {/* Player 2 (Right) */}
        <div className="w-1/2 h-full">
          {player2}
        </div>
        
        {/* VS Badge (Center Overlay) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        bg-accent text-accent-foreground font-black text-xl 
                        w-12 h-12 rounded-full flex items-center justify-center 
                        border-4 border-background shadow-lg z-20">
          VS
        </div>
      </div>
    </div>
  );
}
