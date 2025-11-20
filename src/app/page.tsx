'use client';

import React, { useRef, useState } from 'react';
import EspController from '@/app/EspController';
import Step from '@/components/Step/Step';
import { getFirmware } from '@/app/firmwareFetcher';
import styles from './page.module.css';

const downloadData = (data: Uint8Array, fileName: string, mimeType: string) => {
  // @ts-expect-error types say no, but browser says yes
  const blob = new Blob([data], {
    type: mimeType,
  });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.style = 'display: none';
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

type StepData = {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  progress: number;
  errorMessage?: string;
}[];

export default function Home() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [stepData, setStepData] = useState<StepData>([]);

  const appendStep = (step: StepData[number]) => {
    setStepData((oldStepData) => [...oldStepData, step]);
  };
  const updateStepData = (step: string, data: Partial<StepData[number]>) => {
    setStepData((oldStepData) =>
      oldStepData.map((oldData) => {
        if (oldData.name === step) {
          return { ...oldData, ...data };
        }
        return oldData;
      }),
    );
  };
  const clearSteps = () => setStepData([]);

  const flashEnglishFirmware = async () => {
    clearSteps();

    appendStep({ name: 'Connect device', status: 'running', progress: -1 });
    const espController = await EspController.fromRequestedDevice().catch(
      (e) => {
        updateStepData('Connect device', {
          status: 'failed',
          errorMessage: e.toString(),
        });
        throw e;
      },
    );
    await espController.connect().catch((e) => {
      updateStepData('Connect device', {
        status: 'failed',
        errorMessage: e.toString(),
      });
      throw e;
    });
    updateStepData('Connect device', { status: 'success' });

    appendStep({ name: 'Download firmware', status: 'running', progress: -1 });
    const firmwareFile = await getFirmware('3.0.8').catch((e) => {
      updateStepData('Download firmware', {
        status: 'failed',
        errorMessage: e.toString(),
      });
      throw e;
    });
    updateStepData('Download firmware', { status: 'success' });

    appendStep({ name: 'Flash OTA partition', status: 'running', progress: 0 });
    await espController
      .writeEmptyOtaPartition((_, p, t) =>
        updateStepData('Flash OTA partition', { progress: p / t }),
      )
      .catch((e) => {
        updateStepData('Flash OTA partition', {
          status: 'failed',
          errorMessage: e.toString(),
        });
        throw e;
      });
    updateStepData('Flash OTA partition', { status: 'success' });

    appendStep({
      name: 'Flash OTA_0 partition',
      status: 'running',
      progress: 0,
    });
    await espController
      .writeOta0(firmwareFile, (_, p, t) =>
        updateStepData('Flash OTA_0 partition', { progress: p / t }),
      )
      .catch((e) => {
        updateStepData('Flash OTA_0 partition', {
          status: 'failed',
          errorMessage: e.toString(),
        });
        throw e;
      });
    updateStepData('Flash OTA_0 partition', { status: 'success' });

    appendStep({ name: 'Reset device', status: 'running', progress: -0 });
    await espController.disconnect().catch((e) => {
      updateStepData('Reset device', {
        status: 'failed',
        errorMessage: e.toString(),
      });
      throw e;
    });
    updateStepData('Reset device', { status: 'success' });
  };

  const saveFullFlash = async () => {
    clearSteps();

    appendStep({ name: 'Connect device', status: 'running', progress: -1 });
    const espController = await EspController.fromRequestedDevice().catch(
      (e) => {
        updateStepData('Connect device', {
          status: 'failed',
          errorMessage: e.toString(),
        });
        throw e;
      },
    );
    await espController.connect().catch((e) => {
      updateStepData('Connect device', {
        status: 'failed',
        errorMessage: e.toString(),
      });
      throw e;
    });
    updateStepData('Connect device', { status: 'success' });

    appendStep({ name: 'Read flash', status: 'running', progress: 0 });
    const firmwareFile = await espController
      .readFullFlash((_, p, t) =>
        updateStepData('Read flash', { progress: p / t }),
      )
      .catch((e) => {
        updateStepData('Read flash', {
          status: 'failed',
          errorMessage: e.toString(),
        });
        throw e;
      });
    updateStepData('Read flash', { status: 'success' });

    downloadData(firmwareFile, 'flash.bin', 'application/octet-stream');
  };

  const writeFullFlash = async () => {
    clearSteps();

    appendStep({ name: 'Read file', status: 'running', progress: -1 });
    const file = fileInput.current?.files?.[0];
    if (!file) {
      updateStepData('Read file', {
        status: 'failed',
        errorMessage: 'File could not be found',
      });
      return;
    }
    const fileData = new Uint8Array(await file.arrayBuffer());
    updateStepData('Read file', { status: 'success' });

    appendStep({ name: 'Connect device', status: 'running', progress: -1 });
    const espController = await EspController.fromRequestedDevice().catch(
      (e) => {
        updateStepData('Connect device', {
          status: 'failed',
          errorMessage: e.toString(),
        });
        throw e;
      },
    );
    await espController.connect().catch((e) => {
      updateStepData('Connect device', {
        status: 'failed',
        errorMessage: e.toString(),
      });
      throw e;
    });
    updateStepData('Connect device', { status: 'success' });

    appendStep({ name: 'Write flash', status: 'running', progress: 0 });
    await espController
      .writeFullFlash(fileData, (_, p, t) =>
        updateStepData('Write flash', { progress: p / t }),
      )
      .catch((e) => {
        updateStepData('Write flash', {
          status: 'failed',
          errorMessage: e.toString(),
        });
        throw e;
      });
    updateStepData('Write flash', { status: 'success' });
  };

  return (
    <main className={styles.page}>
      <h1>Xteink English Firmware Flasher</h1>
      <section className={styles.section}>
        <h2>Full flash controls</h2>
        <button type="button" onClick={saveFullFlash}>
          Save full flash
        </button>
        <div style={{ display: 'flex' }}>
          <input ref={fileInput} type="file" />
          <button
            type="button"
            style={{ flexGrow: 1 }}
            onClick={writeFullFlash}
          >
            Write full flash from file
          </button>
        </div>
      </section>
      <section className={styles.section}>
        <h2>OTA fast flash controls</h2>
        <button type="button" onClick={flashEnglishFirmware}>
          Flash English firmware (3.0.8) via OTA
        </button>
      </section>
      <section className={styles.section}>
        {stepData.map((step) => (
          <Step
            key={step.name}
            name={step.name}
            progress={step.progress}
            status={step.status}
            errorMessage={step.errorMessage}
          />
        ))}
      </section>
    </main>
  );
}
