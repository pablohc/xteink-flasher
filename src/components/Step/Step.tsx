import React from 'react';
import styles from './styles.module.css';

interface StepProps {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  progress: number;
  errorMessage?: string;
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div style={{ width: 100, background: 'lightgrey', height: 14 }}>
      <div
        style={{
          width: `${Math.round(progress * 10000) / 100}%`,
          transition: 'width',
          height: '100%',
          backgroundColor: 'green',
        }}
      />
    </div>
  );
}

function StepStatus({
  status,
  progress,
}: Pick<StepProps, 'status' | 'progress'>) {
  let statusIcon;
  switch (status) {
    case 'pending':
      statusIcon = <span>P</span>;
      break;
    case 'running':
      statusIcon = <span>Running</span>;
      break;
    case 'success':
      statusIcon = <span>Success</span>;
      break;
    case 'failed':
      statusIcon = <span>Failed</span>;
      break;
    default:
      statusIcon = <span>Unknown status</span>;
      break;
  }

  return (
    <>
      {statusIcon}
      {status === 'running' && progress !== -1 && (
        <ProgressBar progress={progress} />
      )}
    </>
  );
}

export default function Step({
  name,
  status,
  progress,
  errorMessage,
}: StepProps) {
  return (
    <div className={styles.container}>
      <span>{name}:</span>
      <StepStatus status={status} progress={progress} />
      {errorMessage && (
        <span className={styles.errorMessage}>{errorMessage}</span>
      )}
    </div>
  );
}
