import { SaveProvider } from "./types";

export class CloudSaveProvider implements SaveProvider {
  async save(data: any): Promise<void> {
    throw new Error("save to cloud provider error.");
    // await ygProvider.saveData(data, true);
  }

  async load(): Promise<any | null> {
    throw new Error("load from cloud provider error.");
    // return await ygProvider.loadData();
  }

  async clear(): Promise<void> {
    throw new Error("clear cloud provider error.");
    // await ygProvider.clearData();
  }
}
