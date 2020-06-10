import * as simpleGit from "simple-git/promise";
let git: simpleGit.SimpleGit;

export class FileEffortMap {
  [fileName: string]: { changes: number; frequency: ChangeFrequency };
}

interface FileChangesMap {
  [fileName: string]: number;
}

interface Stats {
  max: number;
  min: number;
}

export enum ChangeFrequency {
  Rare = "Rare",
  Occasional = "Occasional",
  Often = "Often",
}

export async function getEffort(path: string): Promise<FileEffortMap | null> {
  git = simpleGit(path);
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    return null;
  }
  const { map, stats } = await getMapAndStats();
  return Object.keys(map).reduce((acc: any, curr) => {
    const changes = acc[curr];
    acc[curr] = { changes, frequency: assignFrequency(stats, changes) };
    return acc;
  }, map);
}

function assignFrequency(stats: Stats, changes: number) {
  const { low, medium } = computeBuckets(stats);
  if (changes < low) {
    return ChangeFrequency.Rare;
  } else if (changes < medium) {
    return ChangeFrequency.Occasional;
  } else {
    return ChangeFrequency.Often;
  }
}

function computeBuckets(stats: Stats) {
  const range = stats.max - stats.min;
  const divider = range / 3;
  return {
    low: stats.min + divider,
    medium: stats.min + divider * 2,
    high: stats.min + divider * 3,
  };
}

interface FileChanges {
  map: FileChangesMap;
  stats: Stats;
}

async function getMapAndStats(): Promise<FileChanges> {
  // git log --name-status $*| grep -E '^[A-Z]\s+'| cut -c3-500| sort| uniq -c| grep -vE '^ {6}1 '| sort -n
  const log = (
    await git.raw(["log", "--name-only", "--pretty=format:"])
  ).trim();
  return log
    .split("\n")
    .filter((line) => line !== "")
    .reduce(
      (acc, curr) => {
        const { map, stats } = acc;
        if (!map[curr]) {
          map[curr] = 0;
        }
        map[curr]++;

        stats.max = Math.max(stats.max, map[curr]);
        stats.min = Math.min(stats.min, map[curr]);
        return { map, stats };
      },
      { map: {}, stats: { max: 0, min: 0 } } as FileChanges
    );
}
