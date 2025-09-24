import { useEffect, useState, useRef, useCallback } from 'react'
import './App.css'

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [selectedRectIndex, setSelectedRectIndex] = useState<number | null>(null)
  const [showText, setShowText] = useState(false)
  const [showSection2Text, setShowSection2Text] = useState(false)
  const [showSection3, setShowSection3] = useState(false)
  const [connectedDots, setConnectedDots] = useState<{row: number, col: number}[]>([])
  const [animationComplete, setAnimationComplete] = useState(false)
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

  // Check if user is in Section 2
  useEffect(() => {
    const sectionHeight = window.innerHeight
    const section2Start = sectionHeight // Section 2 starts after Section 1
    const section2End = sectionHeight * 2 // Section 2 ends before Section 3
    
    if (scrollY >= section2Start && scrollY < section2End) {
      setShowSection2Text(true)
    } else {
      setShowSection2Text(false)
    }
  }, [scrollY])

  // Check if user is in Section 3 and trigger animation
  useEffect(() => {
    const sectionHeight = window.innerHeight
    const section3Start = sectionHeight * 2 // Section 3 starts after Section 2
    const section3End = sectionHeight * 3 // Section 3 ends before Section 4
    
    if (scrollY >= section3Start && scrollY < section3End) {
      if (!showSection3) {
        setShowSection3(true)
        // Generate random path when entering section 3
        generateRandomPath()
      }
    } else {
      setShowSection3(false)
      setConnectedDots([])
      setAnimationComplete(false)
    }
  }, [scrollY, showSection3])

  // Generate random Manhattan path through the grid
  const generateRandomPath = useCallback(() => {
    const path: {row: number, col: number}[] = []
    
    // Start from random dot in first row (row 0)
    const startCol = Math.floor(Math.random() * 15)
    path.push({row: 0, col: startCol})
    
    let currentCol = startCol
    
    // Stop at random row between 10 and 14 (so > 10)
    const endRow = Math.floor(Math.random() * 5) + 10 // 10 to 14
    
    // Connect to one random dot in each subsequent row using Manhattan distance
    for (let row = 1; row <= endRow; row++) {
      // Random target column for this row
      const targetCol = Math.floor(Math.random() * 15)
      
      // Create Manhattan path from current position to target
      // First move horizontally, then vertically (or vice versa)
      const moveHorizontalFirst = Math.random() > 0.5
      
      if (moveHorizontalFirst) {
        // Move horizontally first
        while (currentCol !== targetCol) {
          currentCol += currentCol < targetCol ? 1 : -1
          if (path[path.length - 1].row === row - 1) {
            path.push({row: row - 1, col: currentCol})
          }
        }
        // Then move vertically
        path.push({row, col: currentCol})
      } else {
        // Move vertically first (to current row)
        path.push({row, col: currentCol})
        // Then move horizontally if needed
        while (currentCol !== targetCol) {
          currentCol += currentCol < targetCol ? 1 : -1
          path.push({row, col: currentCol})
        }
      }
    }
    
    // Animate the path drawing
    animatePath(path)
  }, [])

  // Animate the path drawing with delays
  const animatePath = (path: {row: number, col: number}[]) => {
    setConnectedDots([])
    path.forEach((dot, index) => {
      setTimeout(() => {
        setConnectedDots(prev => [...prev, dot])
        if (index === path.length - 1) {
          setAnimationComplete(true)
        }
      }, index * 100) // 100ms delay between each dot
    })
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
        {showSection2Text && (
          <div className="section-2-content">
            <h2 className="section-2-text">Among billions of possibilities, I recognize yours.</h2>
          </div>
        )}
      </section>
      
      <section className="section-full" id="section-3">
        {showSection3 && (
          <>
            <div className="dots-grid-container">
              <div className="dots-grid">
                {Array.from({ length: 15 }, (_, row) =>
                  Array.from({ length: 15 }, (_, col) => {
                    const isConnected = connectedDots.some(dot => dot.row === row && dot.col === col)
                    const isLastDot = animationComplete && 
                      connectedDots.length > 0 && 
                      connectedDots[connectedDots.length - 1].row === row && 
                      connectedDots[connectedDots.length - 1].col === col
                    
                    return (
                      <div
                        key={`${row}-${col}`}
                        className={`grid-dot ${isConnected ? 'connected' : ''} ${isLastDot ? 'final-dot' : ''}`}
                        style={{
                          gridRow: row + 1,
                          gridColumn: col + 1,
                        }}
                      />
                    )
                  })
                )}
                
                {/* Render connection lines */}
                {connectedDots.length > 1 && connectedDots.map((dot, index) => {
                  if (index === 0) return null
                  const prevDot = connectedDots[index - 1]
                  const isHorizontal = dot.row === prevDot.row
                  
                  if (isHorizontal) {
                    // Horizontal line
                    const startCol = Math.min(dot.col, prevDot.col)
                    const length = Math.abs(dot.col - prevDot.col)
                    return (
                      <div
                        key={`line-h-${index}`}
                        className="grid-line horizontal"
                        style={{
                          gridRow: dot.row + 1,
                          gridColumn: `${startCol + 1} / ${startCol + length + 2}`,
                        }}
                      />
                    )
                  } else {
                    // Vertical line
                    const startRow = Math.min(dot.row, prevDot.row)
                    const length = Math.abs(dot.row - prevDot.row)
                    return (
                      <div
                        key={`line-v-${index}`}
                        className="grid-line vertical"
                        style={{
                          gridRow: `${startRow + 1} / ${startRow + length + 2}`,
                          gridColumn: dot.col + 1,
                        }}
                      />
                    )
                  }
                })}
              </div>
            </div>
            
            <div className="section-3-text">
              <p>I map the hidden connections of markets.</p>
              <p>I trace the patterns others overlook.</p>
            </div>
          </>
        )}
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
