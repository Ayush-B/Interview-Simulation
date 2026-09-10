import {
  describe,
  expect,
  it
} from "vitest";

import {
  Queue,
  QueueEvents,
  Worker
} from "bullmq";

import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error(
    "REDIS_URL is missing from test environment"
  );
}

describe("BullMQ retry integration", () => {
  it(
    "retries a failed job three times before permanently failing",
    async () => {
      /*
       * Unique queue name keeps this test isolated
       * from the production evaluation queue.
       */
      const queueName =
        `retry-test-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`;

      const producerConnection =
        new IORedis(redisUrl, {
          maxRetriesPerRequest: 1
        });

      const workerConnection =
        new IORedis(redisUrl, {
          maxRetriesPerRequest: null
        });

      const eventsConnection =
        new IORedis(redisUrl, {
          maxRetriesPerRequest: null
        });

      const queue = new Queue(
        queueName,
        {
          connection: producerConnection
        }
      );

      const queueEvents =
        new QueueEvents(
          queueName,
          {
            connection: eventsConnection
          }
        );

      let processorRuns = 0;

      const worker =
        new Worker(
          queueName,

          async () => {
            processorRuns++;

            /*
             * Intentionally fail every attempt.
             */
            throw new Error(
              "Intentional retry test failure"
            );
          },

          {
            connection: workerConnection,
            concurrency: 1
          }
        );

      try {
        await queueEvents.waitUntilReady();
        await worker.waitUntilReady();

        const job = await queue.add(
          "always-fail",
          {},
          {
            attempts: 3,

            /*
             * Short delay keeps the automated
             * test fast. Production uses the
             * longer exponential backoff.
             */
            backoff: {
              type: "fixed",
              delay: 50
            },

            removeOnFail: false
          }
        );

        /*
         * waitUntilFinished rejects when the
         * job permanently fails.
         */
        await expect(
          job.waitUntilFinished(
            queueEvents,
            5000
          )
        ).rejects.toThrow(
          "Intentional retry test failure"
        );

        const storedJob =
          await queue.getJob(job.id!);

        /*
         * The processor should have actually
         * executed three separate times.
         */
        expect(processorRuns).toBe(3);

        expect(
          storedJob?.attemptsMade
        ).toBe(3);

        expect(
          await storedJob?.getState()
        ).toBe("failed");
      } finally {
        /*
         * Important test cleanup so Vitest
         * doesn't stay alive with Redis sockets.
         */
        await worker.close();

        await queue.obliterate({
          force: true
        });

        await queueEvents.close();
        await queue.close();

        await producerConnection.quit();
        await workerConnection.quit();
        await eventsConnection.quit();
      }
    },
    10000
  );
});