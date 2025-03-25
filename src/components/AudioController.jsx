import React, { useEffect, useRef, useState } from 'react'

const AudioController = ({ 
  isPlaying, 
  setIsPlaying, 
  showAudioButton, 
  setShowAudioButton, 
  setDebugInfo,
  originalText,
  maxAngleDiff,
  tolerance,
  maxDistance
}) => {
  // 오디오 레퍼런스들
  const noiseSoundRef = useRef(null)
  const ttsRef = useRef(null)
  const lastTTSVolumeRef = useRef(0) // TTS 볼륨 상태 추적용

  // 디버그 함수
  const logAudioStatus = () => {
    if (window.speechSynthesis) {
      console.log('🗣️ TTS 상태:', {
        speaking: window.speechSynthesis.speaking,
        pending: window.speechSynthesis.pending,
        paused: window.speechSynthesis.paused
      })
    }

    const noiseSound = noiseSoundRef.current
    if (noiseSound) {
      console.log('🔊 노이즈 상태:', {
        readyState: noiseSound.readyState,
        paused: noiseSound.paused,
        volume: noiseSound.volume,
        error: noiseSound.error
      })
    }
  }

  // TTS 초기화 함수
  const initTTS = () => {
    if (!('speechSynthesis' in window)) {
      console.error('TTS를 지원하지 않는 브라우저입니다.')
      return null
    }

    const utterance = new SpeechSynthesisUtterance(originalText)
    utterance.lang = 'ko-KR'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onend = () => {
      console.log('TTS 재생 완료')
      logAudioStatus()
    }

    utterance.onerror = (event) => {
      console.error('TTS 에러:', event)
      setDebugInfo('TTS 에러 발생: ' + event.error)
      logAudioStatus()
    }

    utterance.onstart = () => {
      console.log('TTS 재생 시작')
      setDebugInfo('TTS 재생 중')
      logAudioStatus()
    }

    return utterance
  }

  // 오디오 초기화
  useEffect(() => {
    noiseSoundRef.current = new Audio()
    noiseSoundRef.current.src = process.env.PUBLIC_URL + '/sound1.mp3'
    
    const noiseSound = noiseSoundRef.current
    noiseSound.loop = true
    noiseSound.volume = 0
    noiseSound.preload = 'auto'

    noiseSound.onerror = (e) => {
      console.error('오디오 로드 에러:', e)
      setDebugInfo('오디오 로드 실패: ' + (noiseSound.error?.message || '알 수 없는 에러'))
      logAudioStatus()
    }

    noiseSound.oncanplaythrough = () => {
      console.log('오디오 로드 성공')
      setDebugInfo('오디오 로드 완료')
      logAudioStatus()
    }

    // iOS에서 오디오 재생을 위한 설정
    const setupAudio = async () => {
      console.log('오디오 초기화 시작')
      try {
        noiseSound.load()
        await noiseSound.play()
        noiseSound.pause()
        noiseSound.currentTime = 0
        
        // TTS 초기화
        ttsRef.current = initTTS()
        
        console.log('오디오 초기화 성공')
        setDebugInfo('오디오 초기화 완료')
        setIsPlaying(true)
        setShowAudioButton(false)
        logAudioStatus()
      } catch (error) {
        console.error('오디오 초기화 실패:', error)
        setDebugInfo('오디오 초기화 실패: ' + error.message)
        setIsPlaying(false)
        setShowAudioButton(true)
        logAudioStatus()
      }
      document.removeEventListener('touchstart', setupAudio)
    }

    if ('ontouchstart' in window) {
      document.addEventListener('touchstart', setupAudio)
    } else {
      setupAudio()
    }

    return () => {
      if (noiseSound) {
        noiseSound.pause()
        noiseSound.currentTime = 0
      }
      document.removeEventListener('touchstart', setupAudio)
    }
  }, [setDebugInfo])

  // 사용자 인터랙션을 통한 TTS 실행
  useEffect(() => {
    const handleUserInteraction = () => {
      if (ttsRef.current && !window.speechSynthesis.speaking) {
        console.log('🔄 터치 이벤트에서 TTS 실행 시도')
        window.speechSynthesis.speak(ttsRef.current)
      }
    }

    document.addEventListener('touchstart', handleUserInteraction, { once: true })
    document.addEventListener('click', handleUserInteraction, { once: true })

    return () => {
      document.removeEventListener('touchstart', handleUserInteraction)
      document.removeEventListener('click', handleUserInteraction)
    }
  }, [])

  // 볼륨 업데이트
  useEffect(() => {
    if (!isPlaying) return;

    const isInTargetAngle = maxAngleDiff <= tolerance;
    const noiseVolume = Math.min(1, maxAngleDiff / maxDistance);
    const ttsVolume = isInTargetAngle ? 1 : 0;

    // 볼륨 업데이트
    if (noiseSoundRef.current) {
      noiseSoundRef.current.volume = noiseVolume;
    }

    if (ttsRef.current) {
      ttsRef.current.volume = ttsVolume;

      if (isInTargetAngle && !window.speechSynthesis.speaking) {
        console.log('🗣️ TTS 실행 조건 충족');
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(ttsRef.current);
      }
    }
  }, [isPlaying, maxAngleDiff, tolerance, maxDistance])

  // 상태 모니터링
  useEffect(() => {
    const status = {
      '🎵 재생상태': isPlaying ? '재생중' : '중지됨',
      '🔊 노이즈볼륨': noiseSoundRef.current?.volume?.toFixed(2) ?? 'N/A',
      '🗣 TTS볼륨': ttsRef.current?.volume?.toFixed(2) ?? 'N/A',
      '📐 각도차이': maxAngleDiff.toFixed(2),
      '🎯 허용오차': tolerance,
      '📏 최대거리': maxDistance
    }
    
    console.log('\n=== 현재 상태 ===')
    Object.entries(status).forEach(([key, value]) => {
      console.log(`${key}: ${value}`)
    })
    console.log('================\n')
  }, [isPlaying, maxAngleDiff, tolerance, maxDistance])

  // 오디오 재생 핸들러
  const handleAudioStart = async () => {
    try {
      console.log('🎵 오디오 재생 시도 - 초기 상태:', {
        isPlaying,
        hasNoiseRef: !!noiseSoundRef.current,
        hasTTSRef: !!ttsRef.current,
        noiseReadyState: noiseSoundRef.current?.readyState,
        noisePaused: noiseSoundRef.current?.paused,
        noiseVolume: noiseSoundRef.current?.volume,
        ttsSpeaking: window.speechSynthesis?.speaking
      })
      setDebugInfo('오디오 재생 시도 중...')
      
      const noiseSound = noiseSoundRef.current
      if (!noiseSound) {
        throw new Error('오디오 객체가 초기화되지 않음')
      }

      // 오디오 상태 로깅
      console.log('오디오 상태:', {
        src: noiseSound.src,
        readyState: noiseSound.readyState,
        paused: noiseSound.paused,
        volume: noiseSound.volume,
        error: noiseSound.error
      })

      // 오디오가 로드될 때까지 대기
      if (noiseSound.readyState < 4) { // HAVE_ENOUGH_DATA
        await new Promise((resolve, reject) => {
          noiseSound.oncanplaythrough = resolve
          noiseSound.onerror = reject
          noiseSound.load()
        })
      }

      // 오디오 재생 시도
      await noiseSound.play()
      
      // TTS 초기화 및 재생
      if ('speechSynthesis' in window) {
        console.log('TTS 초기화 시작')
        window.speechSynthesis.cancel() // 기존 TTS 중지
        
        ttsRef.current = new SpeechSynthesisUtterance(originalText)
        ttsRef.current.lang = 'ko-KR'
        ttsRef.current.rate = 1.0
        ttsRef.current.pitch = 1.0
        ttsRef.current.volume = 1.0  // 초기 볼륨을 1로 설정

        // TTS 이벤트 핸들러들
        ttsRef.current.onend = () => {
          console.log('TTS 재생 완료')
          if (ttsRef.current && ttsRef.current.volume > 0.1) {
            console.log('TTS 재시작')
            window.speechSynthesis.speak(ttsRef.current)
          }
        }

        ttsRef.current.onerror = (event) => {
          console.error('TTS 에러:', event)
          setDebugInfo('TTS 에러 발생: ' + event.error)
        }

        ttsRef.current.onstart = () => {
          console.log('TTS 재생 시작')
          setDebugInfo('TTS 재생 중')
        }

        // 초기 TTS 재생
        setTimeout(() => {
          try {
            console.log('TTS 재생 시도')
            window.speechSynthesis.speak(ttsRef.current)
          } catch (error) {
            console.error('TTS 재생 실패:', error)
            setDebugInfo('TTS 재생 실패: ' + error.message)
          }
        }, 1000)
      } else {
        console.error('TTS를 지원하지 않는 브라우저입니다.')
        setDebugInfo('TTS를 지원하지 않는 브라우저입니다.')
      }

      console.log('오디오 재생 성공')
      setDebugInfo('오디오 재생 중')
      setIsPlaying(true)
      setShowAudioButton(false)
    } catch (error) {
      console.error('오디오 재생 실패:', error)
      setDebugInfo('오디오 재생 실패: ' + error.message)
      setShowAudioButton(true)
    }
  }

  return (
    <>
      {/* 오디오 시작 버튼 */}
      {showAudioButton && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={handleAudioStart}
            className="bg-white/80 px-4 py-2 rounded-full shadow-lg border border-gray-200 text-black text-sm hover:bg-white"
          >
            소리 시작하기
          </button>
        </div>
      )}
    </>
  )
}

export default AudioController 