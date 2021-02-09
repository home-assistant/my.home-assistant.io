import { DEFAULT_HASS_URL, HASS_URL } from "../const";

export interface DiscoveryInfo {
  base_url: string;
  external_url: string | null;
  installation_type: string;
  internal_url: string;
  location_name: string;
  requires_api_password: boolean;
  uuid: string;
  version: string;
}

const getHassInfo = async (
  host: string,
  signal?: AbortSignal
): Promise<DiscoveryInfo> => {
  const resp = await fetch(`${host}/api/discovery_info`, { signal });
  if (resp.status !== 200) {
    const err = new Error("Invalid status");
    (err as any).resp = resp;
    throw err;
  }
  return await resp.json();
};

export const getHassInfoWithTimeout = async (host: string, timeout: number) => {
  const controller =
    "AbortController" in window ? new AbortController() : undefined;

  const result = await Promise.race([
    // getHassInfo(host, controller?.signal),
    new Promise<null>((resolve) =>
      setTimeout(() => {
        if (controller) {
          controller.abort();
        }
        resolve(null);
      }, timeout)
    ),
  ]);

  if (!result) {
    throw new Error("Timeout fetching host info");
  }

  return result;
};

interface Loading {
  url: string;
  isLoading: true;
  loadingFailed: false;
  configuredUrl: boolean;
}

interface LoadingFailed {
  url: string;
  isLoading: false;
  loadingFailed: true;
  configuredUrl: boolean;
}

interface LoadingSuccess {
  url: string;
  isLoading: false;
  loadingFailed: false;
  configuredUrl: boolean;
  discoveryInfo: DiscoveryInfo;
}

export type LoadingState = Loading | LoadingFailed | LoadingSuccess;

export const subscribeHassInfo = async (
  callback: (state: LoadingState) => void
) => {
  const userUrl = localStorage.getItem(HASS_URL);

  const configuredUrl = Boolean(userUrl);
  const url = userUrl || DEFAULT_HASS_URL;

  callback({
    url,
    isLoading: true,
    loadingFailed: false,
    configuredUrl,
  });

  try {
    const discoveryInfo = await getHassInfoWithTimeout(url, 3000);
    callback({
      url,
      isLoading: false,
      loadingFailed: false,
      configuredUrl,
      discoveryInfo,
    });
  } catch (err) {
    callback({
      url,
      isLoading: false,
      loadingFailed: true,
      configuredUrl,
    });
  }
};
