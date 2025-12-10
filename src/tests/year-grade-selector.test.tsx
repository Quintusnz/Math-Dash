import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { YearGradeSelector } from '@/components/features/curriculum/YearGradeSelector';

describe('YearGradeSelector', () => {
  it('auto-selects the derived grade and reports it via onChange when no value is provided', async () => {
    const onChange = vi.fn();

    render(
      <YearGradeSelector
        country="NZ"
        ageBand="7-8"
        onChange={onChange}
        autoSelect
      />
    );

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith('Y3');
    });

    expect(
      screen.getByText(
        'Recommended for the 7-8 age band: Year 3. You can override this if your child is in a different year/grade (held back or accelerated).'
      )
    ).toBeInTheDocument();
  });

  it('respects an explicit value override even when the age band suggests a different grade', async () => {
    const onChange = vi.fn();

    render(
      <YearGradeSelector
        country="NZ"
        ageBand="7-8"
        value="Y2"
        onChange={onChange}
      />
    );

    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalled();
    });

    const year2Button = screen.getByText('Year 2').closest('button');
    expect(year2Button).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('keeps a provided defaultValue selected instead of auto-selecting the derived suggestion', async () => {
    const onChange = vi.fn();

    render(
      <YearGradeSelector
        country="NZ"
        ageBand="7-8"
        defaultValue="Y2"
        onChange={onChange}
        autoSelect
      />
    );

    // Should not auto-invoke onChange when defaultValue is present
    await waitFor(() => {
      expect(onChange).not.toHaveBeenCalled();
    });

    const year2Button = screen.getByText('Year 2').closest('button');
    expect(year2Button).toHaveAttribute('aria-checked', 'true');
    // Recommended badge still points to the derived grade
    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });
});
