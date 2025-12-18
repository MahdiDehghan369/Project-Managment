const createError = require("./createError");

class Transaction {
  constructor() {
    this.steps = [];
    this.executed = [];
  }

  addStep(name, executeFn, rollbackFn) {
    this.steps.push({ name, executeFn, rollbackFn });
  }

  async executeSequential() {
    try {
      for (const step of this.steps) {
        this.executed.push(step);
        await step.executeFn();
      }
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }

  async executeParallel() {
    const executed = [];
    try {
      const tasks = this.steps.map((step) => {
        return (async () => {
          await step.executeFn();
          executed.push(step);
        })();
      });

      const results = await Promise.allSettled(tasks);
      const hasError = results.find((r) => r.status === "rejected");
      this.executed = executed;
      console.log(hasError)
      if (hasError) {
        await this.rollback();
        throw createError(hasError.reason.statusCode || 500 , hasError.reason.message)
      }
    } catch (error) {
      this.executed = executed;
      await this.rollback();
      throw error;
    }
  }

  async rollback() {
    console.log(this.executed)
    await Promise.allSettled(
      this.executed
        .reverse()
        .map((step) => step.rollbackFn && step.rollbackFn())
    );
  }
}

module.exports = Transaction