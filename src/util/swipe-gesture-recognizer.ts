// Adapted from home-assistant/frontend src/common/util/swipe-gesture-recognizer.ts.
// Source revision: 3052989e9d4aa4d67b6a07c9edcb6e3cf98a01af.
export interface SwipeGestureResult {
  velocity: number;
  delta: number;
  isSwipe: boolean;
  isDownwardSwipe: boolean;
}

export class SwipeGestureRecognizer {
  private _startY = 0;
  private _delta = 0;
  private _startTime = 0;
  private _lastY = 0;
  private _lastTime = 0;

  public start(clientY: number): void {
    const now = Date.now();
    this._startY = clientY;
    this._startTime = now;
    this._lastY = clientY;
    this._lastTime = now;
    this._delta = 0;
  }

  /** Negative delta means a downward drag. */
  public move(clientY: number): number {
    this._delta = this._startY - clientY;
    this._lastY = clientY;
    this._lastTime = Date.now();

    return this._delta;
  }

  public end(): SwipeGestureResult {
    const timeDelta = this._lastTime - this._startTime;

    const velocity =
      Date.now() - this._lastTime < 100 && timeDelta > 0
        ? (this._lastY - this._startY) / timeDelta
        : 0;

    return {
      velocity,
      delta: this._delta,
      isSwipe: Math.abs(velocity) > 0.5,
      isDownwardSwipe: velocity > 0,
    };
  }
}
