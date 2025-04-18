import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ToastService } from '../util-services';
import { Logger } from '../logger';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

let errorSent = false;

@Injectable()
export class ErrorHandlerService extends ErrorHandler {
  private toastService?: ToastService;
  private logger?: Logger;

  constructor(private injector: Injector) {
    super();
  }

  override handleError(error: any) {
    if (
      !error ||
      (typeof error === 'object' &&
        typeof error.message === 'string' &&
        error.message.length === 0)
    ) {
      return super.handleError(error);
    }

    if (this.isScheduled()) {
      this.getToastsService().showWarning(
        'The service is temporarily unavailable.',
        { pause: true },
      );
      return super.handleError(error);
    }

    if (!errorSent) {
      errorSent = true;
      const location = this.injector.get(LocationStrategy);
      const url =
        location instanceof PathLocationStrategy ? location.path() : '';
      this.getLogger().error('Unexpected error', {
        clientPath: url,
        error,
        errorMsg: error?.toString(),
      });
    }

    this.getToastsService().showGenericError({ pause: true });
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
