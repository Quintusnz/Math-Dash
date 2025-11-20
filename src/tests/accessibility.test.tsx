import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Numpad } from '@/components/game/Numpad'
import { TimerBar } from '@/components/game/TimerBar'
import { ResultScreen } from '@/components/game/ResultScreen'

// Mock motion to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Accessibility Audit', () => {
  
  describe('Numpad Component', () => {
    it('should have aria-labels for special keys', () => {
      render(
        <Numpad 
          onPress={() => {}} 
          onClear={() => {}} 
          onSubmit={() => {}} 
        />
      )
      
      expect(screen.getByLabelText('Clear')).toBeInTheDocument()
      expect(screen.getByLabelText('Submit Answer')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
    })

    it('should be keyboard accessible via click handler', () => {
      const handlePress = vi.fn()
      render(
        <Numpad 
          onPress={handlePress} 
          onClear={() => {}} 
          onSubmit={() => {}} 
        />
      )
      
      const button1 = screen.getByText('1')
      fireEvent.click(button1)
      expect(handlePress).toHaveBeenCalledWith('1')
    })
  })

  describe('TimerBar Component', () => {
    it('should have progressbar role and aria values', () => {
      render(<TimerBar timeLeft={30} totalTime={60} />)
      
      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('aria-valuenow', '30')
      expect(progressBar).toHaveAttribute('aria-valuemin', '0')
      expect(progressBar).toHaveAttribute('aria-valuemax', '60')
      expect(progressBar).toHaveAttribute('aria-label', 'Time remaining')
    })
  })

  describe('ResultScreen Component', () => {
    it('should have accessible emojis for achievements', () => {
      const achievements: any[] = [
        { 
          id: '1', 
          title: 'Speed Demon', 
          icon: '⚡', 
          description: 'Fast!', 
          category: 'speed',
          condition: { type: 'SPEED', value: 100 }
        }
      ]
      
      render(
        <ResultScreen 
          score={100} 
          correct={10} 
          total={10} 
          achievements={achievements}
          onPlayAgain={() => {}}
          onHome={() => {}}
        />
      )
      
      const emoji = screen.getByRole('img', { name: 'Speed Demon' })
      expect(emoji).toBeInTheDocument()
      expect(emoji).toHaveTextContent('⚡')
    })
  })
})
