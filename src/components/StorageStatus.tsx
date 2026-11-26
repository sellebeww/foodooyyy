// src/components/StorageStatus.tsx
import { useEffect, useState } from "react";
import { useToast } from "../app/toast.ts";
import {
  getStorageStatus,
  requestPersistentStorage,
  type StorageStatus as Status,
} from "../db/repositories.ts";
import { useT, type MessageKey } from "../i18n/index.ts";
import { Button } from "./Button.tsx";

const STATUS_TEXT: Record<Status, MessageKey> = {
  kept: "settings.data.storageKept",
  atRisk: "settings.data.storageAtRisk",
  unknown: "settings.data.storageUnknown",
};

function storageManager(): StorageManager | undefined {
  return typeof navigator === "undefined" ? undefined : navigator.storage;
}

export function StorageStatus() {
  const t = useT();
  const toast = useToast();
  const [status, setStatus] = useState<Status | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    let active = true;
    void getStorageStatus(storageManager()).then((value) => {
      if (active) {
        setStatus(value);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (status === null) {
    return null;
  }

  async function keep() {
    setAsking(true);
    const granted = await requestPersistentStorage(storageManager());
    setStatus(await getStorageStatus(storageManager()));
    setAsking(false);
    toast.show(
      t(granted ? "settings.data.keepGranted" : "settings.data.keepRefused"),
    );
  }

  return (
    <div className="storage-status">
      <p role="status">{t(STATUS_TEXT[status])}</p>
      {status === "atRisk" ? (
        <Button
          variant="secondary"
          disabled={asking}
          onClick={() => {
            void keep();
          }}
        >
          {t("settings.data.keep")}
        </Button>
      ) : null}
    </div>
  );
}
