import { execSync } from 'child_process'

// Get currently staged files
const stagedFiles: string[] = execSync('git diff --name-only --cached').toString().split(/\n/).filter(Boolean)

// Format files
execSync(`yarn nx format --files ${[...stagedFiles, 'tsconfig.base.json', 'workspace.json', 'nx.json'].join(',')}`)

// Get unstaged files after commit
const unstagedFiles: string[] = execSync('git diff --name-only').toString().split(/\n/).filter(Boolean)

// Stage files that have been staged before again
for (const stagedFile of stagedFiles) {
  if (unstagedFiles.includes(stagedFile)) {
    execSync(`git add ${stagedFile}`)
  }
}
