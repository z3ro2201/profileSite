import React, { useEffect, useRef, useState } from "react";
import YouTube, {YouTubeProps} from 'react-youtube';


export default function Home() {
    let playerCount: number = 0;
    const [playCount, setPlayCount] = useState(0);
    const playList = [
      {link: 'T_MYHHb1Ib0', title: '[LostArk ll 모야] 모코코 Remix '},
      {link: 'ffI42h6L_KI', title: '[LostArk ll Official] 모코콩 아일랜드 (Mokokong Island) '},
      {link: '9iw2NJyV6dg', title: '[LostArk ll Official] 모코코마을 (Mokoko Village)'},
      {link: 'gnm1_MFcwm0', title: '[LostArk ll Official] 별빛 등대의 섬(jazz Ver.) (Star Light Island jazz Ver.)'},
      {link: 'jZwv83Stl60', title: '[LostArk ll Official] 라제니스의 노래 (Song of Lazernes) '},
      {link: 'ENB-BSYCg1c', title: '[LostArk ll Official] Sweet Dreams, My Dear - 소향(SoHyang)'},
      {link: 'H-Ngv9OVqP8', title: '[LostArk ll Official] 아리안오브 (Aryanorb)'},
    ]

    const [playId, setPlayId] = useState(playList[0].link);
    const [playSongTitle, setPlaySongTitle] = useState(playList[0].title + ' (버퍼링중)');
  
    const onPlayerReady: YouTubeProps['onReady'] = (event) => {
      setPlaySongTitle(playList[playerCount].title);
      event.target.playVideo();
      console.log(playerCount);
    }

    const onPlayerPlay: YouTubeProps['onPlay'] = (event) => {
        if(playCount <= playList.length) {
            setPlayCount(playCount+1);
            setPlaySongTitle(playList[playCount].title);
        }
    }
  
    const onPlayerEnd: YouTubeProps['onEnd'] = (event) => {
        const playId:any = playList[playCount].link;
        setPlayId(playId);
    }

    const onPlayerState: YouTubeProps['onStateChange'] = (event) => {
        if(event.data !== 2 && event.data !== 3) event.target.playVideo();
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
        <>
            <div className="playSongTitle">{playSongTitle}</div>
            <YouTube videoId={playId} opts={opts} onReady={onPlayerReady} onStateChange={onPlayerState} onPlay={onPlayerPlay} onEnd={onPlayerEnd} className="hidden"/>
        </>
    )

}