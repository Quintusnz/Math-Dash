import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PauseModal } from '@/components/game/PauseModal';

// Mock framer-motion to avoid animation issues in tests
vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

describe('PauseModal', () => {
  const defaultProps = {
    isOpen: true,
    onResume: vi.fn(),
    onEndSession: vi.fn(),
    pauseStartedAt: null,
    pauseCount: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<PauseModal {...defaultProps} />);
      
      expect(screen.getByText('Game Paused')).toBeInTheDocument();
      expect(screen.getByText('Looks like you stepped away')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<PauseModal {...defaultProps} isOpen={false} />);
      
      expect(screen.queryByText('Game Paused')).not.toBeInTheDocument();
    });

    it('should render Resume button', () => {
      render(<PauseModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /resume/i })).toBeInTheDocument();
    });

    it('should render End Session button', () => {
      render(<PauseModal {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /end session/i })).toBeInTheDocument();
    });

    it('should have accessible dialog role', () => {
      render(<PauseModal {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onResume when Resume button is clicked', () => {
      const onResume = vi.fn();
      render(<PauseModal {...defaultProps} onResume={onResume} />);
      
      fireEvent.click(screen.getByRole('button', { name: /resume/i }));
      
      expect(onResume).toHaveBeenCalledTimes(1);
    });

    it('should call onEndSession when End Session button is clicked', () => {
      const onEndSession = vi.fn();
      render(<PauseModal {...defaultProps} onEndSession={onEndSession} />);
      
      fireEvent.click(screen.getByRole('button', { name: /end session/i }));
      
      expect(onEndSession).toHaveBeenCalledTimes(1);
    });

    it('should auto-focus the Resume button', () => {
      render(<PauseModal {...defaultProps} />);
      
      const resumeButton = screen.getByRole('button', { name: /resume/i });
      expect(resumeButton).toHaveFocus();
    });
  });

  describe('Elapsed time display', () => {
    it('should not show elapsed time when pauseStartedAt is null', () => {
      render(<PauseModal {...defaultProps} pauseStartedAt={null} />);
      
      expect(screen.queryByText(/paused for/i)).not.toBeInTheDocument();
    });

    it('should show elapsed time when pauseStartedAt is set', async () => {
      // Set pause started 5 seconds ago
      const fiveSecondsAgo = Date.now() - 5000;
      
      render(<PauseModal {...defaultProps} pauseStartedAt={fiveSecondsAgo} />);
      
      // Wait for the elapsed time to be calculated and displayed
      await waitFor(() => {
        expect(screen.getByText(/paused for/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pause count display', () => {
    it('should not show pause count hint when count is 0', () => {
      render(<PauseModal {...defaultProps} pauseCount={0} />);
      
      expect(screen.queryByText(/paused.*times/i)).not.toBeInTheDocument();
    });

    it('should not show pause count hint when count is 1', () => {
      render(<PauseModal {...defaultProps} pauseCount={1} />);
      
      expect(screen.queryByText(/paused.*times/i)).not.toBeInTheDocument();
    });

    it('should show pause count hint when count is greater than 1', () => {
      render(<PauseModal {...defaultProps} pauseCount={3} />);
      
      expect(screen.getByText(/paused 3 times this session/i)).toBeInTheDocument();
    });
  });
});
