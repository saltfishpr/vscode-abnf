import * as vscode from 'vscode';

enum LogLevel {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
}

class Logger {
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel('ABNF');
    this.logLevel = LogLevel.Info;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Debug) {
      const formatted = this.formatMessage('DEBUG', message);
      this.outputChannel.appendLine(formatted);
      if (args.length > 0) {
        this.outputChannel.appendLine(JSON.stringify(args, null, 2));
      }
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Info) {
      const formatted = this.formatMessage('INFO', message);
      this.outputChannel.appendLine(formatted);
      if (args.length > 0) {
        this.outputChannel.appendLine(JSON.stringify(args, null, 2));
      }
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.logLevel <= LogLevel.Warn) {
      const formatted = this.formatMessage('WARN', message);
      this.outputChannel.appendLine(formatted);
      if (args.length > 0) {
        this.outputChannel.appendLine(JSON.stringify(args, null, 2));
      }
    }
  }

  error(message: string, error?: unknown): void {
    if (this.logLevel <= LogLevel.Error) {
      const formatted = this.formatMessage('ERROR', message);
      this.outputChannel.appendLine(formatted);
      if (error) {
        if (error instanceof Error) {
          this.outputChannel.appendLine(`  ${error.message}`);
          this.outputChannel.appendLine(`  Stack: ${error.stack}`);
        } else {
          this.outputChannel.appendLine(JSON.stringify(error, null, 2));
        }
      }
    }
  }

  show(): void {
    this.outputChannel.show();
  }

  dispose(): void {
    this.outputChannel.dispose();
  }
}

export const logger = new Logger();
