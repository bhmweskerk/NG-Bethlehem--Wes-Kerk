import {Component, ErrorInfo, ReactNode} from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {hasError: false, message: ''};
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {hasError: true, message: error.message || 'Onverwagte fout'};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Programfout:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBF9F5] flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-stone-200 rounded-xl p-8">
            <p className="text-xs font-medium text-stone-500">NG Kerk Bethlehem-Wes</p>
            <h1 className="font-serif text-2xl font-medium text-stone-950 mt-2">
              Iets het skeefgeloop
            </h1>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              Die portaal het &apos;n tydelike fout ondervind tydens dataverwerking. Herlaai
              asseblief die bladsy om voort te gaan.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2.5 text-sm font-semibold text-white bg-[#1B4332] rounded-lg hover:bg-[#143326] transition-colors cursor-pointer"
            >
              Herlaai Bladsy
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
