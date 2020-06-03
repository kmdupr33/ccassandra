import * as simpleGit from "simple-git/promise";
let git;

export interface FileEffortMap {
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

export async function getEffort(path: string): Promise<FileEffortMap> {
  git = simpleGit(path);
  const files = (await git.raw(["ls-files"])).trim().split("\n");
  const { map, stats } = await getMapAndStats(files);
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

async function getMapAndStats(
  files: string[]
): Promise<{ map: FileChangesMap; stats: Stats }> {
  return await files.reduce(
    async (acc, curr) => {
      const { map, stats } = await acc;
      const log = await git.log({
        file: curr,
      });
      console.log(`log: ${log.total} for file ${curr}`);
      map[curr] = log.total;
      stats.max = Math.max(stats.max, log.total);
      stats.min = Math.min(stats.min, log.total);
      return { map, stats };
    },
    Promise.resolve<{
      stats: {
        max: number;
        min: number;
      };
      map: FileChangesMap;
    }>({ map: {}, stats: { max: 0, min: 0 } })
  );
}
