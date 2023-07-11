'use client'
import React, { useRef, useState, useEffect } from "react";
import YouTube, {YouTubeProps,YouTubePlayer} from 'react-youtube';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEject } from "@fortawesome/free-solid-svg-icons";

export default function Player() {
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
      {link: 'WZgiTJova1Q', title: '위대한 기억의 오르골'},
      {link: '7F4QS5OWlG8', title: '별모래 해변'},
      {link: 'P0qtL25eD7Q', title: '그대 기억 하나요?'},
      {link: 'PwAD4uVeDgU', title: '해상 낙원 페이토'},
      {link: 'wsEq1itieOo', title: '기에나의 바다'},
      {link: 'btM_zzqtt90', title: '리베하임'},
      {link: 'YdMZeIdpnNw', title: '로맨틱 웨폰'},
      {link: '8sxhDyBlpCk', title: 'Dreaming Your Melody'}
    ]

    let videoElement:YouTubePlayer = null
    const [playerDragging, setPlayerDragging] = useState(false);
    const [playerPosition, setPlayerPosition] = useState({x: 0, y: 0});

    const [playId, setPlayId] = useState(playList[Math.floor(Math.random() * playList.length)].link);
    const [playSongTitle, setPlaySongTitle] = useState('Youtube Player');
    const [playerDisplay, setPlayerDisplay] = useState(false);
  
    const onPlayerState: YouTubeProps['onStateChange'] = (event: YouTubePlayer) => {
        if(event.data === -1 || event.data === 0) {
            setPlayId(playList[playCount].link);
            setPlaySongTitle(event.target.videoTitle + ' (버퍼링중)');
            event.target.playVideo();
        } else if (event.data === 1) {
            setPlayCount(Math.floor(Math.random() * playList.length));
            setPlaySongTitle(event.target.videoTitle);
        } else if (event.data === 2) {
        }
    }

    const playerDisplayEvent = () => {
        (playerDisplay === true) ? setPlayerDisplay(false):setPlayerDisplay(true);
        if(playerBody.current) playerBody.current.classList.toggle('hidden')
    }

    const handleDrag = (e: any) => {
        if (!playerDragging) return;
        const newX = e.clientX;
        const newY = e.clientY;
    
        setPlayerPosition({ x: newX, y: newY });
    }
    const handleDragEnd = (e:any) => {
        setPlayerDragging(false);
        setPlayerPosition({
            x: e.clientX ,
            y: e.clientY
        })
        if(localStorage.getItem('playerPosition')) {
            localStorage.removeItem('playerPostion');
        }

        // 플레이어 위치 기억
        localStorage.setItem('playerPosition', JSON.stringify({x: e.clientX, y: e.clientY}))
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

    useEffect(() => {
        if(localStorage.getItem('playerPosition')) {
            const initItem = localStorage.getItem('playerPosition') || null;
            initItem !== null ? setPlayerPosition(JSON.parse(initItem)) : '';
        }
    }, [])

    return (
        <div draggable onDrag={handleDrag}  onDragEnd={handleDragEnd}
        className="z-[99] cursor-grab active:cursor-grabbing absolute select-none	"
        style={{left: `${playerPosition.x}px`, top: `${playerPosition.y}px`}}>
            <div className="flex border-2 border-slate-200/50 border-radius-lg bg-slate-800/50 overflow-hidden shadow-md">
                <span className="pl-3 pr-1 py-2">♬</span>
                <span className="songTitle max-w-[150px] w-[150px] relative overflow-hidden block p-2 mx-2">
                    <span className="block animate-marquee whitespace-nowrap">{playSongTitle}</span>
                </span>
                <span className="w-[15px] skew-x-[30deg] bg-cyan-900/50"></span>                    
                <div className="flex w-auto bg-slate-800/50">
                    <FontAwesomeIcon icon={faEject} className="absolute mt-[11px] ml-[15px] z-[999]" onClick={playerDisplayEvent}/>
                    <span className="flex items-center justify-center w-[40px] skew-x-[30deg] bg-slate-800/50">                        
                    </span>
                </div>
            </div>
            <div className="absolute mt-4 hidden" ref={playerBody}>
                <YouTube videoId={playId} opts={opts} onStateChange={onPlayerState}  />
            </div>
        </div>
    )

}
