export class HIDDevice {
  constructor(device) {
    this.device = device;
    this.queue = [];
    this.isProcessing = false;
  }

  close() {
    this.device.close();
  }

  async sendFeatureReport(reportId, report) {
    return this.device.sendFeatureReport(reportId, report);
  }

  async receiveFeatureReport(reportId) {
    return this.device.receiveFeatureReport(reportId);
  }

  // we're using a queue to process packets sent to device to ensure
  // that they are processed sequentially (essentially we want to be sure
  // that we don't miss any receiving packets because we sent another before we
  // we could get the result of the prior)
  async enqueue(operation) {
    this.queue.push(operation);
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  async processQueue() {
    while (this.queue.length > 0) {
      this.isProcessing = true;
      const operation = this.queue.shift();
      await operation(this.device);
    }
    this.isProcessing = false;
  }
}