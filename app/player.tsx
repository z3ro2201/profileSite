'use client'
import React, { useRef, useState } from "react";
import YouTube, {YouTubeProps,YouTubePlayer} from 'react-youtube';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEject } from "@fortawesome/free-solid-svg-icons";

export default function Player() {
    let playerCount: number = 0;
    const playerBody = useRef<HTMLDivElement>(null);
    const [playCount, setPlayCount] = useState(0);
    const playList = [
      {link: 'T_MYHHb1Ib0', title: '모코코 Remix '},
      {link: 'ffI42h6L_KI', title: '모코콩 아일랜드 (Mokokong Island) '},
      {link: '9iw2NJyV6dg', title: '모코코마을 (Mokoko Village)'},
      {link: 'gnm1_MFcwm0', title: '별빛 등대의 섬(jazz Ver.) (Star Light Island jazz Ver.)'},
      {link: 'jZwv83Stl60', title: '라제니스의 노래 (Song of Lazernes) '},
      {link: 'ENB-BSYCg1c', title: 'Sweet Dreams, My Dear - 소향(SoHyang)'},
      {link: 'H-Ngv9OVqP8', title: '아리안오브 (Aryanorb)'},
    ]

    let videoElement:YouTubePlayer = null

    const [isPlay, setIsPlay] = useState(false);
    const [playId, setPlayId] = useState(playList[0].link);
    const [playSongTitle, setPlaySongTitle] = useState(playList[0].title + ' (버퍼링중)');
    const [playerDisplay, setPlayerDisplay] = useState(false);
  
    const onPlayerReady: YouTubeProps['onReady'] = (event: YouTubePlayer) => {
        videoElement = event.target;
        setPlaySongTitle(playList[playerCount].title);
        videoElement.playVideo();
    }

    const onPlayerPlay: YouTubeProps['onPlay'] = (event: YouTubePlayer) => {
        if(playCount <= playList.length) {
            setPlayCount(playCount+1);
            setPlaySongTitle(playList[playCount].title);
        }
        setIsPlay(true);
        event.target.playVideo();
    }
  
    const onPlayerEnd: YouTubeProps['onEnd'] = (event: YouTubePlayer) => {
        const playId:any = playList[playCount].link;
        setPlayId(playId);
    }

    const onPlayerState: YouTubeProps['onStateChange'] = (event: YouTubePlayer) => {
        if(event.data !== 2 && event.data !== 3) event.target.playVideo();
    }

    const onPlayerPause: YouTubeProps['onPause'] = (event: YouTubePlayer) => {
        setIsPlay(false);
    }

    const playerState = () => {
        console.log(videoElement);
        if(isPlay === false) videoElement.playVideo();
    }

    const playerDisplayEvent = () => {
        (playerDisplay === true) ? setPlayerDisplay(false):setPlayerDisplay(true);
        if(playerBody.current) playerBody.current.classList.toggle('hidden')
    }
  
    const opts: YouTubeProps['opts'] = {
      width: 640,
      height: 390,
      playerVars: {
        autoplay: 1,
        rel: 0,
        modestbranding: 1
      }
    }

    return (
        <div className="fixed t-0 l-0 m-2 z-[99]">
            <div className="flex border-2 border-slate-200/50 border-radius-lg bg-slate-800/50 overflow-hidden shadow-md">
                <span className="pl-3 pr-1 py-2">♬</span>
                <span className="songTitle max-w-[280px] overflow-hidden whitespace-nowrap block p-2">{playSongTitle}</span>
                <span className="w-[15px] skew-x-[30deg] bg-cyan-900/50"></span>                    
                <div className="flex w-auto bg-slate-800/50">
                    <FontAwesomeIcon icon={faEject} className="absolute mt-[11px] ml-[15px] z-[999]" onClick={playerDisplayEvent}/>
                    <span className="flex items-center justify-center w-[40px] skew-x-[30deg] bg-slate-800/50">                        
                    </span>
                </div>
            </div>
            <div className="absolute mt-4 hidden" ref={playerBody}>
                <YouTube videoId={playId} opts={opts} onReady={onPlayerReady} onPause={onPlayerPause} onStateChange={onPlayerState} onPlay={onPlayerPlay} onEnd={onPlayerEnd} />
            </div>
        </div>
    )

}
