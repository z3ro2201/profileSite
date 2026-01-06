"use client";

import { useState } from "react";
import { Volume2Icon, VolumeOffIcon } from "lucide-react";

const Player = () => {
  const [x, setX] = useState<number>(10);
  const [y, setY] = useState<number>(10);
  const [playId, setPlayId] = useState<number>(0);
  const [playerSongTitle, setPlayerSongTitle] = useState<string>("");
  const [playerVolumeState, setPlayerVolumeState] = useState<boolean>(false);

  return (
    <div className="z-[1000] cursor-grab active:cursor-grabbing fixed select-none" style={{ left: x, top: y }}>
      <div className="flex px-3 py-2 border-2 border-slate-200 border-radius-sm bg-slate-800 overflow-hidden shadow-md text-white">
        {playerVolumeState ? <Volume2Icon className="w-4" /> : <VolumeOffIcon className="w-4" />}
        <button></button>
      </div>
    </div>
  );
};

export default Player;
