export interface TestArtifact {
  startup(): Promise<boolean> | boolean;
  shutdown(): Promise<boolean> | boolean;
}
