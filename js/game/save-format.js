/* MILE ZERO — Save format version and migrations.
   Declarations only: nothing here runs at load time (see js/game/main.js).

   Every saved state (slots 1–3, weekly checkpoints, backup files) carries
   `schemaVersion`. When the shape of the game state `s` changes:
     1. bump SAVE_SCHEMA_VERSION,
     2. add a step to SAVE_MIGRATIONS that upgrades the previous version by one,
     3. keep restoreState() tolerant of missing fields (it still fills defaults).

   Version history
     1  Saves written before versioning existed (builds up to MZ_v356). They have no
        schemaVersion field and are treated as version 1.
     2  Adds `schemaVersion` and `savedBy` (the build that wrote the save). No other change. */
'use strict';

const SAVE_SCHEMA_VERSION = 2;

const SAVE_MIGRATIONS = {
  // 1 -> 2: nothing to convert; restoreState() already fills defaults for older saves.
  1: state => state,
};

function mzBuildId() {
  return document.querySelector('meta[name="mile-zero-build"]')?.content || 'unknown';
}

function mzSaveVersionOf(state) {
  const v = state && state.schemaVersion;
  return Number.isInteger(v) && v > 0 ? v : 1;
}

function mzSaveTooNew(state) {
  return mzSaveVersionOf(state) > SAVE_SCHEMA_VERSION;
}

const MZ_SAVE_TOO_NEW_MESSAGE = '더 새로운 버전의 게임에서 만든 저장 데이터입니다. 최신 버전에서 불러와 주세요.';

// Returns a copy upgraded to SAVE_SCHEMA_VERSION. Throws for saves from a newer build.
function mzMigrateSave(state) {
  let version = mzSaveVersionOf(state);
  if (version > SAVE_SCHEMA_VERSION) throw new Error(MZ_SAVE_TOO_NEW_MESSAGE);
  let out = JSON.parse(JSON.stringify(state));
  while (version < SAVE_SCHEMA_VERSION) {
    const step = SAVE_MIGRATIONS[version];
    if (!step) throw new Error('저장 데이터 형식 ' + version + '을(를) 변환할 수 없습니다.');
    out = step(out) || out;
    version++;
  }
  out.schemaVersion = SAVE_SCHEMA_VERSION;
  return out;
}

// Adds version metadata to a state snapshot that is about to be written.
function mzStampSave(snapshot) {
  return { ...snapshot, schemaVersion: SAVE_SCHEMA_VERSION, savedBy: mzBuildId() };
}
