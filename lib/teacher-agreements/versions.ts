import "server-only";

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export type TeacherAgreementDefinition = {
  version: string;
  frameworkVersion: string;
  policyVersion: string;
  content: string;
  contentHash: string;
};

function loadAgreementContent(filename: string) {
  const filePath = path.join(
    process.cwd(),
    "lib",
    "teacher-agreements",
    filename
  );

  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n").trim();
}

function hashAgreementContent(content: string) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

const v1_1Content = loadAgreementContent("v1.1.md");
// This released version is fixed. Changes belong in a new version.
if (hashAgreementContent(v1_1Content) !== "0080bb254b9fccfd0f0d3d978ef2e8f27294ce77c0a562ca5d8c3b624e452b75") {
  throw new Error("Teacher Agreement v1.1 source does not match its released content.");
}

export const TEACHER_AGREEMENT_V1_1: TeacherAgreementDefinition = {
  version: "1.1",
  frameworkVersion: "1.0",
  policyVersion: "1.0",
  content: v1_1Content,
  contentHash: hashAgreementContent(v1_1Content),
};

export const CURRENT_TEACHER_AGREEMENT = TEACHER_AGREEMENT_V1_1;
