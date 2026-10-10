import { describe, it, expect } from "vitest";

describe("AbortController Cancellation & Stale Response Guards", () => {
  it("cancels in-flight stream reader when aborted", async () => {
    const controller = new AbortController();
    let accumulated = "";
    let completedNormally = false;
    let caughtAbort = false;

    // Simulate async stream chunk producer
    const streamChunks = ["Chunk 1", "Chunk 2", "Chunk 3", "Chunk 4"];

    const runReader = async () => {
      try {
        for (const chunk of streamChunks) {
          if (controller.signal.aborted) {
            throw new DOMException("The user aborted a request.", "AbortError");
          }
          accumulated += chunk;
          // Artificial network latency
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        completedNormally = true;
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") {
          caughtAbort = true;
        } else {
          throw err;
        }
      }
    };

    const promise = runReader();

    // Abort midway after 30ms
    setTimeout(() => {
      controller.abort();
    }, 30);

    await promise;

    expect(caughtAbort).toBe(true);
    expect(completedNormally).toBe(false);
    expect(accumulated).not.toBe("Chunk 1Chunk 2Chunk 3Chunk 4");
    expect(controller.signal.aborted).toBe(true);
  });

  it("rapid sequential requests abort earlier controllers so only the latest completes", async () => {
    let activeController: AbortController | null = null;
    let finalState: string | null = null;

    const triggerRequest = async (requestId: string) => {
      // 1. Abort previous request
      if (activeController) {
        activeController.abort();
      }

      const controller = new AbortController();
      activeController = controller;

      try {
        await new Promise((resolve) => setTimeout(resolve, 30));
        if (controller.signal.aborted) return;
        finalState = `Answer for ${requestId}`;
      } catch {
        // Ignored
      }
    };

    // Rapid sequential triggers (player 1 -> player 2 -> player 3)
    const p1 = triggerRequest("hardik-pandya");
    const p2 = triggerRequest("suryakumar-yadav");
    const p3 = triggerRequest("vinicius-jr");

    await Promise.all([p1, p2, p3]);

    // Only the last request should win
    expect(finalState).toBe("Answer for vinicius-jr");
  });
});
