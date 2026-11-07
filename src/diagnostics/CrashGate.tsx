import React from 'react';
import { CrashScreen } from './CrashScreen';
import {
  clearPendingReport,
  installGlobalHandler,
  loadPendingReport,
  reportFromBoundary,
} from './crashReporter';
import { CrashReport } from './report';

installGlobalHandler();

type State = { report: CrashReport | null };

/** Shows a render-time error, or the previous launch's saved crash, with a send button. */
export class CrashGate extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { report: null };

  static getDerivedStateFromError(error: unknown): State {
    return { report: reportFromBoundary(error) };
  }

  componentDidMount() {
    void loadPendingReport().then((report) => {
      if (report && !this.state.report) this.setState({ report });
    });
  }

  private dismiss = () => {
    void clearPendingReport();
    this.setState({ report: null });
  };

  render() {
    if (this.state.report) {
      return <CrashScreen report={this.state.report} onDismiss={this.dismiss} />;
    }
    return this.props.children;
  }
}
