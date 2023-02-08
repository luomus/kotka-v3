import { ErrorHandler, Inject, Injectable, Injector, Optional } from '@angular/core';
import { ToastService } from '../toast.service';
import { Logger } from '../logger/logger.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { RESPONSE } from '@nguniversal/express-engine/tokens';

const pauseBeforeResendError = 30000;
let errorSent = false;

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
  private toastService?: ToastService;
  private logger?: Logger;
  private pause = false;

  constructor(
    private injector: Injector,
    @Optional() @Inject(RESPONSE) private response: any,
  ) {
    super();
  }

  override handleError(error: any) {
    if (this.pause || !error || (typeof error === 'object' && typeof error.message === 'string' && error.message.length === 0)) {
      return super.handleError(error);
    }

    // Send error response code so that pages that have errors would not be indexed
    if (this.response) {
      this.response.statusCode = 500;
      this.response.statusMessage = 'Internal Server Error';
    }

    if (this.isScheduled()) {
      this.pauseMessage();
      this.getToastsService().showWarning("The service is temporarily unavailable.");
      return super.handleError(error);
    }

    if (!errorSent) {
      errorSent = true;
      const location = this.injector.get(LocationStrategy);
      const url = location instanceof PathLocationStrategy ? location.path() : '';
      this.getLogger().error('Unexpected error', {clientPath: url, error, errorMsg: error?.toString()});
    }

    this.pauseMessage();
    this.getToastsService().showError("An unexpected error occurred.");
    return super.handleError(error);
  }

  private isScheduled(): boolean {
    const now = new Date();
    if (now.getUTCDay() === 4 && now.getUTCDate() <= 7) {
      const hour = now.getUTCHours();
      if (5 <= hour && hour < 7) {
        return true;
      }
    }
    return false;
  }

  private pauseMessage() {
    this.pause = true;
    setTimeout(() => {
      this.pause = false;
    }, pauseBeforeResendError);
  }

  private getToastsService(): ToastService {
    if (!this.toastService) {
      this.toastService = this.injector.get(ToastService);
    }
    return this.toastService;
  }

  private getLogger(): Logger {
    if (!this.logger) {
      this.logger = this.injector.get(Logger);
    }
    return this.logger;
  }
}
