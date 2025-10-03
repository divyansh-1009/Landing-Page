import { useEffect, useState, useRef } from 'react'
import Typed from 'typed.js'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import './App.css'

gsap.registerPlugin(ScrollTrigger)

// Dot interface for the merged section
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
  
  // Merged section states
  const [dots, setDots] = useState<Dot[]>([])
  const [fullPath, setFullPath] = useState<number[]>([])
    const [connectedDots, setConnectedDots] = useState<{ row: number; col: number }[]>([])
  const [currentProgress, setCurrentProgress] = useState<number>(0)
  const [highlightedDot, setHighlightedDot] = useState<{ row: number, col: number } | null>(null)
  const [smallDots, setSmallDots] = useState<Array<{ id: number, angle: number, color: string, absorbed: boolean }>>([])
  
  // Form states for section 4 (formerly 6)
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
  
  // Refs
  const section1Ref = useRef<HTMLElement>(null)
  const section4Ref = useRef<HTMLElement>(null)
  const mergedSectionRef = useRef<HTMLElement>(null)
  const dotsGridRef = useRef<HTMLDivElement>(null)
  const centralDotRef = useRef<HTMLDivElement>(null)
  const smallDotsContainerRef = useRef<HTMLDivElement>(null)
  const typedElementRef = useRef<HTMLDivElement>(null)
  const typedInstanceRef = useRef<Typed | null>(null)
  
  // Animation state refs
  const animationStateRef = useRef<{
    pathComplete: boolean
    dotCentered: boolean
    dotEnlarged: boolean
    smallDotsVisible: boolean
    dotsAbsorbed: boolean
  }>({
    pathComplete: false,
    dotCentered: false,
    dotEnlarged: false,
    smallDotsVisible: false,
    dotsAbsorbed: false
  })

  // Lenis smooth scroll setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      lenis.destroy()
    }
  }, [])

  // Initialize dot grid and path
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
      let currentCol = Math.floor(Math.random() * 15)
      
      for (let row = 0; row < 12; row++) {
        if (row > 8 && Math.random() > 0.7) break
        
        const dotIndex = row * 15 + currentCol
        path.push(dotIndex)
        
        if (row < 11) {
          const direction = Math.random() > 0.5 ? 1 : -1
          const steps = Math.floor(Math.random() * 3) + 1
          currentCol = Math.max(0, Math.min(14, currentCol + (direction * steps)))
        }
      }
      
      setFullPath(path)
      
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

  // Initialize small colored dots
  useEffect(() => {
    const colors = [
      '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
      '#14b8a6', '#f43f5e', '#eab308', '#a855f7', '#0ea5e9',
      '#22c55e', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4',
      '#84cc16', '#f59e0b', '#3b82f6', '#10b981', '#ef4444',
      '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
    ]
    const newSmallDots = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      angle: (i * 360 / 30),
      color: colors[i % colors.length],
      absorbed: false
    }))
    setSmallDots(newSmallDots)
  }, [])

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      // Re-run animation calculations on resize
      if (centralDotRef.current && highlightedDot && dotsGridRef.current && mergedSectionRef.current) {
        // Force recalculation of dot position
        const currentProgress = animationStateRef.current.dotCentered ? 0.5 : 0
        
        const section = mergedSectionRef.current
        const sectionRect = section.getBoundingClientRect()
        const centerX = sectionRect.width / 2
        const centerY = sectionRect.height * 0.35 // Position at 35% from top for consistency
        
        // We can directly use centerX and centerY values from current state
        
        if (currentProgress > 0) {
          // Update central dot position - when already centered, keep it at center
          centralDotRef.current.style.left = `${centerX}px`
          centralDotRef.current.style.top = `${centerY}px`
        }
      }
    }
    
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [highlightedDot])

  // Main scroll-jacking animation setup
  useEffect(() => {
    if (!mergedSectionRef.current || fullPath.length === 0) return

    const section = mergedSectionRef.current
    
    const handleScrollJackingAnimations = (progress: number) => {
      const state = animationStateRef.current
      
      // Update current progress state
      setCurrentProgress(progress)

      // Helper function to calculate progress within a range
      const getProgressInRange = (prog: number, start: number, end: number) => {
        if (prog < start) return 0
        if (prog > end) return 1
        return (prog - start) / (end - start)
      }

      // Step 1: Reveal path (0 - 0.25) - BIDIRECTIONAL
      const pathProgress = getProgressInRange(progress, 0, 0.25)
      if (pathProgress > 0) {
        const visibleDotsCount = Math.floor(pathProgress * fullPath.length)
        // Convert fullPath numbers to {row, col} objects
        const visiblePath = fullPath.slice(0, Math.max(1, visibleDotsCount)).map(index => ({
          row: Math.floor(index / 15),
          col: index % 15
        }))
        setConnectedDots(visiblePath)
        state.pathComplete = pathProgress >= 1
      } else {
        setConnectedDots([])
        state.pathComplete = false
      }
      
      // Step 2: Path complete, show text (0.25 - 0.35) - BIDIRECTIONAL
      if (progress >= 0.25) {
        // Convert fullPath numbers to {row, col} objects
        const formattedPath = fullPath.map(index => ({
          row: Math.floor(index / 15),
          col: index % 15
        }))
        setConnectedDots(formattedPath)
      }
      
      // Step 3: Move dot to center and hide grid/text (0.35 - 0.5) - BIDIRECTIONAL
      const centerProgress = getProgressInRange(progress, 0.35, 0.5)
      if (centralDotRef.current && highlightedDot && dotsGridRef.current) {
        const section = mergedSectionRef.current!
        const sectionRect = section.getBoundingClientRect()
        const centerX = sectionRect.width / 2
        const centerY = (sectionRect.height * 0.4) // Position at 35% from top instead of 50%
        
        // Calculate original dot position
        const gridRect = dotsGridRef.current.getBoundingClientRect()
        const sectionLeft = sectionRect.left
        const sectionTop = sectionRect.top
        const gridLeft = gridRect.left - sectionLeft
        const gridTop = gridRect.top - sectionTop
        
        // Get the actual cell size dynamically to fix mobile position calculation
        const gridWidth = gridRect.width
        const gridHeight = gridRect.height
        const cellWidth = gridWidth / 15 // 15 columns in the grid
        const cellHeight = gridHeight / 15 // 15 rows in the grid
        
        // Calculate precise start position using actual cell dimensions
        const startX = gridLeft + (highlightedDot.col + 0.5) * cellWidth
        const startY = gridTop + (highlightedDot.row + 0.5) * cellHeight
        
        const currentX = startX + (centerX - startX) * centerProgress
        const currentY = startY + (centerY - startY) * centerProgress
        
        centralDotRef.current.style.position = 'absolute'
        centralDotRef.current.style.left = `${currentX}px`
        centralDotRef.current.style.top = `${currentY}px`
        
        // Check if we're on mobile by looking at viewport width
        const isMobile = window.innerWidth <= 480
        const mobileScale = isMobile ? 1.5 : 1.8 // Use slightly smaller scale on mobile
        
        centralDotRef.current.style.transform = `translate(-50%, -50%) scale(${mobileScale})`
        centralDotRef.current.style.opacity = centerProgress > 0 ? '1' : '0'
        
        // Fade out/in grid and text - REVERSIBLE
        if (dotsGridRef.current) {
          dotsGridRef.current.style.opacity = `${1 - centerProgress}`
        }
        
        // Don't override the section-3-caption opacity with inline styles
        // Let the CSS classes handle the visibility based on connectedDots length
      }
      
      // Step 4: Enlarge dot and show new text (0.5 - 0.65) - BIDIRECTIONAL
      const enlargeProgress = getProgressInRange(progress, 0.5, 0.65)
      if (centralDotRef.current) {
        // Check if we're on mobile by looking at viewport width
        const isMobile = window.innerWidth <= 480
        const baseDotScale = isMobile ? 1.5 : 1.8 // Smaller base scale on mobile
        const maxDotScale = isMobile ? 10 : 14.4 // Smaller max scale on mobile
        const dotScaleRange = maxDotScale - baseDotScale
        
        const scale = baseDotScale + (dotScaleRange) * enlargeProgress
        
        // Create pulsating blue glow that intensifies as the dot enlarges
        const glowIntensity = enlargeProgress
        // Adjust glow size for mobile
        const glowFactor = isMobile ? 0.7 : 1 // 70% size for mobile
        const baseGlow = (20 + (80 * glowIntensity)) * glowFactor
        const midGlow = (40 + (120 * glowIntensity)) * glowFactor
        const outerGlow = (60 + (140 * glowIntensity)) * glowFactor
        
        const blueGlow = glowIntensity > 0 ? `
          0 0 ${baseGlow}px rgba(59, 130, 246, ${0.6 + 0.3 * glowIntensity}),
          0 0 ${midGlow}px rgba(59, 130, 246, ${0.4 + 0.2 * glowIntensity}),
          0 0 ${outerGlow}px rgba(59, 130, 246, ${0.2 + 0.2 * glowIntensity}),
          0 0 ${outerGlow + 50 * glowFactor}px rgba(59, 130, 246, ${0.1 + 0.1 * glowIntensity})
        ` : '0 0 20px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6), 0 0 60px rgba(255, 255, 255, 0.4)'
        
        centralDotRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`
        centralDotRef.current.style.boxShadow = blueGlow
        
        if (enlargeProgress > 0) {
          centralDotRef.current.style.animation = `bluePulse ${2 - 0.5 * enlargeProgress}s infinite ease-in-out`
        } else {
          centralDotRef.current.style.animation = 'none'
        }
      }
      
      // Show/Hide "And I find the opportunities made for you." text - BIDIRECTIONAL
      const step4TextEl = document.querySelector('.step-4-text') as HTMLElement
      
      // Step 5: Hide text, show colored dots (0.65 - 0.72) - BIDIRECTIONAL
      const smallDotsProgress = getProgressInRange(progress, 0.65, 0.72)
      
      // Handle step 4 text visibility - REVERSIBLE (only show during enlargement, hide during dots phase)
      if (step4TextEl) {
        const step4TextOpacity = enlargeProgress > 0 && smallDotsProgress === 0 ? enlargeProgress : 0
        step4TextEl.style.opacity = `${step4TextOpacity}`
      }
      
      // Show small colored dots - REVERSIBLE
      if (smallDotsContainerRef.current) {
        smallDotsContainerRef.current.style.opacity = `${smallDotsProgress}`
      }
      
      // Step 6: Absorb colored dots into central dot (0.72 - 0.92) - BIDIRECTIONAL
      const absorbOverallProgress = getProgressInRange(progress, 0.72, 0.92)
      
      // Animate small dots converging to center - REVERSIBLE
      const smallDotElements = document.querySelectorAll('.small-dot')
      smallDotElements.forEach((dot, index) => {
        const delay = index * 0.025
        const adjustedProgress = Math.max(0, Math.min(1, (absorbOverallProgress - delay) / Math.max(0.15, 1 - delay)))
        
        const element = dot as HTMLElement
        const startXStr = element.style.getPropertyValue('--start-x') || '0px'
        const startYStr = element.style.getPropertyValue('--start-y') || '0px'
        const startX = parseFloat(startXStr)
        const startY = parseFloat(startYStr)
        
        // Animate from start position to center (0,0) with easing - REVERSIBLE
        const easedProgress = adjustedProgress * adjustedProgress * (3 - 2 * adjustedProgress)
        const currentX = startX * (1 - easedProgress)
        const currentY = startY * (1 - easedProgress)
        const scale = Math.max(0, 1 - easedProgress)
        
        element.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`
        element.style.opacity = `${Math.max(0, 1 - easedProgress)}`
      })
      
      // Step 7: Hide central dot, show final text (0.92 - 1) - BIDIRECTIONAL
      const finalProgress = getProgressInRange(progress, 0.92, 1)
      
      // Hide central dot - REVERSIBLE (show when in center/enlarge/dots phases)
      if (centralDotRef.current) {
        const shouldShowCentralDot = progress >= 0.35 && progress < 0.92
        const centralOpacity = shouldShowCentralDot ? 1 : (progress < 0.35 ? 0 : 1 - finalProgress)
        centralDotRef.current.style.opacity = `${centralOpacity}`
      }
      
      // Handle small dots container visibility - REVERSIBLE
      if (smallDotsContainerRef.current) {
        const shouldShowSmallDots = progress >= 0.65 && progress < 0.92
        if (shouldShowSmallDots) {
          smallDotsContainerRef.current.style.opacity = `${smallDotsProgress}`
        } else {
          smallDotsContainerRef.current.style.opacity = '0'
        }
      }
      
      // Show final text - REVERSIBLE
      const finalTextEl = document.querySelector('.final-section-text') as HTMLElement
      if (finalTextEl) {
        finalTextEl.style.opacity = `${finalProgress}`
      }

      // Update state flags for debugging (optional)
      state.pathComplete = pathProgress >= 1
      state.dotCentered = centerProgress > 0
      state.dotEnlarged = enlargeProgress > 0
      state.smallDotsVisible = smallDotsProgress > 0
      state.dotsAbsorbed = absorbOverallProgress >= 1
    }
    
    // Create ScrollTrigger for the merged section with pinning
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "+=400%", // 4x the viewport height for all animations
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress
        handleScrollJackingAnimations(progress)
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [fullPath, dots, smallDots, highlightedDot])

  // Check if user is in Section 2
  useEffect(() => {
    const sectionHeight = window.innerHeight
    const isMobile = window.innerWidth <= 480
    
    // Adjust section 2 start position for mobile to make text appear faster
    const section2Start = isMobile ? sectionHeight * 0.7 : sectionHeight // Start at 70% of section 1 on mobile
    const section2End = isMobile ? sectionHeight * 1.6 : sectionHeight * 2 // End adjusted for mobile's 60vh section 2
    
    if (scrollY >= section2Start && scrollY < section2End) {
      setShowSection2Text(true)
    } else {
      setShowSection2Text(false)
    }
  }, [scrollY])

  // Initialize selected rectangle
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * 15) + 5
    setSelectedRectIndex(randomIndex)
  }, [])

  // Initialize Typed.js for final message
  useEffect(() => {
    if (showFinalMessage && typedElementRef.current) {
      if (typedInstanceRef.current) {
        typedInstanceRef.current.destroy()
      }
      
      typedInstanceRef.current = new Typed(typedElementRef.current, {
        strings: ["Great opportunities await you. Sharpen your blades, now on, we shall fight the market battles rigged for you to win."],
        typeSpeed: 40,
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

  // Form handling
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
    const progress = Math.min(scrollY / (sectionHeight * 0.5), 1)
    return progress
  }

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
            const selectedColorValue = selectedRectIndex !== null 
              ? Math.round((selectedRectIndex / 19) * 255)
              : 0
            const selectedBackgroundColor = `rgb(${selectedColorValue}, ${selectedColorValue}, ${selectedColorValue})`
            
            return Array.from({ length: 20 }, (_, index) => {
              const isSelected = index === selectedRectIndex
              const opacity = 1 - animationProgress * (isSelected ? 0 : 1)
              
              let backgroundColor: string
              if (animationProgress > 0 && selectedRectIndex !== null) {
                backgroundColor = selectedBackgroundColor
              } else {
                const colorValue = Math.round((index / 19) * 255)
                backgroundColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`
              }
              
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
                const finalWidth = 100
                const currentWidth = 100 / 20
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
      
      <section className="section-full merged-section" id="section-3" ref={mergedSectionRef}>
        {/* Dots Grid (Step 1-2) */}
        <div className="dots-grid-container">
          <div className="dots-grid" ref={dotsGridRef}>
            {dots.map((dot) => {
              const isConnected = connectedDots.some(d => d.row === dot.row && d.col === dot.col)
              // Only highlight the dot if the path is complete (progress >= 0.25) and central dot hasn't started moving (progress < 0.35)
              const isHighlighted = highlightedDot?.row === dot.row && highlightedDot?.col === dot.col && currentProgress >= 0.25 && currentProgress < 0.35
              
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
            
            {/* Connecting lines */}
            <svg className="connection-lines" viewBox="0 0 450 450">
              {connectedDots.map((dot, i) => {
                if (i === connectedDots.length - 1) return null
                
                const currentRow = dot.row
                const currentCol = dot.col
                const nextDot = connectedDots[i + 1]
                const nextRow = nextDot.row
                const nextCol = nextDot.col
                
                const x1 = currentCol * 30 + 15
                const y1 = currentRow * 30 + 15
                const x2 = nextCol * 30 + 15
                const y2 = nextRow * 30 + 15
                
                return (
                  <g key={`line-${i}`}>
                    <line x1={x1} y1={y1} x2={x1} y2={y2} className="connection-line" />
                    <line x1={x1} y1={y2} x2={x2} y2={y2} className="connection-line" />
                  </g>
                )
              })}
            </svg>
          </div>
        </div>
        
        {/* Step 1-2 Text - Positioned below the grid */}
        <div className={`section-3-caption ${connectedDots.length > 0 && currentProgress < 0.25 ? 'section-caption-visible' : 'section-caption-hidden'}`}>
          <p>I map the hidden connections of markets. I trace the patterns others overlook.</p>
        </div>
        
        {/* Central Dot (Steps 3-6) */}
        <div 
          ref={centralDotRef}
          className="central-animated-dot"
          style={{ opacity: 0 }}
        />
        
        {/* Step 4 Text */}
        <div className="step-4-text scroll-text">
          <p>And I find the opportunities made for you.</p>
        </div>
        
        {/* Small Colored Dots (Steps 5-6) */}
        <div ref={smallDotsContainerRef} className="small-dots-container" style={{ opacity: 0 }}>
          {smallDots.map((smallDot) => {
            const radius = 150
            const x = Math.cos((smallDot.angle * Math.PI) / 180) * radius
            const y = Math.sin((smallDot.angle * Math.PI) / 180) * radius
            
            return (
              <div
                key={smallDot.id}
                className="small-dot"
                style={{
                  '--start-x': `${x}px`,
                  '--start-y': `${y}px`,
                  '--dot-color': smallDot.color,
                  transform: `translate(${x}px, ${y}px)`,
                  boxShadow: `0 0 22px ${smallDot.color}, 0 0 44px ${smallDot.color}, 0 0 28px rgba(255, 255, 255, 0.45)`,
                } as React.CSSProperties}
              />
            )
          })}
        </div>
        
        {/* Final Text (Step 7) */}
        <div className="final-section-text scroll-text">
          <p>Amongst the entropy, I found your perfect business opportunity, backed by my proprietary intense market research and reasoning.</p>
        </div>
      </section>
      
      <section className="section-full" id="section-4" ref={section4Ref}>
        <div className="section-4-container">
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
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default App
