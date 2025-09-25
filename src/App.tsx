import { useEffect, useState, useRef } from 'react'
import Typed from 'typed.js'
import './App.css'

// Dot interface for section 3
interface Dot {
  id: string
  row: number
  col: number
  isConnected: boolean
  isHighlighted: boolean
}

// Form step interface for section 6
interface FormStep {
  id: number
  placeholder: string
  completed: boolean
  value: string
}

function App() {
  const [scrollY, setScrollY] = useState(0)
  const [selectedRectIndex, setSelectedRectIndex] = useState<number | null>(null)
  const [showText, setShowText] = useState(false)
  const [showSection2Text, setShowSection2Text] = useState(false)
  
  // Section 3 states
  const [dots, setDots] = useState<Dot[]>([])
  const [fullPath, setFullPath] = useState<number[]>([]) // Complete path
  const [connectedDots, setConnectedDots] = useState<number[]>([]) // Visible path based on scroll
  const [highlightedDot, setHighlightedDot] = useState<{ row: number, col: number } | null>(null)
  
  // Section 4 states
  const [section4Progress, setSection4Progress] = useState(0)
  
  // Section 5 states
  const [section5Progress, setSection5Progress] = useState(0)
  const [smallDots, setSmallDots] = useState<Array<{ id: number, angle: number, color: string, absorbed: boolean }>>([])
  
  // Section 6 states
  const [formSteps, setFormSteps] = useState<FormStep[]>([
    { id: 1, placeholder: "Your company's website.", completed: false, value: "" },
    { id: 2, placeholder: "Your company's name.", completed: false, value: "" },
    { id: 3, placeholder: "Your name.", completed: false, value: "" },
    { id: 4, placeholder: "Your role.", completed: false, value: "" },
    { id: 5, placeholder: "Your official email address.", completed: false, value: "" },
    { id: 6, placeholder: "Your contact number.", completed: false, value: "" }
  ])
  const [currentFormStep, setCurrentFormStep] = useState(0)
  const [showFinalMessage, setShowFinalMessage] = useState(false)
  const [formInputValue, setFormInputValue] = useState("")
  
  const section1Ref = useRef<HTMLElement>(null)
  const section3Ref = useRef<HTMLElement>(null)
  const typedElementRef = useRef<HTMLDivElement>(null)
  const typedInstanceRef = useRef<Typed | null>(null)
  const section4GridRef = useRef<HTMLDivElement>(null)
  const section4Ref = useRef<HTMLElement>(null)
  const section5Ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Initialize dot grid for section 3
  useEffect(() => {
    const initializeDots = () => {
      const newDots: Dot[] = []
      for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
          newDots.push({
            id: `${row}-${col}`,
            row,
            col,
            isConnected: false,
            isHighlighted: false
          })
        }
      }
      setDots(newDots)
    }

    const createPath = () => {
      const path: number[] = []
      let currentCol = Math.floor(Math.random() * 15) // Random start in first row
      
      for (let row = 0; row < 15; row++) {
        if (row > 10 && Math.random() > 0.7) break // Stop randomly after row 10
        
        const dotIndex = row * 15 + currentCol
        path.push(dotIndex)
        
        if (row < 14) {
          // Manhattan distance movement to next row
          const direction = Math.random() > 0.5 ? 1 : -1
          const steps = Math.floor(Math.random() * 3) + 1 // 1-3 steps
          currentCol = Math.max(0, Math.min(14, currentCol + (direction * steps)))
        }
      }
      
      setFullPath(path) // Store the complete path
      
      // Set highlighted dot (last in path) immediately for consistency
      if (path.length > 0) {
        const lastDotIndex = path[path.length - 1]
        const row = Math.floor(lastDotIndex / 15)
        const col = lastDotIndex % 15
        setHighlightedDot({ row, col })
      }
    }

    initializeDots()
    createPath()
  }, [])

  // Initialize small dots for section 5
  useEffect(() => {
    const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
    const newSmallDots = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      angle: (i * 360 / 30),
      color: colors[i % colors.length],
      absorbed: false
    }))
    setSmallDots(newSmallDots)
  }, [])

  // Track section progress based on scroll
  useEffect(() => {
    const sectionHeight = window.innerHeight

    // Section 3 progress - Reveal begins BEFORE section enters viewport
    if (section3Ref.current && fullPath.length > 0) {
      const rect = section3Ref.current.getBoundingClientRect()
      const viewportH = window.innerHeight

      // Start revealing when the top of section 3 is at 80% of viewport height
      // Finish revealing when the top reaches 20% of viewport height
      const startTrigger = viewportH * 0.8
      const endTrigger = viewportH * 0.2
      const distance = Math.max(1, startTrigger - endTrigger)
      const rawProgress = (startTrigger - rect.top) / distance
      const progress = Math.min(1, Math.max(0, rawProgress))

      if (progress <= 0) {
        setConnectedDots([])
      } else if (progress >= 1) {
        setConnectedDots(fullPath)
      } else {
        const visibleDotsCount = Math.floor(progress * fullPath.length)
        setConnectedDots(fullPath.slice(0, Math.max(1, visibleDotsCount))) // Always show at least first dot
      }
    }
    
    // Section 4 progress - Begin movement before entering viewport
    if (section4Ref.current) {
      const rect4 = section4Ref.current.getBoundingClientRect()
      const viewportH = window.innerHeight
      const startTrigger4 = viewportH * 0.9 // start earlier (near bottom)
      const endTrigger4 = viewportH * 0.3   // finish sooner (upper third)
      const distance4 = Math.max(1, startTrigger4 - endTrigger4)
      const rawProgress4 = (startTrigger4 - rect4.top) / distance4
      const progress4 = Math.min(1, Math.max(0, rawProgress4))
      setSection4Progress(progress4)
    }
    
    // Section 5 progress - begin before entering viewport (early trigger)
    if (section5Ref.current) {
      const rect5 = section5Ref.current.getBoundingClientRect()
      const viewportH = window.innerHeight
      const startTrigger5 = viewportH * 0.95
      const endTrigger5 = viewportH * 0.3
      const distance5 = Math.max(1, startTrigger5 - endTrigger5)
      const rawProgress5 = (startTrigger5 - rect5.top) / distance5
      const progress5 = Math.min(1, Math.max(0, rawProgress5))
      setSection5Progress(progress5)

      if (progress5 > 0.3) {
        setSmallDots(prev => 
          prev.map((dot, index) => ({
            ...dot,
            absorbed: progress5 > (0.3 + (index * 0.02))
          }))
        )
      } else if (progress5 === 0) {
        setSmallDots(prev => prev.map(dot => ({ ...dot, absorbed: false })))
      }
    }
  }, [scrollY, fullPath])

  // Initialize selected rectangle
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 15) + 5; // 5 to 19
    setSelectedRectIndex(randomIndex)
  }, [])

  // Initialize Typed.js when final message shows
  useEffect(() => {
    if (showFinalMessage && typedElementRef.current) {
      // Cleanup previous instance
      if (typedInstanceRef.current) {
        typedInstanceRef.current.destroy()
      }
      
      typedInstanceRef.current = new Typed(typedElementRef.current, {
        strings: ["Great opportunities await you. Sharpen your blades, now on, we shall fight the market battles rigged for you to win."],
        typeSpeed: 50,
        showCursor: false,
        loop: false,
        fadeOut: false,
      })
    }

    return () => {
      if (typedInstanceRef.current) {
        typedInstanceRef.current.destroy()
      }
    }
  }, [showFinalMessage])

  // Form handling for section 6
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (currentFormStep < formSteps.length - 1) {
      setFormSteps(prev => 
        prev.map((step, index) => 
          index === currentFormStep 
            ? { ...step, completed: true, value: formInputValue }
            : step
        )
      )
      setCurrentFormStep(prev => prev + 1)
      setFormInputValue("")
    } else {
      // Final submission
      setFormSteps(prev => 
        prev.map((step, index) => 
          index === currentFormStep 
            ? { ...step, completed: true, value: formInputValue }
            : step
        )
      )
      setShowFinalMessage(true)
    }
  }

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

  const animationProgress = getAnimationProgress()

  // Dynamic contrasting text color for Section 1 overlay text
  const section1TextColor = (() => {
    if (selectedRectIndex === null) return '#ffffff'
    const selectedColorValue = Math.round((selectedRectIndex / 19) * 255)
    return selectedColorValue > 128 ? '#000000' : '#ffffff'
  })()

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
            <div className="overlay-text" style={{ color: section1TextColor }}>
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
      
      <section className="section-full" id="section-3" ref={section3Ref}>
        <div className="dots-grid-container">
          <div className="dots-grid">
            {dots.map((dot) => {
              const isConnected = connectedDots.includes(dot.row * 15 + dot.col)
              const isHighlighted = highlightedDot?.row === dot.row && highlightedDot?.col === dot.col
              
              return (
                <div
                  key={dot.id}
                  className={`dot ${isConnected ? 'connected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                  style={{
                    gridRow: dot.row + 1,
                    gridColumn: dot.col + 1,
                  }}
                />
              )
            })}
            
            {/* Draw connecting lines */}
            <svg className="connection-lines" viewBox="0 0 450 450">
              {connectedDots.map((dotIndex, i) => {
                if (i === connectedDots.length - 1) return null
                
                const currentRow = Math.floor(dotIndex / 15)
                const currentCol = dotIndex % 15
                const nextDotIndex = connectedDots[i + 1]
                const nextRow = Math.floor(nextDotIndex / 15)
                const nextCol = nextDotIndex % 15
                
                const x1 = currentCol * 30 + 15
                const y1 = currentRow * 30 + 15
                const x2 = nextCol * 30 + 15
                const y2 = nextRow * 30 + 15
                
                // Manhattan distance path (L-shaped)
                return (
                  <g key={`line-${i}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x1}
                      y2={y2}
                      className="connection-line"
                    />
                    <line
                      x1={x1}
                      y1={y2}
                      x2={x2}
                      y2={y2}
                      className="connection-line"
                    />
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
        <div className={`section-3-caption ${connectedDots.length > 0 ? 'section-caption-visible' : ''}`}>
          <p>I map the hidden connections of markets. I trace the patterns others overlook.</p>
        </div>
      </section>
      
      <section className="section-full" id="section-4" ref={section4Ref}>
        <div className="section-4-container">
          {/* All dots from section 3, with the highlighted one moving to center */}
          <div className="dots-grid-section-4" ref={section4GridRef}>
            {dots.map((dot) => {
              const isHighlighted = highlightedDot?.row === dot.row && highlightedDot?.col === dot.col
              const wasConnected = fullPath.includes(dot.row * 15 + dot.col)

              if (isHighlighted) {
                // Compute movement from original grid position to center based on progress
                const gridW = section4GridRef.current?.clientWidth ?? 450
                const gridH = section4GridRef.current?.clientHeight ?? 450
                const cellW = gridW / 15
                const cellH = gridH / 15
                const startX = (dot.col + 0.5) * cellW
                const startY = (dot.row + 0.5) * cellH
                const centerX = gridW / 2
                const centerY = gridH / 2
                const currentX = startX + (centerX - startX) * section4Progress
                const currentY = startY + (centerY - startY) * section4Progress

                return (
                  <div key={`s4-${dot.id}`}>
                    <div
                      className="central-dot expanding blue"
                      style={{
                        position: 'absolute',
                        left: `${currentX}px`,
                        top: `${currentY}px`,
                        transform: `translate(-50%, -50%) scale(${1 + section4Progress * 3})`,
                        opacity: 1,
                        zIndex: 10,
                      }}
                    />
                  </div>
                )
              }

              return (
                <div
                  key={`s4-${dot.id}`}
                  className={`dot section-4-dot ${wasConnected ? 'was-connected' : ''}`}
                  style={{
                    gridRow: dot.row + 1,
                    gridColumn: dot.col + 1,
                    opacity: Math.max(0, 1 - section4Progress * 1),
                  }}
                />
              )
            })}
          </div>
          <div className="section-4-caption">
            <p className={`${section4Progress > 0.15 ? 'section-caption-visible' : ''}`}>And I find the opportunities made for you.</p>
          </div>
        </div>
      </section>
      
      <section className="section-full" id="section-5" ref={section5Ref}>
        <div className="section-5-container">
          <div 
            className="central-dot absorbing"
            style={{
              filter: `drop-shadow(0 0 ${45 + section5Progress * 30}px rgba(220, 220, 220, 0.95))`,
            }}
          />
          
          <div className="small-dots-circle">
            {smallDots.map((smallDot) => {
              const eased = section5Progress < 0.5
                ? (section5Progress * section5Progress * 2)
                : (1 - Math.pow(1 - section5Progress, 2))
              const radius = 150 - (smallDot.absorbed ? eased * 140 : 0)
              const x = Math.cos((smallDot.angle * Math.PI) / 180) * radius
              const y = Math.sin((smallDot.angle * Math.PI) / 180) * radius
              
              return (
                <div
                  key={smallDot.id}
                  className="small-dot"
                  style={{
                    transform: `translate(${x}px, ${y}px) scale(${smallDot.absorbed ? 0.2 : 1})`,
                    opacity: smallDot.absorbed ? 0.1 : 1,
                    boxShadow: `0 0 ${22 + eased * 32}px ${smallDot.color}, 0 0 ${44 + eased * 48}px ${smallDot.color}, 0 0 ${28 + eased * 40}px rgba(255, 255, 255, 0.35)`,
                    filter: `saturate(${1.6}) brightness(${1.35})`,
                  }}
                />
              )
            })}
          </div>

          {section5Progress > 0.85 && (
            <div className="section-5-content">
              <h2 className="section-5-text">Amongst the entropy, I found your perfect business opportunity, backed by my proprietary intense market research and reasoning.</h2>
            </div>
          )}
        </div>
      </section>
      
      <section className="section-full" id="section-6">
        <div className="section-6-container">
          {!showFinalMessage ? (
            <form className="morphed-form" onSubmit={handleFormSubmit}>
              <div className="form-input-container">
                <input
                  type="text"
                  value={formInputValue}
                  onChange={(e) => setFormInputValue(e.target.value)}
                  placeholder={formSteps[currentFormStep]?.placeholder}
                  className="form-input"
                  required
                />
                <button type="submit" className="form-arrow">
                  →
                </button>
              </div>
            </form>
          ) : (
            <div className="final-message-container">
              <div 
                ref={typedElementRef}
                className="typed-message"
              ></div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
