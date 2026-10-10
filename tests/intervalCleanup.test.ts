import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Simulation Timer & Interval Cleanup", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("advances simulation on interval and cleans up on stop", () => {
    let index = 0;
    const maxSteps = 3;
    let timerId: ReturnType<typeof setInterval> | null = null;

    const startSimulation = () => {
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
        index = (index + 1) % maxSteps;
      }, 6000);
    };

    const stopSimulation = () => {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    };

    startSimulation();
    expect(index).toBe(0);

    // Fast-forward 6s -> step 1
    vi.advanceTimersByTime(6000);
    expect(index).toBe(1);

    // Fast-forward 6s -> step 2
    vi.advanceTimersByTime(6000);
    expect(index).toBe(2);

    // Stop simulation
    stopSimulation();

    // Fast-forward 18s -> index must NOT change
    vi.advanceTimersByTime(18000);
    expect(index).toBe(2);
    expect(timerId).toBeNull();
  });

  it("never doubles intervals on repeated rapid start/stop calls", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval");
    let timerId: ReturnType<typeof setInterval> | null = null;
    let tickCount = 0;

    const toggleSimulation = (shouldRun: boolean) => {
      if (!shouldRun) {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      } else {
        if (timerId) clearInterval(timerId);
        timerId = setInterval(() => {
          tickCount++;
        }, 6000);
      }
    };

    // Toggle on -> off -> on -> off rapidly
    toggleSimulation(true);
    toggleSimulation(false);
    toggleSimulation(true);
    toggleSimulation(false);
    toggleSimulation(true);

    expect(clearIntervalSpy).toHaveBeenCalled();

    // Advance 6s: should tick exactly ONCE (not 3 times from doubled timers)
    vi.advanceTimersByTime(6000);
    expect(tickCount).toBe(1);

    toggleSimulation(false);
  });
});
