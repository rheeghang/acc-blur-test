import React, { useEffect, useRef } from 'react'

const RotatedText = ({ 
  text, 
  title, 
  subtitle,
  artist, 
  caption, 
  blurAmount, 
  onNextClick, 
  onPrevClick,
  rotationAngle = 45,
  paddingTop = '10vh',
  showGuideMessage,
  useGuideMessage = false,
  showShakeMessage = false,
  styles = {
    titleMargin: '20px',
    artistMargin: '20px',
    lineSpacing: '15px',
    textTop: '30px',
    containerPadding: '10vh',
    titleBlockMargin: '20px'
  }
}) => {
  const containerRef = useRef(null)
  
  const getWrappedLines = (text, container) => {
    const words = text.split(' ')
    const lines = []
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    context.font = window.getComputedStyle(container).font
    
    let currentLine = ""
    let testLine = ""

    words.forEach((word) => {
      testLine = currentLine ? currentLine + " " + word : word
      const testWidth = context.measureText(testLine).width
      
      if (testWidth > container.clientWidth) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    })

    if (currentLine) {
      lines.push(currentLine)
    }

    return lines
  }

  const wrapText = () => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = ''

    const containerWidth = container.clientWidth
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    context.font = window.getComputedStyle(container).font

    const createSpan = (text, className = '') => {
      const span = document.createElement('span')
      span.textContent = text
      if (className) {
        span.className = `${className} rotated-text`
      } else {
        span.className = 'rotated-text'
      }
      span.style.display = 'block'
      span.style.transform = `rotate(${rotationAngle}deg)`
      span.style.transformOrigin = 'center center'
      span.style.whiteSpace = 'nowrap'
      span.style.marginBottom = styles.lineSpacing
      span.style.position = 'relative'
      span.style.top = styles.textTop
      return span
    }

    const wrapTextContent = (text, className = '') => {
      const words = text.split(' ')
      let currentLine = ''
      const lines = []

      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word
        const metrics = context.measureText(testLine)
        
        if (metrics.width > containerWidth && currentLine) {
          lines.push(createSpan(currentLine, className))
          currentLine = word
        } else {
          currentLine = testLine
        }
      })

      if (currentLine) {
        lines.push(createSpan(currentLine, className))
      }

      return lines
    }

    const parts = text.split(/(<span.*?<\/span>|<br>|\[다음\]|\[이전\])/g)
    
    parts.forEach((part) => {
      if (!part || part.trim() === '') return
      
      if (part.startsWith('<span')) {
        // span 태그 내용 처리
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = part
        const spanElement = tempDiv.querySelector('span')
        const spanText = spanElement.textContent
        const spanClasses = spanElement.getAttribute('class') || ''
        
        // 스타일이 적용된 텍스트를 줄바꿈 처리
        const wrappedLines = wrapTextContent(spanText, spanClasses)
        wrappedLines.forEach(line => container.appendChild(line))

      } else if (part === '<br>') {
        const breakSpan = document.createElement('span')
        breakSpan.style.height = '1.2em'
        container.appendChild(breakSpan)

      } else if (part === '[다음]' || part === '[이전]') {
        const span = document.createElement('span')
        const button = document.createElement('button')
        button.textContent = part
        button.onclick = () => {
          if (part === '[다음]') {
            onNextClick();
          } else {
            onPrevClick();
          }
        }
        button.className = 'text-black hover:text-gray-600'
        span.appendChild(button)
        span.style.display = 'block'
        span.style.transform = `rotate(${rotationAngle}deg)`
        span.style.transformOrigin = 'center center'
        span.style.whiteSpace = 'nowrap'
        span.style.marginBottom = '15px'
        span.style.position = 'relative'
        span.style.top = '30px'
        container.appendChild(span)

      } else {
        // 일반 텍스트 처리
        const wrappedLines = wrapTextContent(part.trim())
        wrappedLines.forEach(line => container.appendChild(line))
      }
    })

    // 가이드 메시지 조건부 실행
    if (useGuideMessage && typeof showGuideMessage === 'function') {
      showGuideMessage();
    }
  }

  useEffect(() => {
    wrapText()
    window.addEventListener('resize', wrapText)
    return () => window.removeEventListener('resize', wrapText)
  }, [text, onNextClick, onPrevClick])

  return (
    <div className="outer-container w-full min-h-screen overflow-y-auto relative flex flex-col justify-between" 
         style={{ 
           overflowY: 'auto',
           paddingTop: paddingTop,
           paddingBottom: '120px',
           height: '100vh',
           maxHeight: '100vh'
         }}>
      <div>  {/* 메인 콘텐츠를 감싸는 div */}
        <div className="text-block text-black" style={{ marginBottom: styles.titleBlockMargin }}>
          <h1 
            className="text-lg text-center title-span block text-black pt-[1vh]"
            tabIndex="0"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transformOrigin: 'center center',
              position: 'relative',
              marginBottom: styles.titleMargin,
              whiteSpace: 'nowrap',
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 0.3s ease'
            }}
          >
            {title}
          </h1>

          <div 
            className="text-base text-center block text-black"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transformOrigin: 'center center',
              position: 'relative',
              marginBottom: styles.artistMargin,
              whiteSpace: 'nowrap',
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 0.3s ease'
            }}
          >
            {artist}
          </div>

          <div 
            className="text-base text-center block text-black"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transformOrigin: 'center center',
              position: 'relative',
              marginBottom: styles.artistMargin,
              whiteSpace: 'nowrap',
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 0.3s ease'
            }}
          >
            {subtitle}
          </div>

          <div 
            className="text-sm text-center block text-black"
            style={{
              transform: `rotate(${rotationAngle}deg)`,
              transformOrigin: 'center center',
              position: 'relative',
              whiteSpace: 'normal',
              lineHeight: '1.5',
              filter: `blur(${blurAmount}px)`,
              transition: 'filter 0.3s ease'
            }}
            dangerouslySetInnerHTML={{ __html: caption }}
          />
        </div>

        <div 
          ref={containerRef}
          className="container w-full relative inline-block text-base leading-[1.5rem] text-left text-black"
          style={{
            wordWrap: 'break-word',
            overflow: 'visible',
            filter: `blur(${blurAmount}px)`,
            transition: 'filter 0.3s ease',
            marginLeft: 'auto',
            marginRight: 'auto',
            display: 'block'
          }}
        >
          {/* 스크린 리더용 숨겨진 텍스트 */}
          <div className="sr-only" tabIndex="0">
            {text}
          </div>
          
          <style jsx>{`
            .container span.rotated-text {
              display: block;
              transform: rotate(${rotationAngle}deg);
              transform-origin: center center;
              white-space: nowrap;
              margin-bottom: ${styles.lineSpacing};
              position: relative;
              top: ${styles.textTop};
            }
            
            .container span.font-serif {
              font-family: serif;
            }
            
            .container span.italic {
              font-style: italic;
            }
            .navigation-button {
              display: block;
              transform: rotate(${rotationAngle}deg);
              transform-origin: center center;
              white-space: nowrap;
              margin-bottom: 20px;
              position: relative;
              top: 60px;
            }
            .sr-only {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border-width: 0;
            }
          `}</style>
        </div>
      </div>

      {/* 조건부로 하단 메시지 렌더링 */}
      {showShakeMessage && (
        <div className="w-full mt-[10vh] py-8">
          <div className="w-[90%] mx-auto bg-black text-white p-2 text-center text-sm">
            휴대폰을 흔들면 메뉴가 열립니다.
          </div>
        </div>
      )}
    </div>
  )
}

export default RotatedText