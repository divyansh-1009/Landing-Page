import { useEffect, useState, useRef } from 'react'
import './App.css'

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [selectedRectIndex, setSelectedRectIndex] = useState<number | null>(null)
  const [showText, setShowText] = useState(false)
  const section1Ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Select a random rectangle (index >= 5) after component mounts
    const randomIndex = Math.floor(Math.random() * 15) + 5; // 5 to 19
    setSelectedRectIndex(randomIndex)
  }, [])

  // Calculate animation progress based on scroll within section 1
  const getAnimationProgress = () => {
    const sectionHeight = window.innerHeight
    const progress = Math.min(scrollY / (sectionHeight * 0.5), 1) // Complete animation at 50% of section height
    return progress
  }

  const animationProgress = getAnimationProgress()

  // Show text when animation is about 50% complete
  useEffect(() => {
    if (animationProgress > 0.5) {
      setShowText(true)
    }
  }, [animationProgress])

  return (
    <div className="app-container">
      <section className="section-full" id="section-1" ref={section1Ref}>
        <div className="rectangles-container">
          {(() => {
            // Calculate the selected rectangle's color once
            const selectedColorValue = selectedRectIndex !== null 
              ? Math.round((selectedRectIndex / 19) * 255)
              : 0
            const selectedBackgroundColor = `rgb(${selectedColorValue}, ${selectedColorValue}, ${selectedColorValue})`
            
            return Array.from({ length: 20 }, (_, index) => {
              const isSelected = index === selectedRectIndex
              const opacity = 1 - animationProgress * (isSelected ? 0 : 1)
              
              // Use original color before scrolling, selected color after scrolling
              let backgroundColor: string
              if (animationProgress > 0 && selectedRectIndex !== null) {
                // ALL rectangles use the exact same color as the selected rectangle
                backgroundColor = selectedBackgroundColor
              } else {
                // Original gradient colors before scrolling
                const colorValue = Math.round((index / 19) * 255)
                backgroundColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`
              }
              
              // Calculate expansion for selected rectangle to full width
              const baseStyle: React.CSSProperties = {
                backgroundColor,
                opacity,
                filter: isSelected && animationProgress === 0 
                  ? `drop-shadow(0 0 20px rgba(255, 255, 255, 0.6))`
                  : 'none',
                zIndex: isSelected ? 10 : 1,
              }
              
              let style = baseStyle
              
              if (isSelected && animationProgress > 0) {
                // Make the selected rectangle expand to full width
                const finalWidth = 100; // 100vw
                const currentWidth = 100 / 20; // Each rectangle is 5vw initially
                const widthScale = (finalWidth / currentWidth) * animationProgress
                const leftOffset = -(index * currentWidth) * animationProgress
                
                style = {
                  ...baseStyle,
                  transform: `translateX(${leftOffset}vw) scaleX(${1 + (widthScale - 1)})`,
                  width: `${currentWidth}vw`
                }
              }
              
              return (
                <div
                  key={index}
                  className={`rectangle ${isSelected ? 'selected' : ''}`}
                  style={style}
                />
              )
            })
          })()}
          
          {showText && (
            <div className="overlay-text">
              <p>I see you through the noise.</p>
              <p>I understand your shade of grey.</p>
            </div>
          )}
        </div>
      </section>
      
      <section className="section-full" id="section-2">
        <h1>Section 2</h1>
        <p>Black to dark grey transition</p>
      </section>
      
      <section className="section-full" id="section-3">
        <h1>Section 3</h1>
        <p>Dark grey to medium grey</p>
      </section>
      
      <section className="section-full" id="section-4">
        <h1>Section 4</h1>
        <p>Medium grey section</p>
      </section>
      
      <section className="section-full" id="section-5">
        <h1>Section 5</h1>
        <p>Medium to light grey transition</p>
      </section>
      
      <section className="section-full" id="section-6">
        <h1>Section 6</h1>
        <p>Light grey to white section</p>
      </section>
    </div>
  )
}

export default App
