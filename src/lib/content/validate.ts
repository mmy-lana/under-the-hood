import type { TopicSchema } from './schema';

/**
 * Build-time runtime guard for topic JSON files. Throws with the offending
 * file path so bad content breaks `pnpm build` immediately (not at runtime).
 * Hand-rolled on purpose — the schema is small and we author all content.
 */

const DEPTH_KEYS = ['eli5', 'junior', 'senior', 'underTheHood'] as const;

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => isNonEmptyString(entry))
  );
}

function fail(path: string, message: string): never {
  throw new Error(`Invalid topic content in "${path}": ${message}`);
}

export function assertValidTopic(raw: unknown, path: string): asserts raw is TopicSchema {
  if (!isRecord(raw)) fail(path, 'root must be an object');
  if (!isNonEmptyString(raw['id'])) fail(path, 'id must be a non-empty string');
  if (!isNonEmptyString(raw['title'])) fail(path, 'title must be a non-empty string');
  if (!isNonEmptyString(raw['subcategory']))
    fail(path, 'subcategory must be a non-empty string');
  if (!isNonEmptyString(raw['lastUpdated']))
    fail(path, 'lastUpdated must be a non-empty string');

  const category = raw['category'];
  if (category !== 'frontend' && category !== 'backend')
    fail(path, `category must be 'frontend' or 'backend', got ${String(category)}`);

  if (raw['versionContext'] !== undefined && !isNonEmptyString(raw['versionContext']))
    fail(path, 'versionContext, when present, must be a non-empty string');

  if (!isStringArray(raw['tags']) || (raw['tags'] as string[]).length < 3)
    fail(path, 'tags must be an array of at least 3 non-empty strings');
  if (!isStringArray(raw['prerequisites']) || (raw['prerequisites'] as string[]).length < 1)
    fail(path, 'prerequisites must be an array of at least 1 non-empty string');

  // progressiveExplaining: all 4 depth tiers non-empty.
  const progressive = raw['progressiveExplaining'];
  if (!isRecord(progressive)) fail(path, 'progressiveExplaining must be an object');
  for (const key of DEPTH_KEYS) {
    if (!isNonEmptyString(progressive[key]))
      fail(path, `progressiveExplaining.${key} must be a non-empty string`);
  }

  // rosettaStone (optional): non-empty string keys and values.
  const rosetta = raw['rosettaStone'];
  if (rosetta !== undefined) {
    if (!isRecord(rosetta)) fail(path, 'rosettaStone must be an object');
    for (const key of Object.keys(rosetta)) {
      if (!isNonEmptyString(key))
        fail(path, `rosettaStone key must be a non-empty string`);
      if (!isNonEmptyString(rosetta[key]))
        fail(path, `rosettaStone.${key} must be a non-empty string`);
    }
  }

  // codeComparison: both sides complete.
  const codeComparison = raw['codeComparison'];
  if (!isRecord(codeComparison)) fail(path, 'codeComparison must be an object');
  if (!isNonEmptyString(codeComparison['title']))
    fail(path, 'codeComparison.title must be a non-empty string');
  if (!isNonEmptyString(codeComparison['summary']))
    fail(path, 'codeComparison.summary must be a non-empty string');
  assertDiffSide(codeComparison['legacyOrBad'], path, 'legacyOrBad');
  assertDiffSide(codeComparison['modernOrGood'], path, 'modernOrGood');

  // interviewGotchas: EXACTLY 2.
  const gotchas = raw['interviewGotchas'];
  if (!Array.isArray(gotchas) || gotchas.length !== 2)
    fail(path, 'interviewGotchas must be an array of exactly 2 items');
  for (let i = 0; i < gotchas.length; i++) {
    assertGotcha(gotchas[i], path, i);
  }
}

function assertDiffSide(value: unknown, path: string, side: string): void {
  if (!isRecord(value)) fail(path, `codeComparison.${side} must be an object`);
  if (!isNonEmptyString(value['label']))
    fail(path, `codeComparison.${side}.label must be a non-empty string`);
  if (!isNonEmptyString(value['snippet']))
    fail(path, `codeComparison.${side}.snippet must be a non-empty string`);
  const fullFile = value['fullFile'];
  if (!isRecord(fullFile)) fail(path, `codeComparison.${side}.fullFile must be an object`);
  if (!isNonEmptyString(fullFile['filename']))
    fail(path, `codeComparison.${side}.fullFile.filename must be a non-empty string`);
  if (!isNonEmptyString(fullFile['language']))
    fail(path, `codeComparison.${side}.fullFile.language must be a non-empty string`);
  if (!isNonEmptyString(fullFile['code']))
    fail(path, `codeComparison.${side}.fullFile.code must be a non-empty string`);
}

function assertGotcha(value: unknown, path: string, index: number): void {
  if (!isRecord(value)) fail(path, `interviewGotchas[${index}] must be an object`);
  for (const key of ['question', 'contextIntro', 'detailedAnswer', 'trapWarning']) {
    if (!isNonEmptyString(value[key]))
      fail(
        path,
        `interviewGotchas[${index}].${key} must be a non-empty string`
      );
  }
}