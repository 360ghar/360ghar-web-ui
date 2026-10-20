import { Component, type ErrorInfo, type ReactNode } from 'react';
import { describeError } from '@/lib/api/errors';
import type { Locale } from '@/lib/i18n/locale';
import { StateBlock } from '@/ui/states/StateBlock';

type Props = {
  children: ReactNode;
  locale?: Locale;
  /** Called before the island renders again after "Try again". */
  onReset?: () => void;
  compact?: boolean;
  /** Shown instead of the error card, for small islands (a button, a toolbar). */
  fallback?: ReactNode;
};

type State = { error: unknown };

/**
 * Error boundary for one island. A crash in one island shows a paper error
 * state with "Try again" in that island only; the rest of the page keeps working.
 */
export class IslandBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  override componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('[island]', error, info.componentStack);
  }

  reset = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  override render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;
    const locale = this.props.locale ?? 'en';
    const { title, body, kind } = describeError(this.state.error, locale);
    return (
      <StateBlock
        scene={kind === 'network' ? 'offline' : 'error'}
        title={title}
        body={body}
        compact={this.props.compact}
        action={{ label: locale === 'hi' ? 'दोबारा कोशिश करें' : 'Try again', onClick: this.reset }}
      />
    );
  }
}
