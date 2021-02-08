export interface DiscoveryInfo {
  base_url: string
  external_url: string | null
  installation_type: string
  internal_url: string
  location_name: string
  requires_api_password: boolean
  uuid: string
  version: string
}

export const getHassInfo = async (host: string): Promise<DiscoveryInfo> => {
  const resp = await fetch(`${host}/api/discovery_info`);
  if (resp.status !== 200) {
    const err = new Error("Invalid status");
    (err as any).resp = resp;
    throw err;
  }
  return await resp.json()
}
